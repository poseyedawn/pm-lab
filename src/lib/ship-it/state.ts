import { z } from 'zod';
import { dayNumber } from '@/lib/engine/daily';
import { saveGameProgress } from '@/services/labProfileService';
import type { Rating, RunState, SavedShipRun } from '@/lib/ship-it/types';

export interface SavedDailyShipRun {
  date: string;
  snapshot: SavedShipRun;
}

export interface ShipItState {
  xp: number;
  soundOn: boolean;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyRating: Rating | null;
  shields: number;
  bestRatingFree: Rating | null;
  bestRatingDaily: Rating | null;
  activeFreeRun: SavedShipRun | null;
  activeDailyRun: SavedDailyShipRun | null;
  rewardedRunKeys: string[];
}

export const defaultShipItState = (): ShipItState => ({
  xp: 0, soundOn: true, dailyStreak: 0, lastDailyDate: null, lastDailyRating: null,
  shields: 0, bestRatingFree: null, bestRatingDaily: null,
  activeFreeRun: null, activeDailyRun: null, rewardedRunKeys: [],
});

export const RATING_ORDER: Rating[] = [
  'PIP', 'Needs Review', 'Meets Expectations', 'Exceeds Expectations', 'Promoted', 'CEO-in-waiting',
];

export function recordBestRating(s: ShipItState, mode: 'free' | 'daily', rating: Rating): ShipItState {
  const key = mode === 'free' ? 'bestRatingFree' : 'bestRatingDaily';
  const current = s[key];
  if (current !== null && RATING_ORDER.indexOf(current) >= RATING_ORDER.indexOf(rating)) return s;
  return { ...s, [key]: rating };
}

export function recordShipItDaily(s: ShipItState, date: string, rating: Rating): ShipItState {
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
  return { ...s, dailyStreak: streak, lastDailyDate: date, lastDailyRating: rating, shields };
}

export function freeRunKey(run: RunState): string {
  return `free:${run.seed}`;
}

export function dailyRunKey(date: string, run: RunState): string {
  return `daily:${date}:${run.seed}`;
}

export function recordFreeRunReward(
  state: ShipItState,
  run: RunState,
  rating: Rating,
  xp: number,
): ShipItState {
  const key = freeRunKey(run);
  if (state.rewardedRunKeys.includes(key)) return state;
  return recordBestRating({
    ...state,
    xp: state.xp + xp,
    rewardedRunKeys: [...state.rewardedRunKeys, key].slice(-24),
  }, 'free', rating);
}

export function recordDailyRunReward(
  state: ShipItState,
  date: string,
  run: RunState,
  rating: Rating,
  xp: number,
): ShipItState {
  const key = dailyRunKey(date, run);
  if (state.rewardedRunKeys.includes(key) || state.lastDailyDate === date) return state;
  return recordBestRating({
    ...recordShipItDaily(state, date, rating),
    xp: state.xp + xp,
    rewardedRunKeys: [...state.rewardedRunKeys, key].slice(-24),
  }, 'daily', rating);
}

// ---- storage (browser-safe, same pattern as progress.ts) ----

const KEY = 'pmlab:shipit:v1';
let memoryFallback: string | null = null;

const ratingSchema = z.enum([
  'PIP',
  'Needs Review',
  'Meets Expectations',
  'Exceeds Expectations',
  'Promoted',
  'CEO-in-waiting',
]);

const metersSchema = z.object({
  users: z.number().int().min(0).max(100),
  business: z.number().int().min(0).max(100),
  team: z.number().int().min(0).max(100),
  tech: z.number().int().min(0).max(100),
});

const runStateSchema = z.object({
  seed: z.number().int().nonnegative(),
  product: z.string().min(1),
  week: z.number().int().min(1).max(18),
  meters: metersSchema,
  flags: z.array(z.string()),
  drawn: z.array(z.string()),
  history: z.array(z.object({ cardId: z.string(), dir: z.enum(['left', 'right']) })),
  currentCardId: z.string().nullable(),
  status: z.enum(['active', 'dead', 'complete']),
  deadMeter: z.enum(['users', 'business', 'team', 'tech']).nullable(),
  overshootsTriggered: z.array(z.enum(['users', 'business', 'team', 'tech'])),
  exhausted: z.boolean(),
});

const savedRunSchema = z.object({
  run: runStateSchema,
  failureSeen: z.boolean(),
});

const shipItStateSchema = z.object({
  xp: z.number().int().nonnegative(),
  soundOn: z.boolean(),
  dailyStreak: z.number().int().nonnegative(),
  lastDailyDate: z.string().nullable(),
  lastDailyRating: ratingSchema.nullable(),
  shields: z.number().int().min(0).max(2),
  bestRatingFree: ratingSchema.nullable(),
  bestRatingDaily: ratingSchema.nullable(),
  activeFreeRun: savedRunSchema.nullable(),
  activeDailyRun: z.object({ date: z.string(), snapshot: savedRunSchema }).nullable(),
  rewardedRunKeys: z.array(z.string()),
});

function safeParse(raw: string): ShipItState {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const migrated = { ...defaultShipItState(), ...(typeof parsed === 'object' && parsed !== null ? parsed : {}) };
    const result = shipItStateSchema.safeParse(migrated);
    return result.success ? result.data : defaultShipItState();
  } catch {
    return defaultShipItState();
  }
}

export function loadShipItState(): ShipItState {
  try {
    const raw = (typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null) ?? memoryFallback;
    if (!raw) return defaultShipItState();
    return safeParse(raw);
  } catch {
    return memoryFallback ? safeParse(memoryFallback) : defaultShipItState();
  }
}

export function saveShipItState(s: ShipItState): void {
  const raw = JSON.stringify(s);
  // Always keep the in-memory fallback current so a throwing localStorage
  // (e.g. Safari private mode) still preserves progress for this session.
  memoryFallback = raw;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(KEY, raw);
  } catch {
    // localStorage threw; memoryFallback already holds the latest state above.
  }
  saveGameProgress({
    gameId: 'ship-it',
    xp: s.xp,
    completedMilestones: [
      ...(s.bestRatingFree ? [`free:${s.bestRatingFree}`] : []),
      ...(s.bestRatingDaily ? [`daily:${s.bestRatingDaily}`] : []),
    ],
    lastPlayedAt: new Date().toISOString(),
  });
}
