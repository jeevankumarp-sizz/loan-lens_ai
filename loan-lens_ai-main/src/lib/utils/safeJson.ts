/**
 * safeJson.ts
 * Safe JSON parsing utilities — prevents "Unexpected token" crashes
 * when AI APIs or proxies return non-JSON responses.
 */

export interface SafeParseResult<T> {
  ok: boolean;
  data: T | null;
  raw: string;
  error: string | null;
}

/**
 * Safely parse a Response object to JSON.
 * Falls back to reading as text so it NEVER throws on non-JSON bodies.
 */
export async function safeResponseJson<T = unknown>(
  response: Response
): Promise<SafeParseResult<T>> {
  let raw = '';
  try {
    raw = await response.text();
  } catch (e) {
    return { ok: false, data: null, raw: '', error: 'Could not read response body' };
  }

  return safeParseJson<T>(raw);
}

/**
 * Safely parse a raw string to JSON.
 * Strips markdown code fences, handles truncated JSON.
 */
export function safeParseJson<T = unknown>(text: string): SafeParseResult<T> {
  if (!text || !text.trim()) {
    return { ok: false, data: null, raw: text, error: 'Empty response body' };
  }

  const cleaned = text.trim();

  // 1. Direct parse
  try {
    const parsed = JSON.parse(cleaned) as T;
    return { ok: true, data: parsed, raw: text, error: null };
  } catch { /* continue */ }

  // 2. Strip markdown code fences ```json ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim()) as T;
      return { ok: true, data: parsed, raw: text, error: null };
    } catch { /* continue */ }
  }

  // 3. Extract outermost JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const parsed = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
      return { ok: true, data: parsed, raw: text, error: null };
    } catch { /* continue */ }
  }

  // 4. Fix trailing commas and single quotes
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      const fixed = cleaned
        .slice(firstBrace, lastBrace + 1)
        .replace(/,\s*([}\]])/g, '$1')
        .replace(/'/g, '"');
      const parsed = JSON.parse(fixed) as T;
      return { ok: true, data: parsed, raw: text, error: null };
    } catch { /* continue */ }
  }

  // 5. Detect known non-JSON responses and give helpful errors
  const lowerCased = cleaned.toLowerCase();
  if (lowerCased.startsWith('request en') || lowerCased.includes('request entity too large')) {
    return { ok: false, data: null, raw: text, error: 'IMAGE_TOO_LARGE' };
  }
  if (lowerCased.includes('<!doctype') || lowerCased.startsWith('<html')) {
    return { ok: false, data: null, raw: text, error: 'HTML_ERROR_PAGE' };
  }
  if (lowerCased.includes('internal server error')) {
    return { ok: false, data: null, raw: text, error: 'INTERNAL_SERVER_ERROR' };
  }

  return {
    ok: false,
    data: null,
    raw: text,
    error: `Non-JSON response: ${cleaned.slice(0, 120)}`,
  };
}

/**
 * Extract text content from various AI response shapes:
 * - OpenAI / LiteLLM: response.choices[0].message.content
 * - Gemini native: response.candidates[0].content.parts[0].text
 */
export function extractAIText(response: unknown): string | null {
  if (!response || typeof response !== 'object') return null;
  const r = response as Record<string, unknown>;

  // OpenAI / LiteLLM shape
  const choices = r.choices as Array<{ message?: { content?: string } }> | undefined;
  const choiceContent = choices?.[0]?.message?.content;
  if (typeof choiceContent === 'string' && choiceContent.trim()) {
    return choiceContent.trim();
  }

  // Gemini native shape
  type GeminiCandidate = { content?: { parts?: Array<{ text?: string }> } };
  const candidates = r.candidates as GeminiCandidate[] | undefined;
  const parts = candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const textPart = parts.find((p) => typeof p?.text === 'string');
    if (textPart?.text?.trim()) return textPart.text.trim();
  }

  // Top-level text
  if (typeof r.text === 'string' && r.text.trim()) return r.text.trim();

  // Plain string fallback
  if (typeof response === 'string' && (response as string).trim()) {
    return (response as string).trim();
  }

  return null;
}
