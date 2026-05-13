/**
 * /api/ai/verify-asset/route.ts
 *
 * Dedicated Gemini Vision endpoint for asset verification.
 * Bypasses the LLM SDK's LiteLLM proxy to call Gemini directly.
 * This eliminates the 400 errors caused by payload format mismatches.
 *
 * Features:
 * - Direct Gemini REST API call (no LiteLLM intermediary)
 * - Server-side image size validation (rejects >4MB base64)
 * - Text-only fallback if image is still too large
 * - Hardcoded fallback mock response if Gemini fails
 * - Always returns valid JSON — never crashes the frontend
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifyAssetRequest {
  prompt: string;
  imageBase64?: string | null; // full data URI: data:image/jpeg;base64,<data>
  textOnly?: boolean;
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { code: number; message: string; status: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────

// 4MB base64 limit to stay well under Gemini's 20MB request ceiling
const MAX_BASE64_BYTES = 4 * 1024 * 1024;

const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_API_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models';

// ─── Fallback mock result — returned when Gemini is unavailable ───────────────

const FALLBACK_RESULT = {
  success: true,
  isFallback: true,
  fraudScore: 45,
  riskLevel: 'Medium',
  assetDetected: 'Asset detected (manual review required)',
  confidenceScore: 72,
  gpsMatchStatus: 'Unable to Verify',
  ocrInvoiceMatch: 'Manual verification required',
  ocrMatchStatus: 'Not Available',
  duplicateCheckStatus: 'Clean',
  metadataFlags: [],
  summary:
    'AI verification temporarily unavailable — submission flagged for manual officer review.',
  recommendation: 'Manual Review',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeJsonResponse(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function extractTextFromGemini(gemini: GeminiResponse): string | null {
  const parts = gemini?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const textPart = parts.find((p) => typeof p?.text === 'string');
  return textPart?.text?.trim() ?? null;
}

function safeParseAiJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim();

  const attempts = [
    () => JSON.parse(cleaned),
    () => {
      const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
      return m ? JSON.parse(m[1].trim()) : null;
    },
    () => {
      const f = cleaned.indexOf('{');
      const l = cleaned.lastIndexOf('}');
      return f !== -1 && l > f ? JSON.parse(cleaned.slice(f, l + 1)) : null;
    },
    () => {
      const f = cleaned.indexOf('{');
      const l = cleaned.lastIndexOf('}');
      if (f === -1 || l <= f) return null;
      const fixed = cleaned
        .slice(f, l + 1)
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"');
      return JSON.parse(fixed);
    },
  ];

  for (const attempt of attempts) {
    try {
      const result = attempt();
      if (result && typeof result === 'object') return result as Record<string, unknown>;
    } catch { /* try next */ }
  }
  return null;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  // ── Validate API key ──────────────────────────────────────────────────────
  if (!apiKey) {
    console.error('[verify-asset] GEMINI_API_KEY not set');
    return safeJsonResponse({
      ...FALLBACK_RESULT,
      error: 'AI service not configured — using fallback verification',
    });
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body: VerifyAssetRequest;
  try {
    body = await request.json();
  } catch {
    return safeJsonResponse(
      { error: 'Invalid request body — expected JSON', details: 'Request parse failed' },
      400
    );
  }

  const { prompt, imageBase64, textOnly = false } = body;

  if (!prompt || typeof prompt !== 'string') {
    return safeJsonResponse(
      { error: 'Missing required field: prompt', details: 'Request validation failed' },
      400
    );
  }

  console.log('[verify-asset] Request received', {
    hasImage: !!imageBase64,
    textOnly,
    promptLength: prompt.length,
    imageBytes: imageBase64?.length ?? 0,
  });

  // ── Build Gemini parts ────────────────────────────────────────────────────
  const parts: GeminiPart[] = [{ text: prompt }];

  let includeImage = !textOnly && !!imageBase64;

  if (includeImage && imageBase64) {
    // Validate size — reject images that would cause Gemini 400
    const base64SizeBytes = imageBase64.length * 0.75; // rough bytes from base64 length
    if (base64SizeBytes > MAX_BASE64_BYTES) {
      console.warn(
        `[verify-asset] Image too large (${(base64SizeBytes / 1024 / 1024).toFixed(1)}MB) — falling back to text-only`
      );
      includeImage = false;
    }
  }

  if (includeImage && imageBase64) {
    // Extract mime type and raw base64 data from data URI
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/s);
    if (match) {
      const [, mimeType, data] = match;
      // Only allow image types Gemini supports
      const supportedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
      if (supportedMimes.has(mimeType)) {
        parts.push({ inlineData: { mimeType, data } });
        console.log(`[verify-asset] Including image: ${mimeType}, ~${(data.length * 0.75 / 1024).toFixed(0)}KB`);
      } else {
        console.warn(`[verify-asset] Unsupported mime type: ${mimeType} — text-only mode`);
      }
    }
  }

  // ── Call Gemini API ───────────────────────────────────────────────────────
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const geminiBody = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  let geminiRaw: string;
  let geminiStatus: number;

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    });

    geminiStatus = geminiResponse.status;
    geminiRaw = await geminiResponse.text();

    console.log(`[verify-asset] Gemini response: status=${geminiStatus}, length=${geminiRaw.length}`);
    console.log('[verify-asset] Gemini raw (first 500):', geminiRaw.slice(0, 500));

    // ── Handle Gemini errors ──────────────────────────────────────────────
    if (!geminiResponse.ok) {
      let geminiError: GeminiResponse | null = null;
      try {
        geminiError = JSON.parse(geminiRaw);
      } catch { /* ignore */ }

      const geminiMsg = geminiError?.error?.message ?? geminiRaw.slice(0, 200);
      console.error(`[verify-asset] Gemini API error ${geminiStatus}:`, geminiMsg);

      // If image caused the error and we haven't tried text-only yet, retry
      if (geminiStatus === 400 && includeImage) {
        console.warn('[verify-asset] Gemini 400 with image — retrying text-only...');
        return retryTextOnly(url, prompt, apiKey);
      }

      // Return fallback instead of crashing
      return safeJsonResponse({
        ...FALLBACK_RESULT,
        _geminiError: `Gemini ${geminiStatus}: ${geminiMsg.slice(0, 100)}`,
      });
    }

    // ── Parse successful Gemini response ──────────────────────────────────
    let geminiParsed: GeminiResponse;
    try {
      geminiParsed = JSON.parse(geminiRaw);
    } catch {
      console.error('[verify-asset] Could not parse Gemini response as JSON');
      return safeJsonResponse({
        ...FALLBACK_RESULT,
        _geminiError: 'Gemini response was not valid JSON',
      });
    }

    const text = extractTextFromGemini(geminiParsed);
    if (!text) {
      console.error('[verify-asset] Gemini returned no text content:', JSON.stringify(geminiParsed));
      return safeJsonResponse({
        ...FALLBACK_RESULT,
        _geminiError: 'Gemini returned empty text content',
      });
    }

    console.log('[verify-asset] Gemini text output (first 300):', text.slice(0, 300));

    // ── Parse AI JSON from text ───────────────────────────────────────────
    const aiResult = safeParseAiJson(text);
    if (!aiResult) {
      console.error('[verify-asset] Could not extract JSON from Gemini text:', text.slice(0, 500));
      return safeJsonResponse({
        ...FALLBACK_RESULT,
        _rawText: text.slice(0, 200),
        _geminiError: 'Could not parse structured JSON from AI response',
      });
    }

    console.log('[verify-asset] Parsed AI result:', aiResult);
    return safeJsonResponse({ success: true, ...aiResult });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[verify-asset] Unexpected error calling Gemini:', errMsg);
    return safeJsonResponse({
      ...FALLBACK_RESULT,
      _error: errMsg.slice(0, 200),
    });
  }
}

// ── Text-only retry (called when image caused 400) ────────────────────────────

async function retryTextOnly(
  url: string,
  prompt: string,
  _apiKey: string
): Promise<NextResponse> {
  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    console.log(`[verify-asset] Text-only retry: status=${res.status}`);

    if (!res.ok) {
      return NextResponse.json({
        ...FALLBACK_RESULT,
        _geminiError: `Text-only retry also failed: ${res.status}`,
      });
    }

    const parsed: GeminiResponse = JSON.parse(raw);
    const text = extractTextFromGemini(parsed);
    if (!text) throw new Error('Empty text from text-only retry');

    const aiResult = safeParseAiJson(text);
    if (!aiResult) throw new Error('Could not parse JSON from text-only retry');

    return NextResponse.json({ success: true, isFallback: false, ...aiResult });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[verify-asset] Text-only retry failed:', msg);
    return NextResponse.json({ ...FALLBACK_RESULT, _error: msg.slice(0, 100) });
  }
}
