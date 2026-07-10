import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { simulateArms } from '@/lib/engine/simulate';

describe('simulateArms', () => {
  it('produces daysRun days with consistent totals', () => {
    const rng = mulberry32(11);
    const { control, variant, totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 2000,
      daysRun: 7,
      liftOnDay: () => 0.1,
    });
    expect(control).toHaveLength(7);
    expect(variant).toHaveLength(7);
    expect(totals.nA).toBe(control.reduce((s, d) => s + d.n, 0));
    expect(totals.cB).toBe(variant.reduce((s, d) => s + d.c, 0));
  });

  it('applies allocation to arm sizes', () => {
    const rng = mulberry32(12);
    const { totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 5000,
      daysRun: 10,
      liftOnDay: () => 0,
      allocationB: 0.46,
    });
    const share = totals.nB / (totals.nA + totals.nB);
    expect(share).toBeGreaterThan(0.44);
    expect(share).toBeLessThan(0.48);
  });

  it('a real lift shows up in aggregate rates', () => {
    const rng = mulberry32(13);
    const { totals } = simulateArms(rng, {
      baseRate: 0.1,
      nPerArmDay: 20000,
      daysRun: 14,
      liftOnDay: () => 0.1,
    });
    expect(totals.cB / totals.nB).toBeGreaterThan(totals.cA / totals.nA);
  });
});
