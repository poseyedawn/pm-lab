import { describe, expect, it } from 'vitest';
import { scorePolicy, type SimulationPolicy } from '@/lib/exception-room/simulation';

const SEEDS = 1_000;

describe('policy balance across 1,000 seeds', () => {
  it('keeps the preferred policy Balanced and fully resolved', () => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      expect(scorePolicy(seed, 'preferred')).toMatchObject({
        safety: 100,
        service: 100,
        capacity: 100,
        unresolved: 0,
        profile: 'Balanced Operator',
      });
    }
  });

  it.each<SimulationPolicy>([
    'approve-only',
    'escalate-only',
    'correction-heavy',
    'cue-only',
    'recommendation-only',
    'resolve-only-cheap',
  ])('%s never reaches Balanced Operator', (policy) => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      expect(scorePolicy(seed, policy).profile).not.toBe('Balanced Operator');
    }
  });

  it('keeps accidental random-policy Balanced results below two percent', () => {
    let balanced = 0;
    for (let seed = 0; seed < SEEDS; seed += 1) {
      if (scorePolicy(seed, 'random').profile === 'Balanced Operator') balanced += 1;
    }
    expect(balanced / SEEDS).toBeLessThan(0.02);
  });

  it('exposes the resolve-only-cheap Capacity illusion as Backlog Bound', () => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      const score = scorePolicy(seed, 'resolve-only-cheap');
      expect(score.capacity).toBe(100);
      expect(score.profile).toBe('Backlog Bound');
      expect(score.unresolved).toBeGreaterThan(4);
      expect(Math.min(score.safety, score.service)).toBeLessThan(80);
    }
  });

  it('keeps cue-only and recommendation-only policies evidence-free', () => {
    for (let seed = 0; seed < SEEDS; seed += 1) {
      expect(scorePolicy(seed, 'cue-only').evidenceInspectionRate).toBe(0);
      expect(scorePolicy(seed, 'recommendation-only').evidenceInspectionRate).toBe(0);
    }
  });
});
