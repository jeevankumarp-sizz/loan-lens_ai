import { getChatCompletion } from './chatCompletion';

export interface FraudScoringInput {
  assetCategory: string;
  gpsCoords: { lat: number; lng: number } | null;
  gpsExpectedCoords?: { lat: number; lng: number } | null;
  imageMetadata?: {
    fileName: string;
    fileSize: number;
    fileType: string;
    lastModified?: number;
  } | null;
  ocrText?: string | null;
  loanAmount?: number | null;
  imageBase64?: string | null;
}

export interface FraudScoringResult {
  fraudScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  assetDetected: string;
  confidenceScore: number;
  gpsVariance: string;
  gpsMatchStatus: 'Verified' | 'Mismatch' | 'Unable to Verify';
  ocrInvoiceMatch: string;
  ocrMatchStatus: 'Success' | 'Partial' | 'Failed' | 'Not Available';
  duplicateCheckStatus: 'Clean' | 'Suspicious' | 'Duplicate Detected';
  metadataFlags: string[];
  summary: string;
  recommendation: 'Approve' | 'Manual Review' | 'Reject';
}

function computeGpsVarianceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinDLng *
      sinDLng;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

function buildMetadataFlags(input: FraudScoringInput): string[] {
  const flags: string[] = [];
  if (input.imageMetadata) {
    const { fileSize, lastModified } = input.imageMetadata;
    if (fileSize < 50 * 1024) flags.push('Image file size unusually small (<50KB)');
    if (lastModified) {
      const ageMs = Date.now() - lastModified;
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      if (ageDays > 365) flags.push('Image file is older than 1 year');
      if (ageDays > 730) flags.push('Image file is older than 2 years — high risk');
    }
  }
  if (input.gpsCoords && input.gpsExpectedCoords) {
    const dist = computeGpsVarianceKm(input.gpsCoords, input.gpsExpectedCoords);
    if (dist > 50) flags.push(`GPS variance ${dist.toFixed(1)}km — far from loan disbursement site`);
    else if (dist > 10) flags.push(`GPS variance ${dist.toFixed(1)}km — moderate distance from loan site`);
  }
  return flags;
}

/**
 * Extracts the text content from various AI response shapes:
 * - OpenAI: response.choices[0].message.content
 * - Gemini via SDK: response.choices[0].message.content OR response.candidates[0].content.parts[0].text
 * - Plain string
 */
function extractContentFromResponse(response: any): string | null {
  if (!response) return null;

  // Standard OpenAI / LiteLLM shape
  const choiceContent = response?.choices?.[0]?.message?.content;
  if (typeof choiceContent === 'string' && choiceContent.trim()) {
    return choiceContent.trim();
  }

  // Gemini native shape: candidates[0].content.parts[0].text
  const candidateText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof candidateText === 'string' && candidateText.trim()) {
    return candidateText.trim();
  }

  // Gemini alternate: candidates[0].content.parts as array
  const parts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const textPart = parts.find((p: any) => typeof p?.text === 'string');
    if (textPart?.text?.trim()) return textPart.text.trim();
  }

  // Fallback: if response itself is a string
  if (typeof response === 'string' && response.trim()) {
    return response.trim();
  }

  // Last resort: check for text property at top level
  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  return null;
}

/**
 * Robustly extracts a JSON object from AI text output.
 * Handles: raw JSON, markdown fences (```json ... ```), embedded JSON objects, and truncated JSON.
 */
