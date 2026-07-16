import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { Call } from '@/lib/engine/types';
import type { SignificantState } from '@/lib/progress';

export interface LabLandingProgress {
  completedCases: number;
  isReturning: boolean;
  nextLevel: number;
}

export function labLandingProgress(state: SignificantState): LabLandingProgress {
  const completedCases = CAMPAIGN_LEVELS.filter(({ id }) => state.campaign[id]?.correct).length;
  const nextLevel = CAMPAIGN_LEVELS.find(({ id }) => !state.campaign[id]?.correct)?.id
    ?? CAMPAIGN_LEVELS[CAMPAIGN_LEVELS.length - 1].id;
  const isReturning = state.warmupDone
    || Object.keys(state.campaign).length > 0
    || state.lastDailyDate !== null
    || state.xp > 0;

  return { completedCases, isReturning, nextLevel };
}

export function labLandingHref(progress: LabLandingProgress, call: Call | null): string {
  const params = new URLSearchParams({ level: String(progress.nextLevel) });
  if (!progress.isReturning) params.set('calibration', '1');
  if (!progress.isReturning && call) params.set('call', call);
  return `/significant/play?${params.toString()}`;
}
