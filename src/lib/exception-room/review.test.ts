import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { buildDebrief } from '@/lib/exception-room/review';
import { runPolicy } from '@/lib/exception-room/simulation';

describe('buildDebrief', () => {
  it('is deterministic, concise, and grounded in run facts', () => {
    const state = runPolicy(44, 'preferred');
    const first = buildDebrief(state, CAMPAIGN_CASES);
    expect(first).toEqual(buildDebrief(state, CAMPAIGN_CASES));
    expect(first.strengths).toHaveLength(2);
    expect(first.strengths.every((item) => item.length > 0)).toBe(true);
    expect(first.improvement.length).toBeGreaterThan(0);
    expect(first.repeatedSignal).toContain('recurring date drift');
  });

  it('never praises unsafe approvals', () => {
    const debrief = buildDebrief(runPolicy(44, 'approve-only'), CAMPAIGN_CASES);
    expect(debrief.improvement).toContain('evidence');
    expect(debrief.strengths.join(' ')).not.toContain('avoided harmful approvals');
  });

  it('surfaces backlog, escalation, and low-evidence improvements', () => {
    expect(buildDebrief(runPolicy(2, 'resolve-only-cheap'), CAMPAIGN_CASES).improvement)
      .toContain('backlog-bound');
    expect(buildDebrief(runPolicy(2, 'escalate-only'), CAMPAIGN_CASES).improvement)
      .toContain('escalation');
    expect(buildDebrief(runPolicy(2, 'cue-only'), CAMPAIGN_CASES).improvement)
      .toContain('evidence');
  });
});
