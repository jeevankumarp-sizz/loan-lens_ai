/**
 * fraudScoring.ts — Hardened AI fraud scoring engine
 *
 * Changes from original:
 * 1. Uses new /api/ai/verify-asset route (direct Gemini REST, no LiteLLM)
 * 2. Strips image if base64 > 900KB to prevent Gemini 400 errors
 * 3. Comprehensive fallback mock response when AI fails
 * 4. Proper TypeScript types — no unsafe `any`
 * 5. Detailed server/client logging
 */

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
  isFallback?: boolean;
}

// ─── GPS helpers ──────────────────────────────────────────────────────────────

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
      const ageDays = (Date.now() - lastModified) / (1000 * 60 * 60 * 24);
      if (ageDays > 730) flags.push('Image file is older than 2 years — high risk');
      else if (ageDays > 365) flags.push('Image file is older than 1 year');
    }
  }
  if (input.gpsCoords && input.gpsExpectedCoords) {
    const dist = computeGpsVarianceKm(input.gpsCoords, input.gpsExpectedCoords);
    if (dist > 50) flags.push(`GPS variance ${dist.toFixed(1)}km — far from loan site`);
    else if (dist > 10) flags.push(`GPS variance ${dist.toFixed(1)}km — moderate distance`);
  }
  return flags;
}

// ─── Fallback mock response ───────────────────────────────────────────────────

function buildFallbackResult(input: FraudScoringInput): FraudScoringResult {
  console.warn('[FraudScoring] Using fallback mock result — AI unavailable');
  return {
    fraudScore: 45,
    riskLevel: 'Medium',
    assetDetected: input.assetCategory,
    confidenceScore: 72,
    gpsVariance: input.gpsCoords
      ? `${input.gpsCoords.lat.toFixed(4)}N, ${input.gpsCoords.lng.toFixed(4)}E`
      : 'GPS not available',
    gpsMatchStatus: input.gpsCoords ? 'Unable to Verify' : 'Unable to Verify',
    ocrInvoiceMatch: 'Manual verification required',
    ocrMatchStatus: 'Not Available',
    duplicateCheckStatus: 'Clean',
    metadataFlags: buildMetadataFlags(input),
    summary:
      'AI verification temporarily unavailable. Submission flagged for manual officer review.',
    recommendation: 'Manual Review',
    isFallback: true,
  };
}

// ─── AI field validators ──────────────────────────────────────────────────────

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const;
const GPS_STATUSES = ['Verified', 'Mismatch', 'Unable to Verify'] as const;
const OCR_STATUSES = ['Success', 'Partial', 'Failed', 'Not Available'] as const;
const DUP_STATUSES = ['Clean', 'Suspicious', 'Duplicate Detected'] as const;
const RECOMMENDATIONS = ['Approve', 'Manual Review', 'Reject'] as const;

function validateResult(
  parsed: Record<string, unknown>,
  input: FraudScoringInput,
  gpsVarianceText: string,
  gpsMatchStatus: FraudScoringResult['gpsMatchStatus'],
  metadataFlags: string[]
): FraudScoringResult {
  return {
    fraudScore:
      typeof parsed.fraudScore === 'number'
        ? Math.min(100, Math.max(0, parsed.fraudScore))
        : 50,
    riskLevel: RISK_LEVELS.includes(parsed.riskLevel as (typeof RISK_LEVELS)[number])
      ? (parsed.riskLevel as FraudScoringResult['riskLevel'])
      : 'Medium',
    assetDetected:
      typeof parsed.assetDetected === 'string' && parsed.assetDetected
        ? parsed.assetDetected
        : input.assetCategory,
    confidenceScore:
      typeof parsed.confidenceScore === 'number'
        ? Math.min(100, Math.max(0, parsed.confidenceScore))
        : 70,
    gpsVariance: gpsVarianceText,
    gpsMatchStatus,
    ocrInvoiceMatch:
      typeof parsed.ocrInvoiceMatch === 'string' && parsed.ocrInvoiceMatch
        ? parsed.ocrInvoiceMatch
        : 'Not analyzed',
    ocrMatchStatus: OCR_STATUSES.includes(parsed.ocrMatchStatus as (typeof OCR_STATUSES)[number])
      ? (parsed.ocrMatchStatus as FraudScoringResult['ocrMatchStatus'])
      : 'Not Available',
    duplicateCheckStatus: DUP_STATUSES.includes(
      parsed.duplicateCheckStatus as (typeof DUP_STATUSES)[number]
    )
      ? (parsed.duplicateCheckStatus as FraudScoringResult['duplicateCheckStatus'])
      : 'Clean',
    metadataFlags: Array.from(
      new Set([
        ...metadataFlags,
        ...(Array.isArray(parsed.metadataFlags)
          ? (parsed.metadataFlags as unknown[]).filter((f): f is string => typeof f === 'string')
          : []),
      ])
    ),
    summary:
      typeof parsed.summary === 'string' && parsed.summary
        ? parsed.summary
        : 'AI assessment completed. Please review the submission manually.',
    recommendation: RECOMMENDATIONS.includes(
      parsed.recommendation as (typeof RECOMMENDATIONS)[number]
    )
      ? (parsed.recommendation as FraudScoringResult['recommendation'])
      : 'Manual Review',
    isFallback: !!(parsed.isFallback),
  };
}

// ─── Main scoring function ────────────────────────────────────────────────────

// Maximum base64 size we'll send to Gemini (~900KB compressed)
const MAX_IMAGE_BASE64_BYTES = 900 * 1024;

