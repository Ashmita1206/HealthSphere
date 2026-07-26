import { useState, useEffect, useCallback } from 'react';
import { aiService, HealthScoreData, PredictionsData } from '@/services/ai/aiService';

export function useAIHealthScore() {
  const [loading, setLoading] = useState(true);
  const [healthScores, setHealthScores] = useState<HealthScoreData | null>(null);
  const [predictions, setPredictions] = useState<PredictionsData | null>(null);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    try {
      const [scoresRes, predRes] = await Promise.all([
        aiService.getHealthScores().catch(() => null),
        aiService.getPredictions().catch(() => null),
      ]);

      if (scoresRes?.success && scoresRes.data) {
        setHealthScores(scoresRes.data);
      }
      if (predRes?.success && predRes.data) {
        setPredictions(predRes.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return {
    loading,
    healthScores,
    predictions,
    refetch: fetchHealthData,
  };
}
