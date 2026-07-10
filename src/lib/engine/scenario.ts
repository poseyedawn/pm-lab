import { hashString, mulberry32, pick } from '@/lib/prng';
import { liftReadout } from '@/lib/stats';
import { ARCHETYPES } from '@/lib/engine/archetypes';
import { FLAVORS } from '@/lib/engine/flavor';
import type { ArchetypeId, Scenario } from '@/lib/engine/types';

/** Campaign order: blatant traps first, subtle ones last. */
export const CAMPAIGN_LEVELS: { id: number; archetype: ArchetypeId }[] = [
  { id: 1, archetype: 'clean-win' },
  { id: 2, archetype: 'clean-loss' },
  { id: 3, archetype: 'winners-curse' },
  { id: 4, archetype: 'peeking' },
  { id: 5, archetype: 'novelty' },
  { id: 6, archetype: 'underpowered' },
  { id: 7, archetype: 'multiple-comparisons' },
  { id: 8, archetype: 'seasonality' },
  { id: 9, archetype: 'srm' },
  { id: 10, archetype: 'simpson' },
];

export const campaignSeed = (levelId: number, attempt: number): number =>
  hashString(`significant-campaign-${levelId}-${attempt}`);

export function generateScenario(seed: number, archetypeId: ArchetypeId): Scenario {
  const rng = mulberry32(seed);
  const flavor = pick(rng, FLAVORS);
  for (let attempt = 0; attempt < 1000; attempt++) {
    const build = ARCHETYPES[archetypeId](rng);
    const sim = build.simulate(rng);
    const observed = liftReadout(sim.totals.cA, sim.totals.nA, sim.totals.cB, sim.totals.nB);
    const view = {
      observed,
      totals: sim.totals,
      daysRun: build.daysRun,
      daysPlanned: build.daysPlanned,
      segments: sim.segments,
      control: sim.control,
      variant: sim.variant,
    };
    if (build.accept && !build.accept(view)) continue;
    return {
      seed,
      archetype: archetypeId,
      product: flavor.product,
      hypothesis: flavor.hypothesis,
      metricName: flavor.metricName,
      daysPlanned: build.daysPlanned,
      daysRun: build.daysRun,
      control: sim.control,
      variant: sim.variant,
      totals: sim.totals,
      observed,
      note: build.note,
      segments: sim.segments,
      truth: {
        trueLiftPct: build.trueLiftPct,
        correctCall: build.correctCall,
        explanation: build.explain(view),
        trapName: build.trapName,
      },
    };
  }
  throw new Error(`archetype ${archetypeId}: no accepted draw in 1000 attempts (seed ${seed})`);
}
