import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { SignificantState } from '@/lib/progress';

export interface SignificantLandingProgress {
  completedCases: number;
  isReturning: boolean;
  nextLevel: number;
}

export function significantLandingProgress(state: SignificantState): SignificantLandingProgress {
  const completedCases = CAMPAIGN_LEVELS.filter(({ id }) => state.campaign[id]?.correct).length;
  const nextLevel = state.pendingCampaignReveal?.levelId
    ?? CAMPAIGN_LEVELS.find(({ id }) => !state.campaign[id]?.correct)?.id
    ?? CAMPAIGN_LEVELS[CAMPAIGN_LEVELS.length - 1].id;
  const isReturning = state.warmupDone
    || Object.keys(state.campaign).length > 0
    || state.lastDailyDate !== null
    || state.xp > 0;

  return { completedCases, isReturning, nextLevel };
}

export function significantLandingHref(progress: SignificantLandingProgress): string {
  if (!progress.isReturning) return '/significant/calibration';

  return `/significant/play?level=${progress.nextLevel}`;
}
