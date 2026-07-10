import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { binomialDraw, liftReadout, srmPValue } from '@/lib/stats';

describe('binomialDraw', () => {
  it('stays within [0, n] and near the mean for large n', () => {
    const rng = mulberry32(3);
    let sum = 0;
    for (let i = 0; i < 500; i++) {
      const c = binomialDraw(rng, 1000, 0.1);
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(1000);
      sum += c;
    }
    expect(sum / 500).toBeGreaterThan(90);
    expect(sum / 500).toBeLessThan(110);
  });
});

describe('liftReadout', () => {
  it('detects an obvious lift as significant', () => {
    const r = liftReadout(1000, 10000, 1200, 10000);
    expect(r.relLift).toBeCloseTo(0.2, 1);
    expect(r.significant).toBe(true);
    expect(r.ciLow).toBeLessThan(r.relLift);
    expect(r.ciHigh).toBeGreaterThan(r.relLift);
  });
  it('reports equal arms as not significant', () => {
    const r = liftReadout(1000, 10000, 1000, 10000);
    expect(r.significant).toBe(false);
    expect(Math.abs(r.relLift)).toBeLessThan(0.001);
  });
});

describe('srmPValue', () => {
  it('flags a 46/54 split on large n, passes 50/50', () => {
    expect(srmPValue(46000, 54000)).toBeLessThan(0.001);
    expect(srmPValue(50050, 49950)).toBeGreaterThan(0.05);
  });
});
