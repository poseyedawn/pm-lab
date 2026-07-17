import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { Call } from '@/lib/engine/types';
import type { SignificantState } from '@/lib/progress';

export interface SignificantLandingProgress {
  completedCases: number;
  isReturning: boolean;
  nextLevel: number;
}

export function significantLandingProgress(state: SignificantState): SignificantLandingProgress {
  const completedCases = CAMPAIGN_LEVELS.filter(({ id }) => state.campaign[id]?.correct).length;
  const nextLevel = CAMPAIGN_LEVELS.find(({ id }) => !state.campaign[id]?.correct)?.id
    ?? CAMPAIGN_LEVELS[CAMPAIGN_LEVELS.length - 1].id;
  const isReturning = state.warmupDone
    || Object.keys(state.campaign).length > 0
    || state.lastDailyDate !== null
    || state.xp > 0;

  return { completedCases, isReturning, nextLevel };
}

export function significantLandingHref(progress: SignificantLandingProgress, call: Call | null): string {
  if (!progress.isReturning) {
    const params = new URLSearchParams();
    if (call) params.set('call', call);
    const query = params.toString();
    return `/significant/calibration${query ? `?${query}` : ''}`;
  }

  return `/significant/play?level=${progress.nextLevel}`;
}
