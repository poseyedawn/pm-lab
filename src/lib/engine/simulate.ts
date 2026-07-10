import { uniform, type RNG } from '@/lib/prng';
import { binomialDraw } from '@/lib/stats';
import type { ArmDay, Totals } from '@/lib/engine/types';

export interface SimParams {
  baseRate: number;                    // control conversion rate
  nPerArmDay: number;                  // nominal visitors per arm per day
  daysRun: number;
  liftOnDay: (day: number) => number;  // relative lift of variant on day i (0-indexed)
  allocationB?: number;                // share of traffic to variant (default 0.5)
  bumpOnDay?: (day: number) => number; // multiplies BOTH arms' rates (seasonality)
}

export function simulateArms(
  rng: RNG,
  p: SimParams,
): { control: ArmDay[]; variant: ArmDay[]; totals: Totals } {
  const allocB = p.allocationB ?? 0.5;
  const control: ArmDay[] = [];
  const variant: ArmDay[] = [];
  for (let day = 0; day < p.daysRun; day++) {
    const dayTotal = Math.round(p.nPerArmDay * 2 * uniform(rng, 0.9, 1.1));
    const nB = Math.round(dayTotal * allocB);
    const nA = dayTotal - nB;
    const bump = p.bumpOnDay ? p.bumpOnDay(day) : 1;
    const rateA = Math.min(0.95, p.baseRate * bump);
    const rateB = Math.min(0.95, p.baseRate * (1 + p.liftOnDay(day)) * bump);
    control.push({ n: nA, c: binomialDraw(rng, nA, rateA) });
    variant.push({ n: nB, c: binomialDraw(rng, nB, rateB) });
  }
  const totals: Totals = {
    nA: control.reduce((s, d) => s + d.n, 0),
    cA: control.reduce((s, d) => s + d.c, 0),
    nB: variant.reduce((s, d) => s + d.n, 0),
    cB: variant.reduce((s, d) => s + d.c, 0),
  };
  return { control, variant, totals };
}
