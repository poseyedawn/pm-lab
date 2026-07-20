import { nextShift, shiftConfig } from '@/lib/exception-room/config';
import {
  admitDueCases,
  advanceClock,
  caseById,
  minimumSafeCost,
  nextScheduledArrival,
  outstandingCurrentWork,
} from '@/lib/exception-room/engine-helpers';
import { buildSchedule, scheduledCase } from '@/lib/exception-room/schedule';
import {
  type CaseRuntimeState,
  type DecisionInput,
  type DecisionOutcome,
  type EngineErrorCode,
  type EngineResult,
  type ExceptionAction,
  type ExceptionCase,
  type ExceptionRunState,
  type ExpirationReason,
  type RunEvent,
  type RunMode,
  type ScheduledExceptionCase,
  type ShiftNumber,
} from '@/lib/exception-room/types';

const failure = (
  state: ExceptionRunState,
  code: EngineErrorCode,
  message: string,
): EngineResult => ({ ok: false, state, error: { code, message } });

const success = (state: ExceptionRunState): EngineResult => ({ ok: true, state });

function initialCaseState(): CaseRuntimeState {
  return { status: 'scheduled', evidenceViewedIds: [], warningEmitted: false, breachEmitted: false };
}

export function startExceptionRun(
  seed: number,
  mode: RunMode,
  cases: readonly ExceptionCase[],
): ExceptionRunState {
  const config = shiftConfig(1);
  const schedule = buildSchedule(cases, seed, mode);
  const caseStates = Object.fromEntries(cases.map((candidate) => [candidate.id, initialCaseState()]));
  return admitDueCases({
    seed,
    mode,
    shift: 1,
    tick: config.openingTick,
    capacityRemaining: config.capacity,
    schedule,
    caseStates,
    queuedCaseIds: [],
    selectedCaseId: null,
    resolutions: [],
    status: 'active',
    history: [],
  });
}

export function availableCases(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): ScheduledExceptionCase[] {
  return state.queuedCaseIds.flatMap((caseId) => {
    const runtime = state.caseStates[caseId];
    const candidate = caseById(cases, caseId);
    if (!runtime || runtime.status !== 'queued' || !candidate) return [];
    return [scheduledCase(candidate, state.schedule)];
  });
}

export function selectCase(state: ExceptionRunState, caseId: string): EngineResult {
  if (state.status === 'complete') return failure(state, 'run-complete', 'The run is already complete.');
  const runtime = state.caseStates[caseId];
  if (!runtime) return failure(state, 'unknown-case', `Unknown case ${caseId}.`);
  if (runtime.status !== 'queued') return failure(state, 'case-unavailable', `Case ${caseId} is not available.`);
  return success({
    ...state,
    selectedCaseId: caseId,
    history: [...state.history, { type: 'case-opened', caseId, tick: state.tick }],
  });
}

export function viewEvidence(
  state: ExceptionRunState,
  caseId: string,
  evidenceId: string,
  cases: readonly ExceptionCase[],
): EngineResult {
  if (state.status === 'complete') return failure(state, 'run-complete', 'The run is already complete.');
  const candidate = caseById(cases, caseId);
  const runtime = state.caseStates[caseId];
  if (!candidate || !runtime) return failure(state, 'unknown-case', `Unknown case ${caseId}.`);
  if (runtime.status !== 'queued') return failure(state, 'case-unavailable', `Case ${caseId} is not available.`);
  if (!candidate.evidence.some((item) => item.id === evidenceId)) {
    return failure(state, 'unknown-evidence', `Unknown evidence ${evidenceId} for case ${caseId}.`);
  }
  if (runtime.evidenceViewedIds.includes(evidenceId)) return success(state);
  return success({
    ...state,
    caseStates: {
      ...state.caseStates,
      [caseId]: { ...runtime, evidenceViewedIds: [...runtime.evidenceViewedIds, evidenceId] },
    },
    history: [...state.history, { type: 'evidence-viewed', caseId, evidenceId, tick: state.tick }],
  });
}

function decisionDetails(candidate: ExceptionCase, action: ExceptionAction): readonly string[] {
  if (action === 'correct') return candidate.correctionOptions?.map((option) => option.id) ?? [];
  if (action === 'escalate') return candidate.escalationOptions?.map((option) => option.id) ?? [];
  return [];
}

function outcomeFor(candidate: ExceptionCase, decision: DecisionInput): DecisionOutcome | null {
  const details = decisionDetails(candidate, decision.action);
  if (details.length > 0 && (!decision.detailId || !details.includes(decision.detailId))) return null;
  if (details.length === 0 && decision.detailId) return null;
  if (decision.action === 'correct' && decision.detailId) {
    return candidate.detailOutcomeById?.correct?.[decision.detailId] ?? null;
  }
  if (decision.action === 'escalate' && decision.detailId) {
    return candidate.detailOutcomeById?.escalate?.[decision.detailId] ?? null;
  }
  return candidate.outcomeByAction[decision.action];
}

function expireCases(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
  completedShift: ShiftNumber,
  reason: ExpirationReason,
  hasNextShift: boolean,
): ExceptionRunState {
  const caseStates = { ...state.caseStates };
  const history: RunEvent[] = [...state.history];
  const queuedCaseIds = [...state.queuedCaseIds];
  for (const timing of state.schedule.filter((entry) => entry.shift <= completedShift)) {
    const runtime = caseStates[timing.caseId];
    const candidate = caseById(cases, timing.caseId);
    if (!runtime || !candidate || ['resolved', 'escalated', 'expired'].includes(runtime.status)) continue;
    if (hasNextShift && candidate.carryover) continue;
    const expirationReason = runtime.status === 'scheduled' ? 'run-ended-before-arrival' : reason;
    caseStates[timing.caseId] = { ...runtime, status: 'expired', expirationReason };
    const queueIndex = queuedCaseIds.indexOf(timing.caseId);
    if (queueIndex >= 0) queuedCaseIds.splice(queueIndex, 1);
    history.push({ type: 'case-expired', caseId: timing.caseId, tick: state.tick, reason: expirationReason });
  }
  return { ...state, caseStates, queuedCaseIds, history };
}

