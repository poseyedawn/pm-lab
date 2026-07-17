import type {
  CaseRuntimeState,
  ExceptionAction,
  ExceptionCase,
  ExceptionRunState,
  RunEvent,
  ScheduledCaseTiming,
} from '@/lib/exception-room/types';

const terminalStatuses = new Set<CaseRuntimeState['status']>(['resolved', 'escalated', 'expired']);

export const isTerminal = (runtime: CaseRuntimeState): boolean => terminalStatuses.has(runtime.status);

export function caseById(cases: readonly ExceptionCase[], caseId: string): ExceptionCase | undefined {
  return cases.find((candidate) => candidate.id === caseId);
}

export function timingById(
  schedule: readonly ScheduledCaseTiming[],
  caseId: string,
): ScheduledCaseTiming | undefined {
  return schedule.find((timing) => timing.caseId === caseId);
}

export function replaceCaseState(
  state: ExceptionRunState,
  caseId: string,
  runtime: CaseRuntimeState,
): ExceptionRunState {
  return { ...state, caseStates: { ...state.caseStates, [caseId]: runtime } };
}

export function admitDueCases(state: ExceptionRunState): ExceptionRunState {
  const arrivals = state.schedule.filter((timing) => {
    const runtime = state.caseStates[timing.caseId];
    return runtime?.status === 'scheduled' && timing.shift <= state.shift && timing.arrivesAtTick <= state.tick;
  });
  if (arrivals.length === 0) return state;

  const caseStates = { ...state.caseStates };
  const history: RunEvent[] = [...state.history];
  const queuedCaseIds = [...state.queuedCaseIds];
  for (const timing of arrivals) {
    caseStates[timing.caseId] = { ...caseStates[timing.caseId], status: 'queued' };
    if (!queuedCaseIds.includes(timing.caseId)) queuedCaseIds.push(timing.caseId);
    history.push({ type: 'case-arrived', caseId: timing.caseId, tick: state.tick });
  }
  return { ...state, caseStates, queuedCaseIds, history };
}

export function advanceClock(
  state: ExceptionRunState,
  toTick: number,
  recordTimeAdvance: boolean,
): ExceptionRunState {
  if (toTick < state.tick) throw new Error(`Cannot move tick backward from ${state.tick} to ${toTick}`);
  if (toTick === state.tick) return admitDueCases(state);

  const caseStates = { ...state.caseStates };
  const history: RunEvent[] = [...state.history];
  if (recordTimeAdvance) history.push({ type: 'time-advanced', fromTick: state.tick, toTick });

  for (const caseId of state.queuedCaseIds) {
    const runtime = caseStates[caseId];
    const timing = timingById(state.schedule, caseId);
    if (!runtime || !timing || runtime.status !== 'queued') continue;

    let nextRuntime = runtime;
    if (!runtime.warningEmitted && state.tick < timing.dueAtTick - 1 && toTick >= timing.dueAtTick - 1) {
      nextRuntime = { ...nextRuntime, warningEmitted: true };
      history.push({ type: 'case-warning', caseId, tick: timing.dueAtTick - 1 });
    }
    if (!runtime.breachEmitted && state.tick <= timing.dueAtTick && toTick > timing.dueAtTick) {
      nextRuntime = { ...nextRuntime, breachEmitted: true };
      history.push({ type: 'case-breached', caseId, tick: timing.dueAtTick + 1 });
    }
    caseStates[caseId] = nextRuntime;
  }

  return admitDueCases({ ...state, tick: toTick, caseStates, history });
}

function detailOutcomes(candidate: ExceptionCase, action: ExceptionAction): readonly string[] {
  if (action === 'correct') return Object.values(candidate.detailOutcomeById?.correct ?? {});
  if (action === 'escalate') return Object.values(candidate.detailOutcomeById?.escalate ?? {});
  return [];
}

function actionAvoidsHarm(candidate: ExceptionCase, action: ExceptionAction): boolean {
  const details = detailOutcomes(candidate, action);
  if (details.length > 0) return details.some((outcome) => outcome !== 'unsafe');
  return candidate.outcomeByAction[action] !== 'unsafe';
}

export function minimumSafeCost(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): number | null {
  let minimum: number | null = null;
  for (const caseId of state.queuedCaseIds) {
    const runtime = state.caseStates[caseId];
    const candidate = caseById(cases, caseId);
    if (!runtime || runtime.status !== 'queued' || !candidate) continue;
    for (const action of Object.keys(candidate.actionCosts) as ExceptionAction[]) {
      if (!actionAvoidsHarm(candidate, action)) continue;
      const cost = candidate.actionCosts[action];
      minimum = minimum === null ? cost : Math.min(minimum, cost);
    }
  }
  return minimum;
}

export function outstandingCurrentWork(state: ExceptionRunState): string[] {
  return state.schedule
    .filter((timing) => timing.shift <= state.shift)
    .map((timing) => timing.caseId)
    .filter((caseId) => {
      const runtime = state.caseStates[caseId];
      return runtime ? !isTerminal(runtime) : false;
    });
}

export function nextScheduledArrival(state: ExceptionRunState): number | null {
  const arrivals = state.schedule
    .filter((timing) => timing.shift === state.shift && state.caseStates[timing.caseId]?.status === 'scheduled')
    .map((timing) => timing.arrivesAtTick)
    .filter((tick) => tick > state.tick);
  return arrivals.length > 0 ? Math.min(...arrivals) : null;
}
