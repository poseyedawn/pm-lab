import { describe, expect, it } from 'vitest';
import { CAMPAIGN_CASES, PRACTICE_CASES } from '@/lib/exception-room/cases';
import { SHIFT_CONFIGS } from '@/lib/exception-room/config';
import { buildSchedule } from '@/lib/exception-room/schedule';
import { validateCaseSet } from '@/lib/exception-room/validation';
import type { ExceptionCase } from '@/lib/exception-room/types';

describe('campaign content', () => {
  it('passes the complete campaign contract', () => {
    expect(validateCaseSet(CAMPAIGN_CASES, {
      expectedCount: 12,
      requireCampaignDistribution: true,
      requireSurfaceCuePairs: true,
    })).toEqual([]);
  });

  it('builds deterministic, valid schedules across 1,000 seeds', () => {
    for (let seed = 0; seed < 1_000; seed += 1) {
      const first = buildSchedule(CAMPAIGN_CASES, seed);
      const second = buildSchedule(CAMPAIGN_CASES, seed);
      expect(first).toEqual(second);
      expect(first).toHaveLength(12);
      for (const timing of first) {
        const config = SHIFT_CONFIGS.find((candidate) => candidate.shift === timing.shift);
        expect(config?.arrivalSlots).toContain(timing.arrivesAtTick);
        expect(timing.dueAtTick).toBeGreaterThan(timing.arrivesAtTick);
      }
    }
  });

  it('changes at least one arrival assignment across adjacent seeds', () => {
    expect(buildSchedule(CAMPAIGN_CASES, 10)).not.toEqual(buildSchedule(CAMPAIGN_CASES, 11));
  });

  it('rejects missing escalation handoffs and contradictory action outcomes', () => {
    const missingHandoff: ExceptionCase = { ...CAMPAIGN_CASES[0], escalationOptions: [] };
    expect(validateCaseSet([missingHandoff])).toContain(
      `${missingHandoff.id}: escalation requires an authored reason and destination`,
    );

    const contradictory: ExceptionCase = {
      ...CAMPAIGN_CASES[1],
      outcomeByAction: { ...CAMPAIGN_CASES[1].outcomeByAction, correct: 'preferred' },
    };
    expect(validateCaseSet([contradictory])).toContain(
      `${contradictory.id}: correct has a contradictory action outcome`,
    );
  });
});

describe('practice content', () => {
  it('has one valid micro-case for each action', () => {
    expect(validateCaseSet(PRACTICE_CASES, { expectedCount: 3 })).toEqual([]);
    expect(new Set(PRACTICE_CASES.map((candidate) => candidate.preferredAction))).toEqual(
      new Set(['approve', 'correct', 'escalate']),
    );
  });
});
