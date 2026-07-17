import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { profileForFacts, scoreRun } from '@/lib/exception-room/scoring';
import { runPolicy } from '@/lib/exception-room/simulation';
import type { CaseResolution, ExceptionRunState } from '@/lib/exception-room/types';

function replaceResolution(
  state: ExceptionRunState,
  caseId: string,
  replacement: Partial<CaseResolution>,
): ExceptionRunState {
  return {
    ...state,
    resolutions: state.resolutions.map((resolution) =>
      resolution.caseId === caseId ? { ...resolution, ...replacement } : resolution),
  };
}

describe('scoreRun', () => {
  it('gives the preferred evidence-backed policy a transparent Balanced result', () => {
    const score = scoreRun(runPolicy(12, 'preferred'), CAMPAIGN_CASES);
    expect(score).toMatchObject({
      safety: 100,
      service: 100,
      capacity: 100,
      unresolved: 0,
      evidenceInspectionRate: 100,
      profile: 'Balanced Operator',
    });
  });

  it('keeps cautious unnecessary escalation Safety-neutral while reducing Service and Capacity', () => {
    const preferredState = runPolicy(12, 'preferred');
    const baseline = scoreRun(preferredState, CAMPAIGN_CASES);
    const cautiousState = replaceResolution(preferredState, 'unfamiliar-clean-layout', {
      action: 'escalate',
      outcome: 'unnecessary',
      capacityCost: 3,
    });
    const cautious = scoreRun(cautiousState, CAMPAIGN_CASES);
    expect(cautious.safety).toBe(baseline.safety);
    expect(cautious.service).toBeLessThan(baseline.service);
    expect(cautious.capacity).toBeLessThan(baseline.capacity);
  });

  it('prevents Balanced when one critical case is approved unsafely', () => {
    const preferredState = runPolicy(12, 'preferred');
    const unsafeState = replaceResolution(preferredState, 'effective-date-conflict', {
      action: 'approve',
      outcome: 'unsafe',
      capacityCost: 1,
    });
    const score = scoreRun(unsafeState, CAMPAIGN_CASES);
    expect(score.safety).toBeGreaterThanOrEqual(80);
    expect(score.profile).not.toBe('Balanced Operator');
    expect(score.unsafeApprovals).toBe(1);
  });

  it('keeps every score bounded when no work is resolved', () => {
    const state = runPolicy(2, 'resolve-only-cheap');
    const score = scoreRun(state, CAMPAIGN_CASES);
    for (const value of [score.safety, score.service, score.capacity]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});

describe('profileForFacts', () => {
  const base = {
    safety: 75,
    service: 75,
    capacity: 75,
    unsafeHighOrCriticalApproval: false,
    resolvedCount: 12,
    escalatedCount: 4,
    unnecessaryEscalations: 0,
    unresolved: 0,
    arrivals: 12,
    preferredEscalations: 4,
  };

  it('uses the published first-match order for overlapping conditions', () => {
    expect(profileForFacts({
      ...base,
      safety: 90,
      service: 90,
      capacity: 90,
      escalatedCount: 7,
      unnecessaryEscalations: 3,
    })).toBe('Balanced Operator');
    expect(profileForFacts({
      ...base,
      safety: 60,
      service: 90,
      escalatedCount: 7,
      unnecessaryEscalations: 3,
    })).toBe('Speed Over Evidence');
  });

  it('lets backlog override a misleading high Capacity result', () => {
    expect(profileForFacts({
      ...base,
      safety: 20,
      service: 20,
      capacity: 100,
      unresolved: 9,
      resolvedCount: 3,
      escalatedCount: 0,
    })).toBe('Backlog Bound');
  });

  it('makes every descriptive profile reachable', () => {
    const profiles = [
      profileForFacts({ ...base, safety: 90, service: 90, capacity: 90 }),
      profileForFacts({ ...base, safety: 60, service: 90 }),
      profileForFacts({ ...base, escalatedCount: 7, unnecessaryEscalations: 3 }),
      profileForFacts({ ...base, unresolved: 5 }),
      profileForFacts({ ...base, safety: 95, service: 60, escalatedCount: 5 }),
      profileForFacts(base),
    ];
    expect(new Set(profiles)).toEqual(new Set([
      'Balanced Operator',
      'Speed Over Evidence',
      'Escalation Heavy',
      'Backlog Bound',
      'Safety First',
      'Calibration in Progress',
    ]));
  });
});
