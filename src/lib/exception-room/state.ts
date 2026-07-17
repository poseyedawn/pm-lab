import { dayNumber } from '@/lib/engine/daily';
import { syncLabProfile } from '@/lib/labProfile';
import type { OperatorProfile } from '@/lib/exception-room/types';

export const EXCEPTION_STATE_KEY = 'pmlab:exception-room:v1';

export interface ExceptionRoomState {
  xp: number;
  soundOn: boolean;
  campaignComplete: boolean;
  campaignRewarded: boolean;
  bestProfile: OperatorProfile | null;
  dailyStreak: number;
  lastDailyDate: string | null;
  lastDailyProfile: OperatorProfile | null;
}

export const defaultExceptionRoomState = (): ExceptionRoomState => ({
  xp: 0,
  soundOn: true,
  campaignComplete: false,
  campaignRewarded: false,
  bestProfile: null,
  dailyStreak: 0,
  lastDailyDate: null,
  lastDailyProfile: null,
});

const PROFILES: readonly OperatorProfile[] = [
  'Calibration in Progress',
  'Backlog Bound',
  'Escalation Heavy',
  'Speed Over Evidence',
  'Safety First',
  'Balanced Operator',
];

const betterProfile = (
  current: OperatorProfile | null,
  candidate: OperatorProfile,
): OperatorProfile => {
  if (!current) return candidate;
  return PROFILES.indexOf(candidate) > PROFILES.indexOf(current) ? candidate : current;
};

export function recordCampaignCompletion(
  state: ExceptionRoomState,
  profile: OperatorProfile,
): ExceptionRoomState {
  return {
    ...state,
    xp: state.campaignRewarded ? state.xp : state.xp + 200,
    campaignComplete: true,
    campaignRewarded: true,
    bestProfile: betterProfile(state.bestProfile, profile),
  };
}

export function recordExceptionDaily(
  state: ExceptionRoomState,
  date: string,
  profile: OperatorProfile,
): ExceptionRoomState {
  if (state.lastDailyDate === date) return state;
  const gap = state.lastDailyDate ? dayNumber(date) - dayNumber(state.lastDailyDate) : Infinity;
  return {
    ...state,
    xp: state.xp + 50,
    dailyStreak: gap === 1 ? state.dailyStreak + 1 : 1,
    lastDailyDate: date,
    lastDailyProfile: profile,
  };
}

let memoryFallback: string | null = null;

function safeParse(raw: string): ExceptionRoomState {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const fallback = defaultExceptionRoomState();
    return {
      xp: typeof parsed.xp === 'number' && parsed.xp >= 0 ? parsed.xp : fallback.xp,
      soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : fallback.soundOn,
      campaignComplete: typeof parsed.campaignComplete === 'boolean'
        ? parsed.campaignComplete
        : fallback.campaignComplete,
      campaignRewarded: typeof parsed.campaignRewarded === 'boolean'
        ? parsed.campaignRewarded
        : fallback.campaignRewarded,
      bestProfile: PROFILES.includes(parsed.bestProfile as OperatorProfile)
        ? parsed.bestProfile as OperatorProfile
        : null,
      dailyStreak: typeof parsed.dailyStreak === 'number' && parsed.dailyStreak >= 0
        ? parsed.dailyStreak
        : fallback.dailyStreak,
      lastDailyDate: typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : null,
      lastDailyProfile: PROFILES.includes(parsed.lastDailyProfile as OperatorProfile)
        ? parsed.lastDailyProfile as OperatorProfile
        : null,
    };
  } catch {
    return defaultExceptionRoomState();
  }
}

export function loadExceptionRoomState(): ExceptionRoomState {
  try {
    const stored = typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(EXCEPTION_STATE_KEY);
    const raw = stored ?? memoryFallback;
    return raw ? safeParse(raw) : defaultExceptionRoomState();
  } catch {
    return memoryFallback ? safeParse(memoryFallback) : defaultExceptionRoomState();
  }
}

export function saveExceptionRoomState(state: ExceptionRoomState): void {
  const raw = JSON.stringify(state);
  memoryFallback = raw;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(EXCEPTION_STATE_KEY, raw);
  } catch {
    // The in-memory fallback preserves progress for this browser session.
  }
  syncLabProfile();
}
