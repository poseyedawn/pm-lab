import { describe, expect, it } from 'vitest';
import { ARCHETYPE_IDS } from '@/lib/engine/archetypes';
import { generateScenario } from '@/lib/engine/scenario';
import { srmPValue } from '@/lib/stats';

describe('generateScenario', () => {
  it('is deterministic: same seed → identical scenario', () => {
    const a = generateScenario(123, 'peeking');
    const b = generateScenario(123, 'peeking');
    expect(a).toEqual(b);
  });

  it('different seeds → different data', () => {
    const a = generateScenario(1, 'clean-win');
    const b = generateScenario(2, 'clean-win');
    expect(a.totals).not.toEqual(b.totals);
  });

  it('every scenario is internally consistent', () => {
    for (const id of ARCHETYPE_IDS) {
      const s = generateScenario(99, id);
      expect(s.control).toHaveLength(s.daysRun);
      expect(s.totals.cA).toBe(s.control.reduce((x, d) => x + d.c, 0));
      expect(s.truth.explanation.length).toBeGreaterThan(40);
    }
  });
});

// Statistical sanity: invariants hold across many seeds.
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7 + 1);

describe('archetype invariants', () => {
  it('peeking: early, significant, true lift 0', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'peeking');
      expect(s.daysRun).toBeLessThanOrEqual(4);
      expect(s.observed.significant).toBe(true);
      expect(s.truth.trueLiftPct).toBe(0);
      expect(s.truth.correctCall).toBe('keep');
    }
  });
  it('winners-curse: tiny n and a huge early lift require more evidence', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'winners-curse');
      expect(s.totals.nA + s.totals.nB).toBeLessThan(4000);
      expect(s.observed.relLift).toBeGreaterThan(0.25);
      expect(s.truth.correctCall).toBe('keep');
    }
  });
  it('underpowered: not significant, real small effect, keep', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'underpowered');
      expect(s.observed.significant).toBe(false);
      expect(s.truth.trueLiftPct).toBeGreaterThan(1);
      expect(s.truth.correctCall).toBe('keep');
    }
  });
  it('srm: allocation fails the SRM check', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'srm');
      expect(srmPValue(s.totals.nA, s.totals.nB)).toBeLessThan(0.001);
    }
  });
  it('simpson: aggregate positive, every segment negative', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'simpson');
      expect(s.observed.relLift).toBeGreaterThan(0);
      expect(s.segments).toBeDefined();
      for (const seg of s.segments!) expect(seg.relLift).toBeLessThan(0);
    }
  });
  it('novelty: variant advantage decays from first to last day', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'novelty');
      const relDay = (i: number) => s.variant[i].c / s.variant[i].n - s.control[i].c / s.control[i].n;
      expect(relDay(0)).toBeGreaterThan(relDay(s.daysRun - 1));
    }
  });
  it('seasonality: promo-day contamination drives the lift, true call is keep', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'seasonality');
      expect(s.observed.relLift).toBeGreaterThan(0.02);
      expect(s.truth.correctCall).toBe('keep');
      expect(s.note?.toLowerCase()).toContain('promo');
    }
  });
  it('multiple-comparisons: one flukey metric out of many, true lift 0, kill', () => {
    for (const seed of SEEDS) {
      const s = generateScenario(seed, 'multiple-comparisons');
      expect(s.observed.significant).toBe(true);
      expect(s.truth.trueLiftPct).toBe(0);
      expect(s.note).toContain('12 metrics');
    }
  });
  it('clean-win ships, clean-loss kills, both run full duration', () => {
    for (const seed of SEEDS) {
      const w = generateScenario(seed, 'clean-win');
      expect(w.observed.significant).toBe(true);
      expect(w.daysRun).toBe(w.daysPlanned);
      expect(w.truth.correctCall).toBe('ship');
      const l = generateScenario(seed, 'clean-loss');
      expect(l.observed.relLift).toBeLessThan(0);
      expect(l.truth.correctCall).toBe('kill');
    }
  });
});
