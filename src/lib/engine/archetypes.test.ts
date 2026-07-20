import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { ARCHETYPES, ARCHETYPE_IDS } from '@/lib/engine/archetypes';
import { generateScenario } from '@/lib/engine/scenario';

describe('archetype specs', () => {
  it('defines all 10 archetypes', () => {
    expect(ARCHETYPE_IDS).toHaveLength(10);
    for (const id of ARCHETYPE_IDS) expect(ARCHETYPES[id]).toBeTypeOf('function');
  });
  it('every build declares a correct call and trap name', () => {
    for (const id of ARCHETYPE_IDS) {
      const build = ARCHETYPES[id](mulberry32(5));
      expect(['ship', 'kill', 'keep']).toContain(build.correctCall);
      expect(build.trapName.length).toBeGreaterThan(2);
      expect(build.daysRun).toBeLessThanOrEqual(build.daysPlanned);
    }
  });

  it('grades unresolved evidence as Keep Running instead of using hidden truth', () => {
    expect(generateScenario(7, 'winners-curse').truth.correctCall).toBe('keep');
    expect(generateScenario(7, 'multiple-comparisons').truth.correctCall).toBe('keep');
  });

  it('keeps hidden simulator values out of scored explanations', () => {
    for (const [index, id] of ARCHETYPE_IDS.entries()) {
      const explanation = generateScenario(index + 1, id).truth.explanation;
      expect(explanation).not.toMatch(/true lift|true effect|hidden truth/i);
    }
  });
});
