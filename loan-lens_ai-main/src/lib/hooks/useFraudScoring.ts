'use client';
import { useState, useCallback } from 'react';
import { runFraudScoring, FraudScoringInput, FraudScoringResult } from '@/lib/ai/fraudScoring';

// Never expose raw API error strings to the UI
function toFriendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('gemini api error') || lower.includes('gemini:')) {
    return 'AI verification temporarily unavailable. Please retry.';
  }
  if (lower.includes('unexpected token') || lower.includes('is not valid json')) {
    return 'AI verification temporarily unavailable. Please retry.';
  }
  if (lower.includes('too large') || lower.includes('payload')) {
    return 'Photo size too large for AI analysis. Please use a smaller image.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network error — could not reach verification server. Check your connection.';
  }
  if (lower.includes('timeout')) {
    return 'Verification timed out. Please retry.';
  }
  if (lower.includes('api key') || lower.includes('configuration')) {
    return 'AI service configuration error. Please contact support.';
  }
  // If the error is already a friendly message (from aiClient), pass it through
  if (raw.length < 150 && !raw.includes(':') && !raw.includes('Error')) {
    return raw;
  }
  return 'AI verification temporarily unavailable. Please retry.';
}

interface UseFraudScoringReturn {
  result: FraudScoringResult | null;
  isScoring: boolean;
  error: string | null;
  scoreSubmission: (input: FraudScoringInput) => Promise<FraudScoringResult | null>;
  reset: () => void;
}

export function useFraudScoring(): UseFraudScoringReturn {
  const [result, setResult] = useState<FraudScoringResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreSubmission = useCallback(
    async (input: FraudScoringInput): Promise<FraudScoringResult | null> => {
      setIsScoring(true);
      setError(null);
      setResult(null);
      try {
        const scored = await runFraudScoring(input);
        setResult(scored);
        return scored;
      } catch (err: unknown) {
        const raw = err instanceof Error ? err.message : 'AI verification failed. Please retry.';
        const friendly = toFriendlyError(raw);
        console.error('[useFraudScoring] Error:', raw);
        setError(friendly);
        return null;
      } finally {
        setIsScoring(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsScoring(false);
  }, []);

  return { result, isScoring, error, scoreSubmission, reset };
}
