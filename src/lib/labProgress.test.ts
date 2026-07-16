import { describe, expect, it } from 'vitest';
import { significantGameProgress } from '@/lib/labProgress';
import { defaultState, recordCampaignResult, recordDaily } from '@/lib/progress';

describe('significantGameProgress', () => {
  it('maps local Significant state into shared Lab milestones', () => {
    let state = { ...defaultState(), warmupDone: true, xp: 250 };
    state = recordCampaignResult(state, 1, true);
    state = recordDaily(state, '2026-07-15', true);

    expect(significantGameProgress(state, '2026-07-15T18:00:00.000Z')).toEqual({
      gameId: 'significant',
      xp: 250,
      completedMilestones: ['baseline-calibrated', 'campaign-level:1', 'daily-completed'],
      lastPlayedAt: '2026-07-15T18:00:00.000Z',
    });
  });
});
