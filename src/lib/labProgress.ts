import type { LabGameProgress } from '@/types/lab';
import type { SignificantState } from '@/lib/progress';

export function significantGameProgress(
  state: SignificantState,
  lastPlayedAt: string | null,
): LabGameProgress {
  const completedCampaignLevels = Object.entries(state.campaign)
    .filter(([, result]) => result.correct)
    .map(([levelId]) => `campaign-level:${levelId}`);
  const completedMilestones = [
    ...(state.warmupDone ? ['baseline-calibrated'] : []),
    ...completedCampaignLevels,
    ...(state.lastDailyDate ? ['daily-completed'] : []),
    ...(completedCampaignLevels.length === 10 ? ['campaign-complete'] : []),
  ];

  return {
    gameId: 'significant',
    xp: state.xp,
    completedMilestones,
    lastPlayedAt,
  };
}
