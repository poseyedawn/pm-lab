import { z } from 'zod';
import { dayNumber } from '@/lib/engine/daily';
import { CAMPAIGN_CASES } from '@/lib/exception-room/content/campaign';
import { PRACTICE_CASES } from '@/lib/exception-room/content/practice';
import { replayRun } from '@/lib/exception-room/replay';
import { saveGameProgress } from '@/services/labProfileService';
import type {
  DecisionInput,
  ExceptionRunPhase,
  ExceptionRunState,
  OperatorProfile,
  RunEvent,
} from '@/lib/exception-room/types';

export const EXCEPTION_STATE_KEY = 'pmlab:exception-room:v1';
export const EXCEPTION_ACTIVE_RUN_KEY = 'pmlab:exception-room:active:v1';
export type ActiveExceptionMode = 'campaign' | 'practice';

export interface ExceptionRoomState {
  xp: number;
  soundOn: boolean;
  practiceComplete: boolean;
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
  practiceComplete: false,
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
    practiceComplete: true,
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
      practiceComplete: typeof parsed.practiceComplete === 'boolean'
        ? parsed.practiceComplete
        : parsed.campaignComplete === true,
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

export function recordPracticeCompletion(state: ExceptionRoomState): ExceptionRoomState {
  return { ...state, practiceComplete: true };
}

export interface ActiveExceptionRunSnapshot {
  seed: number;
  mode: ActiveExceptionMode;
  run: ExceptionRunState;
  phase: ExceptionRunPhase;
  lastDecision: DecisionInput | null;
}

const activeRunSchema = z.object({
  version: z.literal(1),
  seed: z.number().int().nonnegative(),
  mode: z.enum(['campaign', 'practice']),
  phase: z.enum(['review', 'reveal', 'debrief']),
  lastDecision: z.object({
    caseId: z.string().min(1),
    action: z.enum(['approve', 'correct', 'escalate']),
    detailId: z.string().min(1).optional(),
    acceptEvidenceDeficit: z.boolean().optional(),
  }).nullable(),
  history: z.array(z.object({ type: z.string().min(1) }).passthrough()),
});

let activeRunMemoryFallback: string | null = null;

function clearActiveRunStorage(): void {
  activeRunMemoryFallback = null;
  try {
    if (typeof window !== 'undefined') window.localStorage.removeItem(EXCEPTION_ACTIVE_RUN_KEY);
  } catch {
    // Storage can be denied. The memory fallback is already cleared.
  }
}

export function clearActiveExceptionRun(): void {
  clearActiveRunStorage();
}

export function saveActiveExceptionRun(snapshot: ActiveExceptionRunSnapshot): void {
  const raw = JSON.stringify({
    version: 1,
    seed: snapshot.seed,
    mode: snapshot.mode,
    phase: snapshot.phase,
    lastDecision: snapshot.lastDecision,
    history: snapshot.run.history,
  });
  activeRunMemoryFallback = raw;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(EXCEPTION_ACTIVE_RUN_KEY, raw);
  } catch {
    // The in-memory fallback preserves the active run for this browser session.
  }
}

export function loadActiveExceptionRun(
  requestedMode?: ActiveExceptionMode,
): ActiveExceptionRunSnapshot | null {
  try {
    const stored = typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(EXCEPTION_ACTIVE_RUN_KEY);
    const raw = stored ?? activeRunMemoryFallback;
    if (!raw) return null;
    const parsed = activeRunSchema.safeParse(JSON.parse(raw));
    if (!parsed.success || (requestedMode && parsed.data.mode !== requestedMode)) return null;
    const cases = parsed.data.mode === 'practice' ? PRACTICE_CASES : CAMPAIGN_CASES;
    const replayed = replayRun(
      parsed.data.seed,
      parsed.data.mode,
      parsed.data.history as unknown as readonly RunEvent[],
      cases,
    );
    if (!replayed.ok) {
      clearActiveRunStorage();
      return null;
    }
    const lastResolution = replayed.state.resolutions.at(-1);
    const validReveal = parsed.data.phase !== 'reveal'
      || (parsed.data.lastDecision !== null
        && lastResolution?.caseId === parsed.data.lastDecision.caseId);
    const validDebrief = parsed.data.phase !== 'debrief' || replayed.state.status === 'complete';
    const validReview = parsed.data.phase !== 'review' || replayed.state.status === 'active';
    if (!validReveal || !validDebrief || !validReview) {
      clearActiveRunStorage();
      return null;
    }
    return {
      seed: parsed.data.seed,
      mode: parsed.data.mode,
      run: replayed.state,
      phase: parsed.data.phase,
      lastDecision: parsed.data.lastDecision,
    };
  } catch {
    clearActiveRunStorage();
    return null;
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
  saveGameProgress({
    gameId: 'exception-room',
    xp: state.xp,
    completedMilestones: [
      ...(state.practiceComplete ? ['practice:complete'] : []),
      ...(state.campaignComplete ? ['campaign:complete'] : []),
      ...(state.bestProfile ? [`profile:${state.bestProfile}`] : []),
    ],
    lastPlayedAt: new Date().toISOString(),
  });
}
