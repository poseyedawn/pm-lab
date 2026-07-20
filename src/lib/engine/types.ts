import type { LiftReadout } from '@/lib/stats';

export type Call = 'ship' | 'kill' | 'keep';

export interface RoundResult {
  call: Call;
  correct: boolean;
  crit: boolean;
  xpEarned: number;
}

export type ArchetypeId =
  | 'clean-win'
  | 'clean-loss'
  | 'winners-curse'
  | 'peeking'
  | 'novelty'
  | 'underpowered'
  | 'multiple-comparisons'
  | 'seasonality'
  | 'srm'
  | 'simpson';

export interface ArmDay {
  n: number; // visitors that day
  c: number; // conversions that day
}

export interface Totals {
  nA: number;
  cA: number;
  nB: number;
  cB: number;
}

export interface SegmentReadout {
  name: string;
  relLift: number; // observed relative lift within the segment
}

export interface Scenario {
  seed: number;
  archetype: ArchetypeId;
  product: string;
  hypothesis: string;
  metricName: string;
  daysPlanned: number;
  daysRun: number;
  control: ArmDay[];
  variant: ArmDay[];
  totals: Totals;
  observed: LiftReadout;
  /** Contextual detail shown on the readout (e.g. "1 of 12 metrics checked"). */
  note?: string;
  /** Only present for the simpson archetype. */
  segments?: SegmentReadout[];
  truth: {
    trueLiftPct: number; // long-run true relative lift, in percent
    /** The operational call supported by evidence available before the decision. */
    correctCall: Call;
    /** Evidence-based review shown after the decision. */
    explanation: string;
    trapName: string;    // e.g. "Peeking"
  };
}
