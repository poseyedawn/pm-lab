import { dayNumber } from '@/lib/engine/daily';
import { syncLabProfile } from '@/lib/labProfile';

export interface CampaignLevelResult {
  stars: 0 | 1 | 3;
  attempts: number;
  correct: boolean;
}

export interface SignificantState {
  campaign: Record<number, CampaignLevelResult>;
  warmupDone: boolean;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyCorrect: boolean | null;
  shields: number;
  xp: number;
  soundOn: boolean;
  campaignStreak: number;
  campaignCompleteTracked: boolean;
}

export const defaultState = (): SignificantState => ({
  campaign: {},
  warmupDone: false,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyCorrect: null,
  shields: 0,
  xp: 0,
  soundOn: true,
  campaignStreak: 0,
  campaignCompleteTracked: false,
});

export const xpForCall = (correct: boolean, combo: number): number =>
  correct ? 100 * Math.min(combo, 3) : 0;

export const addXp = (s: SignificantState, amount: number): SignificantState => ({
  ...s,
  xp: s.xp + amount,
});

export const completeWarmup = (s: SignificantState): SignificantState => ({
  ...s,
  warmupDone: true,
});

export function recordCampaignResult(
  s: SignificantState,
  levelId: number,
  correct: boolean,
): SignificantState {
  const prev = s.campaign[levelId] ?? { stars: 0 as const, attempts: 0, correct: false };
  const attempts = prev.attempts + 1;
  const earned: 0 | 1 | 3 = correct ? (attempts === 1 ? 3 : 1) : 0;
  const stars = Math.max(prev.stars, earned) as 0 | 1 | 3;
  return {
    ...s,
    campaign: { ...s.campaign, [levelId]: { stars, attempts, correct: prev.correct || correct } },
    campaignStreak: correct ? s.campaignStreak + 1 : 0,
  };
}

export function recordDaily(s: SignificantState, date: string, correct: boolean): SignificantState {
  if (s.lastDailyDate === date) return s;
  const gap = s.lastDailyDate === null ? Infinity : dayNumber(date) - dayNumber(s.lastDailyDate);
  let shields = s.shields;
  let streak: number;
  if (gap === 1) streak = s.dailyStreak + 1;
  else if (gap === 2 && shields > 0) {
    shields -= 1;
    streak = s.dailyStreak + 1;
  } else streak = 1;
  if (streak > 0 && streak % 7 === 0) shields = Math.min(2, shields + 1);
  return { ...s, dailyStreak: streak, lastDailyDate: date, lastDailyCorrect: correct, shields };
}

// ---- storage (browser-safe) ----

const KEY = 'pmlab:significant:v1';
let memoryFallback: string | null = null;

function safeParse(raw: string): SignificantState {
  try {
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<SignificantState>) };
  } catch {
    return defaultState();
  }
}

export function loadState(): SignificantState {
  try {
    const raw = (typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null) ?? memoryFallback;
    if (!raw) return defaultState();
    return safeParse(raw);
  } catch {
    return memoryFallback ? safeParse(memoryFallback) : defaultState();
  }
}

export function saveState(s: SignificantState): void {
  const raw = JSON.stringify(s);
  // Always keep the in-memory fallback current so a throwing localStorage
  // (e.g. Safari private mode) still preserves progress for this session.
  memoryFallback = raw;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, raw);
  } catch {
    // localStorage threw; memoryFallback already holds the latest state above.
  }
  syncLabProfile();
}
