import { uniform, uniformInt, type RNG } from '@/lib/prng';
import { liftReadout, srmPValue, type LiftReadout } from '@/lib/stats';
import { simulateArms } from '@/lib/engine/simulate';
import type { ArchetypeId, ArmDay, Call, SegmentReadout, Totals } from '@/lib/engine/types';

export interface SimResult {
  control: ArmDay[];
  variant: ArmDay[];
  totals: Totals;
  segments?: SegmentReadout[];
}

export interface DraftView {
  observed: LiftReadout;
  totals: Totals;
  daysRun: number;
  daysPlanned: number;
  segments?: SegmentReadout[];
  /** Day-by-day arms, needed by accept predicates that check per-day shape (e.g. novelty decay). */
  control?: ArmDay[];
  variant?: ArmDay[];
}

export interface ArchetypeBuild {
  daysPlanned: number;
  daysRun: number;
  trueLiftPct: number;
  correctCall: Call;
  trapName: string;
  note?: string;
  simulate: (rng: RNG) => SimResult;
  accept?: (v: DraftView) => boolean;
  explain: (v: DraftView) => string;
}

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`;

export const ARCHETYPES: Record<ArchetypeId, (rng: RNG) => ArchetypeBuild> = {
  'clean-win': (rng) => {
    const lift = uniform(rng, 0.06, 0.15);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'ship', trapName: 'Clean win',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.2), nPerArmDay: uniformInt(r, 3000, 8000), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => v.observed.significant && v.observed.relLift > 0,
      explain: (v) => `No trap. The test ran its full two weeks, the lift held steady, and the CI (${pct(v.observed.ciLow)} to ${pct(v.observed.ciHigh)}) excludes zero. True lift was ${pct(lift)}. Ship it.`,
    };
  },

  'clean-loss': (rng) => {
    const lift = uniform(rng, -0.12, -0.05);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'kill', trapName: 'Clean loss',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.2), nPerArmDay: uniformInt(r, 3000, 8000), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => v.observed.relLift < 0,
      explain: () => `No trick here. The feature hurt the metric, with a true lift of ${pct(lift)}. Kill it and document what the team learned.`,
    };
  },

  'winners-curse': (rng) => {
    return {
      daysPlanned: 14, daysRun: 3,
      trueLiftPct: 0, correctCall: 'kill', trapName: "Winner's curse",
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.04, 0.08), nPerArmDay: uniformInt(r, 150, 300), daysRun: 3, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant && v.observed.relLift > 0.25,
      explain: (v) => `A ${pct(v.observed.relLift)} lift on ${(v.totals.nA + v.totals.nB).toLocaleString()} users is a red flag. With a tiny sample, only extreme swings reach significance. That makes the apparent effect look larger than it is. True lift: 0%.`,
    };
  },

  peeking: (rng) => {
    const daysRun = uniformInt(rng, 2, 4);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Peeking',
      note: 'Planned duration: 14 days.',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 1500, 3000), daysRun, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant,
      explain: (v) => `This is day ${v.daysRun} of a 14-day test. Stopping as soon as p falls below 0.05 raises the risk of a false positive. An A/A test checked daily can cross that threshold more than 25% of the time. True lift: 0%. Let it run.`,
    };
  },

  novelty: (rng) => {
    const early = uniform(rng, 0.15, 0.25);
    const daysRun = uniformInt(rng, 8, 12);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'kill', trapName: 'Novelty effect',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.08, 0.2), nPerArmDay: uniformInt(r, 3000, 6000), daysRun, liftOnDay: (d) => early * Math.exp(-d / 2.5) }),
      accept: (v) => {
        if (v.observed.relLift <= 0.01 || !v.control || !v.variant) return false;
        const relDay = (i: number) => v.variant![i].c / v.variant![i].n - v.control![i].c / v.control![i].n;
        return relDay(0) > relDay(v.daysRun - 1);
      },
      explain: () => `Look at the chart, not the average: the variant spiked at launch and decayed toward the control every day since. Users noticed the new thing, then stopped caring. The long-run lift converges to ~0%. The aggregate ${'"'}win${'"'} is front-loaded noise.`,
    };
  },

  underpowered: (rng) => {
    const lift = uniform(rng, 0.02, 0.04);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: lift * 100, correctCall: 'keep', trapName: 'Underpowered',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.03, 0.06), nPerArmDay: uniformInt(r, 300, 600), daysRun: 14, liftOnDay: () => lift }),
      accept: (v) => !v.observed.significant,
      explain: (v) => `The confidence interval (${pct(v.observed.ciLow)} to ${pct(v.observed.ciHigh)}) covers both harm and a worthwhile gain. At this traffic level, the test cannot separate them. The true effect is ${pct(lift)}. Run the test longer or send it more traffic.`,
    };
  },

  'multiple-comparisons': (rng) => {
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: 0, correctCall: 'kill', trapName: 'Multiple comparisons',
      note: 'This is the only significant result among 12 metrics the team checked.',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 2000, 4000), daysRun: 14, liftOnDay: () => 0 }),
      accept: (v) => v.observed.significant,
      explain: () => `Testing 12 metrics at p<0.05 creates about 0.6 false positives per experiment. One significant metric without a preregistered hypothesis looks like noise. True lift: 0%.`,
    };
  },

  seasonality: (rng) => {
    const promoDay = uniformInt(rng, 3, 6);
    const daysRun = uniformInt(rng, 8, 10);
    return {
      daysPlanned: 14, daysRun,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Contaminated test',
      note: `Marketing ran a promo email on day ${promoDay + 1} that deep-linked into the variant flow.`,
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 2000, 4000), daysRun, liftOnDay: (d) => (d === promoDay ? 0.35 : 0) }),
      accept: (v) => v.observed.relLift > 0.02,
      explain: () => `The lift appears on the same day marketing sent a promotion to the variant. That is contamination, not causation. Remove that day and the arms look the same. Fix the exposure and rerun the test.`,
    };
  },

  srm: (rng) => {
    const lift = uniform(rng, 0.05, 0.1);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: 0, correctCall: 'keep', trapName: 'Sample ratio mismatch',
      simulate: (r) => simulateArms(r, { baseRate: uniform(r, 0.05, 0.15), nPerArmDay: uniformInt(r, 3000, 6000), daysRun: 14, liftOnDay: () => lift, allocationB: 0.46 }),
      accept: (v) => srmPValue(v.totals.nA, v.totals.nB) < 0.001,
      explain: (v) => `A 50/50 test produced a ${((v.totals.nA / (v.totals.nA + v.totals.nB)) * 100).toFixed(1)}/${((v.totals.nB / (v.totals.nA + v.totals.nB)) * 100).toFixed(1)} split. At this sample size, that is a p<0.001 deviation. Something upstream is selectively dropping users and biasing the readout. Diagnose the assignment bug, then rerun the test.`,
    };
  },

  simpson: (rng) => {
    const withinLift = uniform(rng, -0.09, -0.05);
    return {
      daysPlanned: 14, daysRun: 14,
      trueLiftPct: withinLift * 100, correctCall: 'kill', trapName: "Simpson's paradox",
      note: 'Segment breakdown available below the chart.',
      simulate: (r) => {
        // Two user segments; the variant shifts MIX toward the high-converting
        // segment (e.g. a targeting change) while being worse WITHIN each.
        const hi = { base: 0.3, mixA: 0.5, mixB: 0.75 };
        const lo = { base: 0.05, mixA: 0.5, mixB: 0.25 };
        const nPerArmDay = uniformInt(r, 1200, 2000);
        const seg = (base: number, mixA: number, mixB: number) =>
          simulateArms(r, { baseRate: base, nPerArmDay: Math.round((nPerArmDay * (mixA + mixB)) / 2), daysRun: 14, liftOnDay: () => withinLift, allocationB: mixB / (mixA + mixB) });
        const sHi = seg(hi.base, hi.mixA, hi.mixB);
        const sLo = seg(lo.base, lo.mixA, lo.mixB);
        const control = sHi.control.map((d, i) => ({ n: d.n + sLo.control[i].n, c: d.c + sLo.control[i].c }));
        const variant = sHi.variant.map((d, i) => ({ n: d.n + sLo.variant[i].n, c: d.c + sLo.variant[i].c }));
        const totals = {
          nA: sHi.totals.nA + sLo.totals.nA, cA: sHi.totals.cA + sLo.totals.cA,
          nB: sHi.totals.nB + sLo.totals.nB, cB: sHi.totals.cB + sLo.totals.cB,
        };
        const segLift = (s: SimResult) => liftReadout(s.totals.cA, s.totals.nA, s.totals.cB, s.totals.nB).relLift;
        const segments: SegmentReadout[] = [
          { name: 'Power users', relLift: segLift(sHi) },
          { name: 'Casual users', relLift: segLift(sLo) },
        ];
        return { control, variant, totals, segments };
      },
      accept: (v) => v.observed.relLift > 0.05 && (v.segments ?? []).every((s) => s.relLift < 0),
      explain: (v) => `The aggregate is ${pct(v.observed.relLift)}, but both segments show a loss. The variant changed the user mix, so the composition made the total look positive. Within each real user group, the feature loses. That is Simpson's paradox. Kill it.`,
    };
  },
};

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES) as ArchetypeId[];
