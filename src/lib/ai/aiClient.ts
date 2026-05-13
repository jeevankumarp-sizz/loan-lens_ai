/**
 * aiClient.ts
 * Hardened AI endpoint client.
 * - Safe response parsing (never crashes on non-JSON)
 * - Exponential-backoff retries
 * - Descriptive errors instead of raw API messages
 */

import { safeParseJson } from '@/lib/utils/safeJson';

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Friendly error messages — replaces raw API errors shown to users.
 */
function friendlyError(raw: string | undefined, status: number): string {
  if (!raw) raw = '';
  const lower = raw.toLowerCase();

  if (
    lower === 'image_too_large' ||
    lower.includes('request entity too large') ||
    lower.includes('payload too large')
  ) {
    return 'Photo too large for AI analysis. Please use a smaller image.';
  }
  if (lower === 'html_error_page' || lower.includes('internal server error')) {
    return 'AI verification server temporarily unavailable. Please retry.';
  }
  if (status === 400) {
    return 'AI verification request failed. The image may be unsupported. Please try a different photo.';
  }
  if (status === 401 || status === 403) {
    return 'AI service configuration error. Please contact support.';
  }
  if (status === 429) {
    return 'AI service is busy. Please wait a moment and retry.';
  }
  if (status >= 500) {
    return 'AI verification server error. Please retry in a few seconds.';
  }
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'AI verification timed out. Please retry.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error — could not reach AI verification server.';
  }
  return 'AI verification temporarily unavailable. Please retry.';
}

export async function callAIEndpoint(endpoint: string, payload: object): Promise<unknown> {
  let lastError: Error = new Error('AI API request failed');

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[AIClient] Attempt ${attempt + 1}/${MAX_RETRIES} -> ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // ---- Safe JSON parse — NEVER call response.json() directly ----------
      let rawText = '';
      try {
        rawText = await response.text();
      } catch {
        throw new Error('Could not read server response body');
      }

      const parsed = safeParseJson(rawText);

      // ---- Retryable status (429, 5xx) ------------------------------------
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1200;
        console.warn(
          `[AIClient] Status ${response.status} — retrying in ${backoffMs}ms ` +
          `(attempt ${attempt + 1}/${MAX_RETRIES})`
        );
        lastError = new Error(friendlyError(parsed.error as string, response.status));
        await sleep(backoffMs);
        continue;
      }

      // ---- Non-retryable error status ------------------------------------
      if (!response.ok) {
        const errMsg =
          parsed.ok && parsed.data
            ? ((parsed.data as Record<string, unknown>).error as string) ?? ''
            : parsed.error ?? '';

        console.error('[AIClient] API error:', {
          status: response.status,
          raw: rawText.slice(0, 500),
          parsed: parsed.data,
        });

        throw new Error(friendlyError(errMsg, response.status));
      }

      // ---- Successful response — but body wasn't valid JSON ---------------
      if (!parsed.ok || !parsed.data) {
        console.error(
          '[AIClient] Server returned non-JSON success body:',
          rawText.slice(0, 500)
        );
        throw new Error('AI server returned an unexpected response format. Please retry.');
      }

      // ---- Application-level error field ---------------------------------
      const data = parsed.data as Record<string, unknown>;
      if (data.error) {
        const errMsg = typeof data.error === 'string' ? data.error : String(data.error);
        console.error('[AIClient] Application error in response:', errMsg);
        throw new Error(friendlyError(errMsg, response.status));
      }

      console.log('[AIClient] Success on attempt', attempt + 1);
      return data;
    } catch (err) {
      // ---- Network-level error (fetch threw) -----------------------------
      if (err instanceof TypeError && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1200;
        console.warn(`[AIClient] Network error — retrying in ${backoffMs}ms`);
        lastError = new Error('Network error — could not reach AI verification server.');
        await sleep(backoffMs);
        continue;
      }

      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  }

  throw lastError;
}
