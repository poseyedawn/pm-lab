import { caseById, isTerminal } from '@/lib/exception-room/engine-helpers';
import type {
  ExceptionCase,
  ExceptionRunState,
  RouteReason,
  ScheduledExceptionCase,
} from '@/lib/exception-room/types';

const TITLES: Readonly<Record<string, string>> = {
  'effective-date-conflict': 'Effective date conflict',
  'unfamiliar-clean-layout': 'Unfamiliar clean layout',
  'missing-approval-evidence': 'Approval record missing',
  'sampled-clean-match': 'Clean quality sample',
  'low-confidence-unit-error': 'Unit mismatch',
  'repeated-date-drift-one': 'One-day date drift',
  'boundary-needs-owner': 'Policy boundary',
  'boundary-cleared-by-policy': 'Authority confirmed',
  'sampled-field-mismatch': 'Sample field mismatch',
  'conflict-needs-specialist': 'Conflicting sources',
  'missing-citation-correctable': 'Citation missing',
  'repeated-date-drift-two': 'Repeated date drift',
};

const REASON_LABELS: Readonly<Record<RouteReason, string>> = {
  'low-confidence': 'Low confidence',
  'conflicting-evidence': 'Conflicting evidence',
  'missing-evidence': 'Missing evidence',
  'policy-boundary': 'Policy boundary',
  'unfamiliar-input': 'Unfamiliar input',
  'random-quality-sample': 'Quality sample',
  'repeat-correction': 'Repeat exception',
};

export const caseTitle = (candidate: ExceptionCase): string => TITLES[candidate.id] ?? candidate.id;
export const routeReasonLabel = (reason: RouteReason): string => REASON_LABELS[reason];

export const dueLabel = (dueAtTick: number, tick: number): string => {
  const remaining = dueAtTick - tick;
  if (remaining <= 0) return 'Due now';
  if (remaining === 1) return 'Due next tick';
  return `Due in ${remaining} ticks`;
};

export interface DueSummary {
  remaining: number;
  count: number;
}

export function nextDueSummary(
  queue: readonly ScheduledExceptionCase[],
  tick: number,
): DueSummary | null {
  if (queue.length === 0) return null;
  const remaining = Math.min(...queue.map((candidate) => candidate.dueAtTick - tick));
  return {
    remaining,
    count: queue.filter((candidate) => candidate.dueAtTick - tick === remaining).length,
  };
}

export interface ShiftEndForecast {
  unresolved: number;
  expires: number;
  carries: number;
}

export function shiftEndForecast(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): ShiftEndForecast {
  let expires = 0;
  let carries = 0;
  for (const timing of state.schedule.filter((entry) => entry.shift <= state.shift)) {
    const runtime = state.caseStates[timing.caseId];
    const candidate = caseById(cases, timing.caseId);
    if (!runtime || !candidate || isTerminal(runtime)) continue;
    if (state.shift < 3 && candidate.carryover) carries += 1;
    else expires += 1;
  }
  return { unresolved: expires + carries, expires, carries };
}
