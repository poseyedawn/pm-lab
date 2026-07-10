import { describe, expect, it } from 'vitest';
import { hashString, mulberry32, uniform, uniformInt } from '@/lib/prng';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('produces values in [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('helpers', () => {
  it('hashString is stable and unsigned', () => {
    expect(hashString('significant-2026-07-09')).toBe(hashString('significant-2026-07-09'));
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(hashString('x')).toBeGreaterThanOrEqual(0);
  });
  it('uniform stays in range, uniformInt is inclusive', () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 200; i++) {
      const u = uniform(rng, 5, 10);
      expect(u).toBeGreaterThanOrEqual(5);
      expect(u).toBeLessThan(10);
      const n = uniformInt(rng, 2, 4);
      expect([2, 3, 4]).toContain(n);
    }
  });
});
