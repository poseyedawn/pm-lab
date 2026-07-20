import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { availableCases, endShift, resolveCase, selectCase, startExceptionRun, viewEvidence } from '@/lib/exception-room/engine';
import { CONSEQUENCE_WEIGHTS, scoreRun } from '@/lib/exception-room/scoring';
import { surfaceCueSignature } from '@/lib/exception-room/validation';
import { hashString, mulberry32 } from '@/lib/prng';
import type {
  DecisionInput,
  ExceptionAction,
  ExceptionCase,
  ExceptionRunState,
  ScoreBreakdown,
} from '@/lib/exception-room/types';

export type SimulationPolicy =
  | 'preferred'
  | 'approve-only'
  | 'escalate-only'
  | 'correction-heavy'
  | 'earliest-due'
  | 'highest-consequence'
  | 'random'
  | 'cue-only'
  | 'recommendation-only'
  | 'resolve-only-cheap';

function optionFor(candidate: ExceptionCase, action: ExceptionAction, preferBest: boolean): string | undefined {
  if (action === 'approve') return undefined;
  const options = action === 'correct' ? candidate.correctionOptions : candidate.escalationOptions;
  if (!options || options.length === 0) return undefined;
  if (!preferBest) return options[0].id;
  const outcomes = action === 'correct'
    ? candidate.detailOutcomeById?.correct
    : candidate.detailOutcomeById?.escalate;
  return options.find((option) => outcomes?.[option.id] === candidate.outcomeByAction[action])?.id
    ?? options[0].id;
}

function cueAction(candidate: ExceptionCase, cases: readonly ExceptionCase[]): ExceptionAction {
  const signature = surfaceCueSignature(candidate);
  return [...cases]
    .filter((item) => surfaceCueSignature(item) === signature)
    .sort((left, right) => left.id.localeCompare(right.id))[0].preferredAction;
}

function decisionFor(
  candidate: ExceptionCase,
  policy: SimulationPolicy,
  cases: readonly ExceptionCase[],
  random: () => number,
): DecisionInput {
  let action: ExceptionAction;
  if (policy === 'preferred' || policy === 'earliest-due' || policy === 'highest-consequence') {
    action = candidate.preferredAction;
  } else if (policy === 'approve-only' || policy === 'resolve-only-cheap') {
    action = 'approve';
  } else if (policy === 'escalate-only') {
    action = 'escalate';
  } else if (policy === 'correction-heavy') {
    action = 'correct';
  } else if (policy === 'cue-only') {
    action = cueAction(candidate, cases);
  } else if (policy === 'recommendation-only') {
    action = candidate.confidenceBand === 'high' ? 'approve'
      : candidate.confidenceBand === 'low' ? 'escalate' : 'correct';
  } else {
    action = (['approve', 'correct', 'escalate'] as const)[Math.floor(random() * 3)];
  }
  const preferBest = policy === 'preferred' || policy === 'earliest-due' || policy === 'highest-consequence';
  const detailId = optionFor(candidate, action, preferBest);
  return { caseId: candidate.id, action, ...(detailId ? { detailId } : {}) };
}

function chooseCandidate(
  state: ExceptionRunState,
  policy: SimulationPolicy,
  cases: readonly ExceptionCase[],
  random: () => number,
): ExceptionCase | null {
  const available = availableCases(state, cases);
  if (policy === 'resolve-only-cheap') {
    return available.find((candidate) => candidate.preferredAction === 'approve') ?? null;
  }
  if (policy === 'highest-consequence') {
    return [...available].sort((left, right) =>
      CONSEQUENCE_WEIGHTS[right.consequence] - CONSEQUENCE_WEIGHTS[left.consequence])[0] ?? null;
  }
  if (policy === 'random') return available[Math.floor(random() * available.length)] ?? null;
  return [...available].sort((left, right) => left.dueAtTick - right.dueAtTick)[0] ?? null;
}

function usesEvidence(policy: SimulationPolicy): boolean {
  return policy === 'preferred' || policy === 'earliest-due' || policy === 'highest-consequence';
}

export function runPolicy(
  seed: number,
  policy: SimulationPolicy,
  cases: readonly ExceptionCase[] = CAMPAIGN_CASES,
): ExceptionRunState {
  let state = startExceptionRun(seed, 'campaign', cases);
  const random = mulberry32(hashString(`exception-room-policy:${policy}:${seed}`));
  let guard = 0;
  while (state.status === 'active' && guard < 40) {
    guard += 1;
    const candidate = chooseCandidate(state, policy, cases, random);
    if (!candidate) {
      const ended = endShift(state, cases);
      if (!ended.ok) throw new Error(ended.error.message);
      state = ended.state;
      continue;
    }

    const selected = selectCase(state, candidate.id);
    if (!selected.ok) throw new Error(selected.error.message);
    state = selected.state;
    if (usesEvidence(policy)) {
      for (const evidenceId of candidate.requiredEvidenceIds) {
        const viewed = viewEvidence(state, candidate.id, evidenceId, cases);
        if (!viewed.ok) throw new Error(viewed.error.message);
        state = viewed.state;
      }
    }

    const decision = decisionFor(candidate, policy, cases, random);
    const resolved = resolveCase(
      state,
      usesEvidence(policy) ? decision : { ...decision, acceptEvidenceDeficit: true },
      cases,
    );
    if (!resolved.ok && resolved.error.code === 'insufficient-capacity') {
      const ended = endShift(state, cases);
      if (!ended.ok) throw new Error(ended.error.message);
      state = ended.state;
    } else if (!resolved.ok) {
      throw new Error(resolved.error.message);
    } else {
      state = resolved.state;
    }
  }
  if (state.status !== 'complete') throw new Error(`Policy ${policy} exceeded the transition guard.`);
  return state;
}

export function scorePolicy(
  seed: number,
  policy: SimulationPolicy,
  cases: readonly ExceptionCase[] = CAMPAIGN_CASES,
): ScoreBreakdown {
  return scoreRun(runPolicy(seed, policy, cases), cases);
}
