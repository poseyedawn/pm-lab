import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import {
  availableCases,
  completeShiftIfNeeded,
  endShift,
  resolveCase,
  selectCase,
  startExceptionRun,
  viewEvidence,
} from '@/lib/exception-room/engine';
import { replayRun } from '@/lib/exception-room/replay';
import type {
  DecisionInput,
  ExceptionCase,
  ExceptionRunState,
  RunEvent,
} from '@/lib/exception-room/types';

function detailFor(candidate: ExceptionCase, action: DecisionInput['action']): string | undefined {
  if (action === 'correct') {
    return candidate.correctionOptions?.find((option) =>
      candidate.detailOutcomeById?.correct?.[option.id] === candidate.outcomeByAction.correct)?.id;
  }
  if (action === 'escalate') {
    return candidate.escalationOptions?.find((option) =>
      candidate.detailOutcomeById?.escalate?.[option.id] === candidate.outcomeByAction.escalate)?.id;
  }
  return undefined;
}

function resolvePreferred(state: ExceptionRunState, candidate: ExceptionCase): ExceptionRunState {
  let next = selectCase(state, candidate.id);
  expect(next.ok).toBe(true);
  if (!next.ok) return state;
  for (const evidenceId of candidate.requiredEvidenceIds) {
    next = viewEvidence(next.state, candidate.id, evidenceId, CAMPAIGN_CASES);
    expect(next.ok).toBe(true);
    if (!next.ok) return state;
  }
  const detailId = detailFor(candidate, candidate.preferredAction);
  const resolved = resolveCase(next.state, {
    caseId: candidate.id,
    action: candidate.preferredAction,
    ...(detailId ? { detailId } : {}),
  }, CAMPAIGN_CASES);
  expect(resolved.ok).toBe(true);
  return resolved.state;
}

function playPreferred(seed: number): ExceptionRunState {
  let state = startExceptionRun(seed, 'campaign', CAMPAIGN_CASES);
  let guard = 0;
  while (state.status === 'active' && guard < 20) {
    guard += 1;
    const candidate = availableCases(state, CAMPAIGN_CASES)
      .sort((left, right) => left.dueAtTick - right.dueAtTick)[0];
    if (!candidate) throw new Error('Preferred policy found no available case.');
    state = resolvePreferred(state, candidate);
  }
  return state;
}

describe('startExceptionRun', () => {
  it('starts deterministically with three admitted cases and Shift 1 capacity', () => {
    const first = startExceptionRun(42, 'campaign', CAMPAIGN_CASES);
    const second = startExceptionRun(42, 'campaign', CAMPAIGN_CASES);
    expect(first).toEqual(second);
    expect(first.shift).toBe(1);
    expect(first.tick).toBe(0);
    expect(first.capacityRemaining).toBe(8);
    expect(first.queuedCaseIds).toHaveLength(3);
    expect(first.history.filter((event) => event.type === 'case-arrived')).toHaveLength(3);
  });

  it('changes the seeded arrival assignment', () => {
    expect(startExceptionRun(1, 'campaign', CAMPAIGN_CASES).schedule)
      .not.toEqual(startExceptionRun(2, 'campaign', CAMPAIGN_CASES).schedule);
  });
});

describe('selection and evidence', () => {
  it('records selection and deduplicates evidence without advancing time or capacity', () => {
    const initial = startExceptionRun(7, 'campaign', CAMPAIGN_CASES);
    const candidate = availableCases(initial, CAMPAIGN_CASES)[0];
    const selected = selectCase(initial, candidate.id);
    expect(selected.ok).toBe(true);
    if (!selected.ok) return;
    const viewed = viewEvidence(selected.state, candidate.id, candidate.evidence[0].id, CAMPAIGN_CASES);
    expect(viewed.ok).toBe(true);
    if (!viewed.ok) return;
    const repeated = viewEvidence(viewed.state, candidate.id, candidate.evidence[0].id, CAMPAIGN_CASES);
    expect(repeated.ok).toBe(true);
    expect(repeated.state.tick).toBe(initial.tick);
    expect(repeated.state.capacityRemaining).toBe(initial.capacityRemaining);
    expect(repeated.state.caseStates[candidate.id].evidenceViewedIds).toEqual([candidate.evidence[0].id]);
    expect(repeated.state.history.filter((event) => event.type === 'evidence-viewed')).toHaveLength(1);
  });

  it('returns typed failures for unknown cases and evidence', () => {
    const initial = startExceptionRun(7, 'campaign', CAMPAIGN_CASES);
    expect(selectCase(initial, 'missing-case')).toMatchObject({ ok: false, error: { code: 'unknown-case' } });
    const candidate = availableCases(initial, CAMPAIGN_CASES)[0];
    expect(viewEvidence(initial, candidate.id, 'missing-evidence', CAMPAIGN_CASES))
      .toMatchObject({ ok: false, error: { code: 'unknown-evidence' } });
  });
});

