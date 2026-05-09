const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callAIEndpoint(endpoint: string, payload: object) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Check if this is a retryable status code
      if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.warn(
          `AI API returned ${response.status}. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await sleep(backoffMs);
        lastError = new Error(data.error || `Request failed: ${response.status}`);
        continue;
      }

      if (!response.ok || data.error) {
        console.error('API Route Error:', {
          error: data.error,
          details: data.details,
        });
        throw new Error(data.error || `Request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Only retry on network-level errors (not thrown Error objects from above)
      if (error instanceof TypeError && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(`Network error. Retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await sleep(backoffMs);
        lastError = error as Error;
        continue;
      }
      console.error('API request error:', error);
      throw error;
    }
  }

  // All retries exhausted
  throw lastError || new Error('AI API request failed after all retries');
}
