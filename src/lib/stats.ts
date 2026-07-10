import { normal, type RNG } from '@/lib/prng';

/** Binomial draw via normal approximation — generators guarantee n*p >= 5. */
export function binomialDraw(rng: RNG, n: number, p: number): number {
  const mean = n * p;
  const sd = Math.sqrt(n * p * (1 - p));
  return Math.min(n, Math.max(0, Math.round(mean + normal(rng) * sd)));
}

/** Standard normal CDF (Abramowitz–Stegun 26.2.17, |err| < 7.5e-8). */
export function phi(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export interface LiftReadout {
  relLift: number;   // relative lift of B vs A, e.g. 0.12 = +12%
  ciLow: number;     // 95% CI bounds on relative lift
  ciHigh: number;
  pValue: number;    // two-sided, two-proportion z-test
  significant: boolean; // pValue < 0.05
}

export function liftReadout(cA: number, nA: number, cB: number, nB: number): LiftReadout {
  const pA = cA / nA;
  const pB = cB / nB;
  const se = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
  const diff = pB - pA;
  const z = se === 0 ? 0 : diff / se;
  const pValue = Math.min(1, 2 * (1 - phi(Math.abs(z))));
  // Continuity floor: a zero-conversion control arm must not yield Infinity.
  const pAFloor = Math.max(pA, 0.5 / nA);
  return {
    relLift: diff / pAFloor,
    ciLow: (diff - 1.96 * se) / pAFloor,
    ciHigh: (diff + 1.96 * se) / pAFloor,
    pValue,
    significant: pValue < 0.05,
  };
}

/** Two-sided p-value that the observed split deviates from 50/50 allocation. */
export function srmPValue(nA: number, nB: number): number {
  const n = nA + nB;
  const z = (nA - n / 2) / Math.sqrt(n / 4);
  return Math.min(1, 2 * (1 - phi(Math.abs(z))));
}