describe('resolution and time', () => {
  it('records the pre-advance tick and advances exactly once', () => {
    const initial = startExceptionRun(9, 'campaign', CAMPAIGN_CASES);
    const candidate = availableCases(initial, CAMPAIGN_CASES)[0];
    const next = resolvePreferred(initial, candidate);
    expect(next.resolutions.at(-1)?.resolvedAtTick).toBe(0);
    expect(next.tick).toBe(1);
    expect(next.resolutions).toHaveLength(1);
    expect(next.resolutions.at(-1)?.learningDestination).toBe(candidate.learningDestination);
  });

  it('rejects invalid detail, insufficient capacity, and duplicate resolution', () => {
    const initial = startExceptionRun(9, 'campaign', CAMPAIGN_CASES);
    const candidate = availableCases(initial, CAMPAIGN_CASES).find((item) => item.preferredAction !== 'approve');
    expect(candidate).toBeDefined();
    if (!candidate) return;
    expect(resolveCase(initial, { caseId: candidate.id, action: candidate.preferredAction }, CAMPAIGN_CASES))
      .toMatchObject({ ok: false, error: { code: 'invalid-detail' } });
    expect(resolveCase({ ...initial, capacityRemaining: 0 }, {
      caseId: candidate.id,
      action: candidate.preferredAction,
      detailId: detailFor(candidate, candidate.preferredAction),
    }, CAMPAIGN_CASES)).toMatchObject({ ok: false, error: { code: 'insufficient-capacity' } });

    const resolved = resolvePreferred(initial, candidate);
    expect(resolveCase(resolved, {
      caseId: candidate.id,
      action: candidate.preferredAction,
      detailId: detailFor(candidate, candidate.preferredAction),
    }, CAMPAIGN_CASES)).toMatchObject({ ok: false, error: { code: 'case-unavailable' } });
  });

  it('allows resolution at each maximum tick and completes the full preferred run', () => {
    const state = playPreferred(18);
    expect(state.status).toBe('complete');
    expect(state.resolutions).toHaveLength(12);
    expect(state.resolutions.map((resolution) => resolution.resolvedAtTick)).toContain(7);
    expect(state.resolutions.map((resolution) => resolution.resolvedAtTick)).toContain(12);
    expect(Object.values(state.caseStates).every((runtime) =>
      ['resolved', 'escalated'].includes(runtime.status))).toBe(true);
  });

  it('does not let a cheap unsafe action keep a capacity-constrained shift open', () => {
    const initial = startExceptionRun(5, 'campaign', CAMPAIGN_CASES);
    const candidate = availableCases(initial, CAMPAIGN_CASES)
      .find((item) => item.actionCosts.approve === 1 && item.outcomeByAction.approve === 'unsafe'
        && item.actionCosts[item.preferredAction] > 1);
    expect(candidate).toBeDefined();
    if (!candidate) return;
    const caseStates = Object.fromEntries(Object.entries(initial.caseStates).map(([caseId, runtime]) => [
      caseId,
      caseId === candidate.id ? runtime : { ...runtime, status: 'expired' as const },
    ]));
    const constrained = completeShiftIfNeeded({
      ...initial,
      capacityRemaining: 1,
      caseStates,
      queuedCaseIds: [candidate.id],
    }, CAMPAIGN_CASES);
    expect(constrained.shift).toBe(2);
    expect(constrained.history.some((event) => event.type === 'capacity-exhausted')).toBe(true);
  });

  it('emits warning and breach once while a due case remains queued', () => {
    let state: ExceptionRunState | null = null;
    let target: ExceptionCase | null = null;
    for (let seed = 0; seed < 100 && !target; seed += 1) {
      let candidateState = startExceptionRun(seed, 'campaign', CAMPAIGN_CASES);
      while (candidateState.shift === 1) {
        const candidate = availableCases(candidateState, CAMPAIGN_CASES)
          .sort((left, right) => left.dueAtTick - right.dueAtTick)[0];
        candidateState = resolvePreferred(candidateState, candidate);
      }
      const dueSoon = availableCases(candidateState, CAMPAIGN_CASES)
        .find((candidate) => candidate.dueAtTick === 6);
      if (dueSoon) {
        state = candidateState;
        target = dueSoon;
      }
    }
    expect(state).not.toBeNull();
    expect(target).not.toBeNull();
    if (!state || !target) return;

    while (state.tick <= target.dueOffsetTicks + 4) {
      const other = availableCases(state, CAMPAIGN_CASES)
        .filter((candidate) => candidate.id !== target?.id)
        .sort((left, right) => left.dueAtTick - right.dueAtTick)[0];
      if (!other) break;
      state = resolvePreferred(state, other);
    }
    expect(state.history.filter((event) =>
      event.type === 'case-warning' && event.caseId === target?.id)).toHaveLength(1);
    expect(state.history.filter((event) =>
      event.type === 'case-breached' && event.caseId === target?.id)).toHaveLength(1);
  });
});

describe('replay', () => {
  it('reproduces byte-equivalent serializable state', () => {
    const original = playPreferred(23);
    const result = replayRun(23, 'campaign', original.history, CAMPAIGN_CASES);
    expect(result.ok).toBe(true);
    expect(result.state).toEqual(original);
  });

  it('rejects a tampered history without partial success', () => {
    const original = playPreferred(23);
    const history: RunEvent[] = original.history.map((event) => {
      if (event.type !== 'case-resolved') return event;
      return {
        ...event,
        resolution: { ...event.resolution, capacityCost: event.resolution.capacityCost + 1 },
      };
    });
    expect(replayRun(23, 'campaign', history, CAMPAIGN_CASES))
      .toMatchObject({ ok: false, error: { code: 'invalid-history' } });
  });

  it('replays explicit end-shift inputs and their backlog consequences', () => {
    let state = startExceptionRun(31, 'campaign', CAMPAIGN_CASES);
    while (state.status === 'active') {
      const ended = endShift(state, CAMPAIGN_CASES);
      expect(ended.ok).toBe(true);
      if (!ended.ok) return;
      state = ended.state;
    }
    const replayed = replayRun(31, 'campaign', state.history, CAMPAIGN_CASES);
    expect(replayed.ok).toBe(true);
    expect(replayed.state).toEqual(state);
  });
});
