import { describe, expect, it } from 'vitest';
import { CALIBRATION_ROUNDS } from '@/lib/significant/calibration';

describe('Significant calibration curriculum', () => {
  it('teaches one visible-evidence example for each operational call', () => {
    expect(CALIBRATION_ROUNDS.map((round) => round.correctCall)).toEqual(['ship', 'kill', 'keep']);
    for (const round of CALIBRATION_ROUNDS) {
      expect(round.scenario.truth.correctCall).toBe(round.correctCall);
      expect(round.reason).toMatch(/evidence|confidence interval/i);
    }
  });
});
