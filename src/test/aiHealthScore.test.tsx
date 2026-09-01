import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AIHealthScore from '@/pages/AIHealthScore';
import { aiService } from '@/services/ai/aiService';

vi.mock('@/services/ai/aiService', () => ({
  aiService: {
    getHealthScores: vi.fn(),
    getPredictions: vi.fn(),
  },
}));

describe('AI Health Score Integrity Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('7. Missing AI health score does NOT render 82 fallback', async () => {
    vi.mocked(aiService.getHealthScores).mockResolvedValue({
      success: true,
      data: {
        overallHealthScore: undefined as any,
        scores: {},
      },
    });
    vi.mocked(aiService.getPredictions).mockResolvedValue({
      success: true,
      data: {} as any,
    });

    render(<AIHealthScore />);

    await waitFor(() => {
      expect(screen.queryByText('82')).not.toBeInTheDocument();
      expect(screen.getByText('Health Score Unavailable')).toBeInTheDocument();
      expect(screen.getByText('Data Pending')).toBeInTheDocument();
    });
  });

  it('8. Valid AI health score renders actual backend value', async () => {
    vi.mocked(aiService.getHealthScores).mockResolvedValue({
      success: true,
      data: {
        overallHealthScore: 94,
        scores: {},
      },
    });
    vi.mocked(aiService.getPredictions).mockResolvedValue({
      success: true,
      data: {} as any,
    });

    render(<AIHealthScore />);

    await waitFor(() => {
      expect(screen.getByText('94')).toBeInTheDocument();
      expect(screen.getByText('Calculated')).toBeInTheDocument();
      expect(screen.queryByText('Health Score Unavailable')).not.toBeInTheDocument();
    });
  });
});
