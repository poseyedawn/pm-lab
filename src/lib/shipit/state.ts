import { dayNumber } from '@/lib/engine/daily';
import { syncLabProfile } from '@/lib/labProfile';
import type { Rating } from '@/lib/shipit/types';

export interface ShipItState {
  xp: number;
  soundOn: boolean;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyRating: Rating | null;
  shields: number;
  bestRatingFree: Rating | null;
  bestRatingDaily: Rating | null;
}

export const defaultShipItState = (): ShipItState => ({
  xp: 0, soundOn: true, dailyStreak: 0, lastDailyDate: null, lastDailyRating: null,
  shields: 0, bestRatingFree: null, bestRatingDaily: null,
});

export const RATING_ORDER: Rating[] = [
  'PIP', 'Meets Expectations', 'Exceeds Expectations', 'Promoted', 'CEO-in-waiting',
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

// ---- storage (browser-safe, same pattern as progress.ts) ----

const KEY = 'pmlab:shipit:v1';
let memoryFallback: string | null = null;

function safeParse(raw: string): ShipItState {
  try {
    return { ...defaultShipItState(), ...(JSON.parse(raw) as Partial<ShipItState>) };
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
  syncLabProfile();
}