function extractJsonFromText(text: string): Record<string, any> {
  const cleaned = text.trim();

  // 1. Try direct parse
  try {
    let parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch { /* continue */ }

  // 2. Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      let parsed = JSON.parse(fenceMatch[1].trim());
      if (parsed && typeof parsed === 'object') return parsed;
    } catch { /* continue */ }
  }

  // 3. Find the outermost JSON object using brace matching (handles nested objects)
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      let parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch { /* continue */ }
  }

  // 4. Try to fix common JSON issues: trailing commas, single quotes
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidate = cleaned
      .slice(firstBrace, lastBrace + 1)
      .replace(/,\s*([}\]])/g, '$1')   // remove trailing commas
      .replace(/'/g, '"');              // replace single quotes with double
    try {
      let parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch { /* continue */ }
  }

  // 5. Handle truncated JSON: response was cut off mid-stream (token limit hit)
  // Strategy: find the last complete key-value pair, close any open string, then close the object
  if (firstBrace !== -1) {
    let truncated = cleaned.slice(firstBrace);

    // Close any open string: if there's an odd number of unescaped quotes after the last comma,
    // the last value is an unterminated string — close it first
    const lastComma = truncated.lastIndexOf(',');
    const afterLastComma = lastComma !== -1 ? truncated.slice(lastComma) : truncated;
    const unescapedQuotes = (afterLastComma.match(/(?<!\\)"/g) || []).length;
    if (unescapedQuotes % 2 !== 0) {
      // Odd number of quotes → open string; close it, then close the object
      truncated = truncated + '"';
    }

    // Now strip the last incomplete key-value pair if it still won't parse
    // by trimming back to the last comma
    if (lastComma !== -1) {
      const withoutLast = truncated.slice(0, lastComma) + '}';
      const fixed = withoutLast
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"');
      try {
        let parsed = JSON.parse(fixed);
        if (parsed && typeof parsed === 'object') {
          console.warn('Recovered partial JSON (truncated last field). Some fields may use defaults.');
          return parsed;
        }
      } catch { /* continue */ }
    }

    // Try closing the object as-is (after string close)
    const closed = truncated + '}';
    const fixed = closed
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/'/g, '"');
    try {
      let parsed = JSON.parse(fixed);
      if (parsed && typeof parsed === 'object') {
        console.warn('Recovered partial JSON from truncated AI response. Some fields may use defaults.');
        return parsed;
      }
    } catch { /* continue */ }
  }

  throw new Error(`Could not parse AI response as JSON. Raw response: ${text.slice(0, 200)}`);
}

export async function runFraudScoring(
  input: FraudScoringInput
): Promise<FraudScoringResult> {
  const metadataFlags = buildMetadataFlags(input);

  let gpsVarianceText = 'GPS not available';
  let gpsMatchStatus: FraudScoringResult['gpsMatchStatus'] = 'Unable to Verify';
  if (input.gpsCoords && input.gpsExpectedCoords) {
    const dist = computeGpsVarianceKm(input.gpsCoords, input.gpsExpectedCoords);
    gpsVarianceText = `${dist.toFixed(2)}km from loan disbursement site`;
    gpsMatchStatus = dist <= 20 ? 'Verified' : 'Mismatch';
  } else if (input.gpsCoords) {
    gpsVarianceText = `${input.gpsCoords.lat.toFixed(4)}N, ${input.gpsCoords.lng.toFixed(4)}E — no reference point`;
    gpsMatchStatus = 'Unable to Verify';
  }

  const systemPrompt = `You are an AI fraud detection engine for a government loan utilization verification platform called LoanLens AI.
Your task is to analyze beneficiary asset submission data and produce a structured fraud risk assessment.
CRITICAL INSTRUCTION: You must respond with ONLY a valid JSON object. Do NOT use markdown formatting, do NOT use code fences, do NOT add any explanation or text before or after the JSON. Start your response with { and end with }.`;

  const userPrompt = `Analyze the following beneficiary asset submission for fraud risk:

ASSET CATEGORY: ${input.assetCategory}
GPS COORDINATES: ${input.gpsCoords ? `${input.gpsCoords.lat.toFixed(6)}N, ${input.gpsCoords.lng.toFixed(6)}E` : 'Not captured'}
GPS VARIANCE: ${gpsVarianceText}
OCR EXTRACTED TEXT: ${input.ocrText || 'Not available'}
LOAN AMOUNT: ${input.loanAmount ? `Rs.${input.loanAmount}` : 'Not provided'}
IMAGE METADATA FLAGS: ${metadataFlags.length > 0 ? metadataFlags.join('; ') : 'None detected'}
IMAGE FILE: ${input.imageMetadata ? `${input.imageMetadata.fileName} (${(input.imageMetadata.fileSize / 1024).toFixed(1)}KB, ${input.imageMetadata.fileType})` : 'Not available'}

Respond with ONLY this JSON object (no markdown, no code fences, no extra text):
{"fraudScore":50,"riskLevel":"Medium","assetDetected":"short description","confidenceScore":75,"gpsVariance":"short summary max 60 chars","gpsMatchStatus":"Unable to Verify","ocrInvoiceMatch":"short summary","ocrMatchStatus":"Not Available","duplicateCheckStatus":"Clean","metadataFlags":[],"summary":"1-2 sentence summary","recommendation":"Manual Review"}

Replace all values with your actual analysis. STRICT RULES:
- fraudScore: integer 0-100 (0-20=Low, 21-50=Medium, 51-75=High, 76-100=Critical)
- riskLevel: EXACTLY one of: "Low", "Medium", "High", "Critical" - gpsMatchStatus: EXACTLY one of:"Verified", "Mismatch", "Unable to Verify"
- ocrMatchStatus: EXACTLY one of: "Success", "Partial", "Failed", "Not Available" - duplicateCheckStatus: EXACTLY one of:"Clean", "Suspicious", "Duplicate Detected" - recommendation: EXACTLY one of:"Approve", "Manual Review", "Reject"
- metadataFlags: array of short strings (can be empty [])
- gpsVariance: KEEP UNDER 60 CHARACTERS — e.g. "795km mismatch — high risk" NOT a long sentence
- assetDetected: KEEP UNDER 80 CHARACTERS
- ocrInvoiceMatch: KEEP UNDER 80 CHARACTERS
- summary: KEEP UNDER 150 CHARACTERS
- If GPS variance is over 50km, increase fraud score significantly
- When in doubt, use "Manual Review" as recommendation`;

  // Build messages with optional image
  const userContent: any[] = [{ type: 'text', text: userPrompt }];

  if (input.imageBase64) {
    const match = input.imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const mimeType = match[1];
      const base64Data = match[2];
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`,
        },
      });
    }
  }

  const messages: Array<{ role: 'system' | 'user'; content: any }> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: input.imageBase64 ? userContent : userPrompt },
  ];

  let response: any;
  try {
    response = await getChatCompletion('GEMINI', 'gemini/gemini-2.5-flash', messages, {
      max_tokens: 2000,
    });
  } catch (e: any) {
    const msg: string = e?.message || '';
    const isTransient =
      msg.includes('503') ||
      msg.includes('502') ||
      msg.includes('529') ||
      msg.includes('overloaded') ||
      msg.includes('unavailable') ||
      msg.includes('Service Unavailable');
    if (isTransient) {
      console.warn('gemini-2.5-flash unavailable, falling back to gemini-1.5-flash...');
      response = await getChatCompletion('GEMINI', 'gemini/gemini-1.5-flash', messages, {
        max_tokens: 2000,
      });
    } else {
      throw e;
    }
  }

  // Extract text content from whatever shape the response comes in
  const raw = extractContentFromResponse(response);

  if (!raw) {
    console.error('Empty or unrecognized AI response shape:', JSON.stringify(response, null, 2));
    throw new Error('Empty response from AI model — could not extract content');
  }

  let parsed: Record<string, any>;
  try {
    parsed = extractJsonFromText(raw);
  } catch (parseErr: any) {
    console.error('JSON parse failed. Raw AI response:', raw);
    throw new Error(`Could not parse AI response as JSON: ${parseErr.message}`);
  }

  // Validate and apply safe defaults for every field
  const safeResult: FraudScoringResult = {
    fraudScore: typeof parsed.fraudScore === 'number' ? Math.min(100, Math.max(0, parsed.fraudScore)) : 50,
    riskLevel: (['Low', 'Medium', 'High', 'Critical'] as const).includes(parsed.riskLevel)
      ? parsed.riskLevel as FraudScoringResult['riskLevel']
      : 'Medium',
    assetDetected: typeof parsed.assetDetected === 'string' && parsed.assetDetected
      ? parsed.assetDetected
      : input.assetCategory,
    confidenceScore: typeof parsed.confidenceScore === 'number' ? Math.min(100, Math.max(0, parsed.confidenceScore)) : 70,
    gpsVariance: gpsVarianceText,
    gpsMatchStatus,
    ocrInvoiceMatch: typeof parsed.ocrInvoiceMatch === 'string' && parsed.ocrInvoiceMatch
      ? parsed.ocrInvoiceMatch
      : 'Not analyzed',
    ocrMatchStatus: (['Success', 'Partial', 'Failed', 'Not Available'] as const).includes(parsed.ocrMatchStatus)
      ? parsed.ocrMatchStatus as FraudScoringResult['ocrMatchStatus']
      : 'Not Available',
    duplicateCheckStatus: (['Clean', 'Suspicious', 'Duplicate Detected'] as const).includes(parsed.duplicateCheckStatus)
      ? parsed.duplicateCheckStatus as FraudScoringResult['duplicateCheckStatus']
      : 'Clean',
    metadataFlags: Array.isArray(parsed.metadataFlags)
      ? parsed.metadataFlags.filter((f: any) => typeof f === 'string')
      : [],
    summary: typeof parsed.summary === 'string' && parsed.summary
      ? parsed.summary
      : 'AI assessment completed. Please review the submission manually.',
    recommendation: (['Approve', 'Manual Review', 'Reject'] as const).includes(parsed.recommendation)
      ? parsed.recommendation as FraudScoringResult['recommendation']
      : 'Manual Review',
  };

  // Merge computed metadata flags with AI-detected ones (deduplicated)
  const allFlags = Array.from(new Set([...metadataFlags, ...safeResult.metadataFlags]));

  return { ...safeResult, metadataFlags: allFlags };
}
