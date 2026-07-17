import { caseById, isTerminal, timingById } from '@/lib/exception-room/engine-helpers';
import type {
  ConsequenceTier,
  ExceptionCase,
  ExceptionRunState,
  OperatorProfile,
  ScoreBreakdown,
} from '@/lib/exception-room/types';

export const CONSEQUENCE_WEIGHTS = {
  low: 1,
  medium: 3,
  high: 8,
  critical: 15,
} as const satisfies Readonly<Record<ConsequenceTier, number>>;

export interface ProfileFacts {
  safety: number;
  service: number;
  capacity: number;
  unsafeHighOrCriticalApproval: boolean;
  resolvedCount: number;
  escalatedCount: number;
  unnecessaryEscalations: number;
  unresolved: number;
  arrivals: number;
  preferredEscalations: number;
}

const roundPercent = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : Math.max(0, Math.min(100, Math.round((100 * numerator) / denominator)));

export function profileForFacts(facts: ProfileFacts): OperatorProfile {
  const backlogBound = facts.unresolved > facts.arrivals / 3;
  if (
    facts.safety >= 80
    && facts.service >= 80
    && facts.capacity >= 80
    && !facts.unsafeHighOrCriticalApproval
  ) return 'Balanced Operator';
  if ((facts.service >= 85 || facts.capacity >= 85) && facts.safety < 70 && !backlogBound) {
    return 'Speed Over Evidence';
  }
  if (
    facts.resolvedCount > 0
    && facts.escalatedCount > facts.resolvedCount / 2
    && facts.unnecessaryEscalations >= 2
  ) return 'Escalation Heavy';
  if (backlogBound) return 'Backlog Bound';
  if (
    facts.safety >= 90
    && facts.service < 70
    && facts.escalatedCount > facts.preferredEscalations
  ) return 'Safety First';
  return 'Calibration in Progress';
}

function repeatedArchetypes(cases: readonly ExceptionCase[]): string[] {
  const counts = new Map<string, number>();
  for (const candidate of cases) counts.set(candidate.archetype, (counts.get(candidate.archetype) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([archetype]) => archetype).sort();
}

export function scoreRun(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): ScoreBreakdown {
  const totalConsequenceWeight = cases.reduce(
    (total, candidate) => total + CONSEQUENCE_WEIGHTS[candidate.consequence],
    0,
  );
  const totalServiceWeight = cases.reduce(
    (total, candidate) => total + Math.min(CONSEQUENCE_WEIGHTS[candidate.consequence], 8),
    0,
  );

  let safelyHandledWeight = 0;
  let onTimeServiceWeight = 0;
  let safeResolutionValue = 0;
  let capacitySpent = 0;
  let unsafeHighOrCriticalApproval = false;

  for (const resolution of state.resolutions) {
    const candidate = caseById(cases, resolution.caseId);
    const timing = timingById(state.schedule, resolution.caseId);
    if (!candidate || !timing) continue;
    const safe = resolution.outcome !== 'unsafe';
    const serviceEligible = resolution.outcome === 'preferred' || resolution.outcome === 'acceptable';
    if (safe) safelyHandledWeight += CONSEQUENCE_WEIGHTS[candidate.consequence];
    if (serviceEligible && resolution.resolvedAtTick <= timing.dueAtTick) {
      onTimeServiceWeight += Math.min(CONSEQUENCE_WEIGHTS[candidate.consequence], 8);
    }
    if (serviceEligible) {
      safeResolutionValue += Math.min(
        resolution.capacityCost,
        candidate.actionCosts[candidate.preferredAction],
      );
    }
    capacitySpent += resolution.capacityCost;
    if (
      resolution.action === 'approve'
      && resolution.outcome === 'unsafe'
      && ['high', 'critical'].includes(candidate.consequence)
    ) {
      unsafeHighOrCriticalApproval = true;
    }
  }

  const unresolved = Object.values(state.caseStates).filter((runtime) => !isTerminal(runtime)
    || runtime.status === 'expired').length;
  const safeCompletions = state.resolutions.filter((resolution) => resolution.outcome !== 'unsafe').length;
  const unsafeApprovals = state.resolutions.filter((resolution) =>
    resolution.action === 'approve' && resolution.outcome === 'unsafe').length;
  const correctCorrections = state.resolutions.filter((resolution) =>
    resolution.action === 'correct'
    && (resolution.outcome === 'preferred' || resolution.outcome === 'acceptable')).length;
  const justifiedEscalations = state.resolutions.filter((resolution) =>
    resolution.action === 'escalate'
    && (resolution.outcome === 'preferred' || resolution.outcome === 'acceptable')).length;
  const unnecessaryEscalations = state.resolutions.filter((resolution) =>
    resolution.action === 'escalate' && resolution.outcome === 'unnecessary').length;
  const escalatedCount = state.resolutions.filter((resolution) => resolution.action === 'escalate').length;
  const serviceBreaches = new Set(state.history.flatMap((event) =>
    event.type === 'case-breached' ? [event.caseId] : [])).size;
  const evidenceInspectionRate = roundPercent(
    state.resolutions.filter((resolution) => resolution.evidenceViewedIds.length > 0).length,
    state.resolutions.length,
  );

  const safety = roundPercent(safelyHandledWeight, totalConsequenceWeight);
  const service = roundPercent(onTimeServiceWeight, totalServiceWeight);
  const capacity = roundPercent(safeResolutionValue, capacitySpent);
  const profile = profileForFacts({
    safety,
    service,
    capacity,
    unsafeHighOrCriticalApproval,
    resolvedCount: state.resolutions.length,
    escalatedCount,
    unnecessaryEscalations,
    unresolved,
    arrivals: cases.length,
    preferredEscalations: cases.filter((candidate) => candidate.preferredAction === 'escalate').length,
  });

  return {
    safety,
    service,
    capacity,
    safeCompletions,
    unsafeApprovals,
    correctCorrections,
    justifiedEscalations,
    unnecessaryEscalations,
    serviceBreaches,
    unresolved,
    capacitySpent,
    evidenceInspectionRate,
    repeatedExceptionClasses: repeatedArchetypes(cases),
    profile,
  };
}
