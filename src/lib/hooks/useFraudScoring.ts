'use client';
import { useState, useCallback } from 'react';
import { runFraudScoring, FraudScoringInput, FraudScoringResult } from '@/lib/ai/fraudScoring';

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

  const scoreSubmission = useCallback(async (input: FraudScoringInput): Promise<FraudScoringResult | null> => {
    setIsScoring(true);
    setError(null);
    setResult(null);
    try {
      const scored = await runFraudScoring(input);
      setResult(scored);
      return scored;
    } catch (err: any) {
      const msg = err?.message || 'Fraud scoring failed. Please try again.';
      setError(msg);
      return null;
    } finally {
      setIsScoring(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsScoring(false);
  }, []);

  return { result, isScoring, error, scoreSubmission, reset };
}