function finishShift(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
  reason: ExpirationReason,
): ExceptionRunState {
  const completedShift = state.shift;
  const followingShift = state.mode === 'practice' ? null : nextShift(completedShift);
  let nextState = expireCases(state, cases, completedShift, reason, followingShift !== null);
  const events: RunEvent[] = [...nextState.history];
  if (reason === 'capacity-constrained') {
    events.push({ type: 'capacity-exhausted', shift: completedShift, tick: state.tick });
  }
  events.push({ type: 'shift-complete', shift: completedShift, tick: state.tick });
  nextState = { ...nextState, history: events, selectedCaseId: null };

  if (followingShift === null) {
    return { ...expireCases(nextState, cases, completedShift, reason, false), status: 'complete' };
  }

  const config = shiftConfig(followingShift);
  const shifted = {
    ...nextState,
    shift: followingShift,
    capacityRemaining: config.capacity,
  };
  return advanceClock(shifted, config.openingTick, config.openingTick !== state.tick);
}

export function completeShiftIfNeeded(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): ExceptionRunState {
  if (state.status === 'complete') return state;
  const config = shiftConfig(state.shift);
  if (state.tick > config.maxTick) return finishShift(state, cases, 'shift-limit');

  const outstanding = outstandingCurrentWork(state);
  if (outstanding.length === 0) return finishShift(state, cases, 'shift-limit');

  if (state.queuedCaseIds.length === 0) {
    const nextArrival = nextScheduledArrival(state);
    if (nextArrival !== null) {
      return completeShiftIfNeeded(advanceClock(state, nextArrival, true), cases);
    }
  }

  const safeCost = minimumSafeCost(state, cases);
  if (state.queuedCaseIds.length > 0 && (safeCost === null || safeCost > state.capacityRemaining)) {
    return finishShift(state, cases, 'capacity-constrained');
  }
  return state;
}

export function advanceAfterResolution(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): ExceptionRunState {
  return completeShiftIfNeeded(advanceClock(state, state.tick + 1, false), cases);
}

export function endShift(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): EngineResult {
  if (state.status === 'complete') return failure(state, 'run-complete', 'The run is already complete.');
  const ended = {
    ...state,
    history: [...state.history, { type: 'shift-ended', shift: state.shift, tick: state.tick } as const],
  };
  return success(finishShift(ended, cases, 'operator-ended'));
}

export function resolveCase(
  state: ExceptionRunState,
  decision: DecisionInput,
  cases: readonly ExceptionCase[],
): EngineResult {
  if (state.status === 'complete') return failure(state, 'run-complete', 'The run is already complete.');
  const candidate = caseById(cases, decision.caseId);
  const runtime = state.caseStates[decision.caseId];
  if (!candidate || !runtime) return failure(state, 'unknown-case', `Unknown case ${decision.caseId}.`);
  if (runtime.status !== 'queued') {
    return failure(state, 'case-unavailable', `Case ${decision.caseId} is not available.`);
  }
  const outcome = outcomeFor(candidate, decision);
  if (!outcome) return failure(state, 'invalid-detail', 'The selected action detail is not valid for this case.');
  const missingRequiredEvidenceIds = candidate.requiredEvidenceIds.filter(
    (evidenceId) => !runtime.evidenceViewedIds.includes(evidenceId),
  );
  if (missingRequiredEvidenceIds.length > 0 && !decision.acceptEvidenceDeficit) {
    return failure(
      state,
      'evidence-required',
      `Review ${missingRequiredEvidenceIds.length} required evidence ${missingRequiredEvidenceIds.length === 1 ? 'item' : 'items'} or explicitly continue without them.`,
    );
  }
  const capacityCost = candidate.actionCosts[decision.action];
  if (capacityCost > state.capacityRemaining) {
    return failure(state, 'insufficient-capacity', 'The selected action costs more than the remaining capacity.');
  }

  const resolution = {
    caseId: decision.caseId,
    action: decision.action,
    ...(decision.detailId ? { detailId: decision.detailId } : {}),
    evidenceViewedIds: [...runtime.evidenceViewedIds],
    requiredEvidenceIds: [...candidate.requiredEvidenceIds],
    missingRequiredEvidenceIds,
    acceptedEvidenceDeficit: missingRequiredEvidenceIds.length > 0,
    resolvedAtTick: state.tick,
    capacityCost,
    outcome,
    learningDestination: candidate.learningDestination,
  } as const;
  const resolvedState: ExceptionRunState = {
    ...state,
    capacityRemaining: state.capacityRemaining - capacityCost,
    caseStates: {
      ...state.caseStates,
      [decision.caseId]: {
        ...runtime,
        status: decision.action === 'escalate' ? 'escalated' : 'resolved',
      },
    },
    queuedCaseIds: state.queuedCaseIds.filter((caseId) => caseId !== decision.caseId),
    selectedCaseId: null,
    resolutions: [...state.resolutions, resolution],
    history: [...state.history, { type: 'case-resolved', resolution }],
  };
  return success(advanceAfterResolution(resolvedState, cases));
}
