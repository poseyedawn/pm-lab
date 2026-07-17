import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/prng';
import { choose, isEligible, startRun } from '@/lib/ship-it/engine';
import { ARCS, DECK, PRODUCTS } from '@/lib/ship-it/cards';
import { METERS, type MeterId, type RunState } from '@/lib/ship-it/types';

const simulate = (seed: number): RunState[] => {
  const policy = mulberry32(seed ^ 0x9e3779b9);
  const states: RunState[] = [];
  let s = startRun(seed, DECK, PRODUCTS);
  states.push(s);
  while (s.status === 'active') {
    s = choose(s, policy() < 0.5 ? 'left' : 'right', DECK);
    states.push(s);
  }
  return states;
};

describe('deck shape', () => {
  it('has unique kebab-case ids', () => {
    const ids = DECK.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('respects copy limits: text <= 220 chars, labels <= 40 chars', () => {
    for (const c of DECK) {
      expect(c.text.length, c.id).toBeLessThanOrEqual(220);
      expect(c.left.label.length, c.id).toBeLessThanOrEqual(40);
      expect(c.right.label.length, c.id).toBeLessThanOrEqual(40);
    }
  });

  it('no single choice moves a meter more than ±25', () => {
    for (const c of DECK) for (const choice of [c.left, c.right])
      for (const v of Object.values(choice.effects)) expect(Math.abs(v), c.id).toBeLessThanOrEqual(25);
  });

  it('has at least 45 cards, ~30 core, exactly 2 overshoot cards per meter', () => {
    expect(DECK.length).toBeGreaterThanOrEqual(45);
    const core = DECK.filter((c) => !c.arc && !c.overshoot && !c.requires?.flags);
    expect(core.length).toBeGreaterThanOrEqual(28);
    for (const m of METERS) {
      expect(DECK.filter((c) => c.overshoot === m).length, m).toBe(2);
    }
  });

  it('every overshoot card requires its meter >= 85 and hits >= 2 other meters negatively', () => {
    for (const c of DECK.filter((c) => c.overshoot)) {
      expect(c.requires?.meter?.[c.overshoot as MeterId]?.min, c.id).toBe(85);
      const others = new Set<string>();
      for (const choice of [c.left, c.right])
        for (const [m, v] of Object.entries(choice.effects))
          if (m !== c.overshoot && v < 0) others.add(m);
      expect(others.size, c.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('every arc has 3 cards, an opening, and exactly one resolution setting arc:{name}:resolved', () => {
    for (const arc of ARCS) {
      const cards = DECK.filter((c) => c.arc === arc);
      expect(cards.length, arc).toBe(3);
      const openings = cards.filter((c) => !c.requires?.flags);
      expect(openings.length, arc).toBe(1);
      const resolvers = cards.filter((c) =>
        [c.left, c.right].some((ch) => ch.setFlags?.includes(`arc:${arc}:resolved`)));
      expect(resolvers.length, arc).toBe(1);
      // the resolved flag comes only from the resolution card's better choice
      const [resolver] = resolvers;
      expect(resolver.requires?.flags?.length, arc).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('deck dynamics (simulated runs)', () => {
  it('every card is reachable within 200 simulated runs', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) for (const s of simulate(seed)) for (const id of s.drawn) seen.add(id);
    const missing = DECK.map((c) => c.id).filter((id) => !seen.has(id));
    expect(missing).toEqual([]);
  });

  it('every arc consequence card is eligible once its flags are set', () => {
    for (const c of DECK.filter((c) => c.requires?.flags?.length)) {
      const s: RunState = {
        ...startRun(1, DECK, PRODUCTS),
        drawn: [], currentCardId: null,
        flags: c.requires!.flags!,
        week: c.requires?.week?.min ?? 1,
      };
      expect(isEligible(c, s), c.id).toBe(true);
    }
  });

  it('deck never exhausts across 500 random-policy runs', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const final = simulate(seed).at(-1)!;
      expect(final.exhausted, `seed ${seed}`).toBe(false);
      expect(final.status).not.toBe('active');
    }
  });

  it('random play both dies and completes (the game is neither unwinnable nor unlosable)', () => {
    const finals = Array.from({ length: 300 }, (_, i) => simulate(i + 1).at(-1)!);
    expect(finals.some((s) => s.status === 'dead')).toBe(true);
    expect(finals.some((s) => s.status === 'complete')).toBe(true);
  });
});