export async function runFraudScoring(
  input: FraudScoringInput
): Promise<FraudScoringResult> {
  const metadataFlags = buildMetadataFlags(input);

  // ── Compute GPS variance ──────────────────────────────────────────────────
  let gpsVarianceText = 'GPS not available';
  let gpsMatchStatus: FraudScoringResult['gpsMatchStatus'] = 'Unable to Verify';

  if (input.gpsCoords && input.gpsExpectedCoords) {
    const dist = computeGpsVarianceKm(input.gpsCoords, input.gpsExpectedCoords);
    gpsVarianceText = `${dist.toFixed(2)}km from loan disbursement site`;
    gpsMatchStatus = dist <= 20 ? 'Verified' : 'Mismatch';
  } else if (input.gpsCoords) {
    gpsVarianceText = `${input.gpsCoords.lat.toFixed(4)}N, ${input.gpsCoords.lng.toFixed(4)}E`;
    gpsMatchStatus = 'Unable to Verify';
  }

  // ── Build prompt ──────────────────────────────────────────────────────────
  const prompt = `You are an AI fraud detection engine for LoanLens AI (a government loan verification platform).
Analyze this beneficiary asset submission and return ONLY a valid JSON object.
Do NOT use markdown, code fences, or any text outside the JSON object.

SUBMISSION DATA:
- Asset Category: ${input.assetCategory}
- GPS: ${input.gpsCoords ? `${input.gpsCoords.lat.toFixed(6)}N, ${input.gpsCoords.lng.toFixed(6)}E` : 'Not captured'}
- GPS Variance: ${gpsVarianceText}
- OCR Text: ${input.ocrText ?? 'Not available'}
- Loan Amount: ${input.loanAmount ? `Rs.${input.loanAmount}` : 'Not provided'}
- Image Metadata Flags: ${metadataFlags.length > 0 ? metadataFlags.join('; ') : 'None'}
- File: ${input.imageMetadata ? `${input.imageMetadata.fileName} (${(input.imageMetadata.fileSize / 1024).toFixed(1)}KB, ${input.imageMetadata.fileType})` : 'Not available'}

Respond with ONLY this JSON (replace all values with your analysis):
{"fraudScore":45,"riskLevel":"Medium","assetDetected":"Tractor (detected in photo)","confidenceScore":85,"gpsVariance":"coordinates recorded","gpsMatchStatus":"Unable to Verify","ocrInvoiceMatch":"Invoice not available","ocrMatchStatus":"Not Available","duplicateCheckStatus":"Clean","metadataFlags":[],"summary":"Submission looks legitimate but GPS reference unavailable.","recommendation":"Manual Review"}

RULES:
- fraudScore: integer 0-100
- riskLevel: "Low"|"Medium"|"High"|"Critical"
- gpsMatchStatus: "Verified"|"Mismatch"|"Unable to Verify"
- ocrMatchStatus: "Success"|"Partial"|"Failed"|"Not Available"
- duplicateCheckStatus: "Clean"|"Suspicious"|"Duplicate Detected"
- recommendation: "Approve"|"Manual Review"|"Reject"
- gpsVariance: max 60 chars
- summary: max 150 chars`;

  // ── Determine if we should include the image ──────────────────────────────
  let imageToSend: string | null = null;
  if (input.imageBase64) {
    const base64Bytes = input.imageBase64.length * 0.75;
    if (base64Bytes <= MAX_IMAGE_BASE64_BYTES) {
      imageToSend = input.imageBase64;
      console.log(
        `[FraudScoring] Including image in request (~${(base64Bytes / 1024).toFixed(0)}KB)`
      );
    } else {
      console.warn(
        `[FraudScoring] Image too large (~${(base64Bytes / 1024).toFixed(0)}KB) — using text-only mode`
      );
    }
  }

  // ── Call verify-asset API route ───────────────────────────────────────────
  console.log('[FraudScoring] Calling /api/ai/verify-asset', {
    assetCategory: input.assetCategory,
    hasImage: !!imageToSend,
    gpsAvailable: !!input.gpsCoords,
  });

  let apiResult: Record<string, unknown>;

  try {
    const response = await fetch('/api/ai/verify-asset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        imageBase64: imageToSend,
        textOnly: !imageToSend,
      }),
    });

    // ── Safe JSON parsing — never crash on non-JSON ───────────────────────
    let rawText = '';
    try {
      rawText = await response.text();
    } catch {
      console.error('[FraudScoring] Could not read response body');
      return buildFallbackResult(input);
    }

    if (!rawText.trim()) {
      console.error('[FraudScoring] Empty response from verify-asset');
      return buildFallbackResult(input);
    }

    try {
      apiResult = JSON.parse(rawText);
    } catch {
      console.error('[FraudScoring] Non-JSON response from verify-asset:', rawText.slice(0, 300));
      return buildFallbackResult(input);
    }

    // If API returned an error response (not success), use fallback
    if (!response.ok && !apiResult.isFallback) {
      console.error('[FraudScoring] verify-asset returned error status:', response.status, apiResult);
      return buildFallbackResult(input);
    }

    // If API explicitly returned fallback, keep it as-is (already validated shape)
    if (apiResult.isFallback) {
      console.warn('[FraudScoring] AI returned fallback result');
      return buildFallbackResult(input);
    }

    console.log('[FraudScoring] AI result received:', {
      fraudScore: apiResult.fraudScore,
      riskLevel: apiResult.riskLevel,
      recommendation: apiResult.recommendation,
    });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[FraudScoring] Network/fetch error:', errMsg);
    return buildFallbackResult(input);
  }

  // ── Validate and sanitize the AI response ─────────────────────────────────
  return validateResult(apiResult, input, gpsVarianceText, gpsMatchStatus, metadataFlags);
}
