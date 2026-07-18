import { describe, expect, it } from 'vitest';
import { buildShareText, generateReview, xpForRun } from '@/lib/ship-it/review';
import { DECK } from '@/lib/ship-it/cards';
import type { RunState } from '@/lib/ship-it/types';

const run = (over: Partial<RunState>): RunState => ({
  seed: 42, product: 'Plumage, a B2B invoicing tool', week: 12,
  meters: { users: 50, business: 50, team: 50, tech: 50 },
  flags: [], drawn: [], history: [], currentCardId: null,
  status: 'complete', deadMeter: null, overshootsTriggered: [], exhausted: false,
  ...over,
});

// two real arc names + their card ids, pulled from the deck itself
const arcCards = (arc: string) => DECK.filter((c) => c.arc === arc).map((c) => ({ cardId: c.id, dir: 'left' as const }));
const [arcA, arcB] = ['incident', 'big-customer'];

describe('rating tiers: every tier reachable', () => {
  it('died → PIP', () => {
    expect(generateReview(run({ status: 'dead', deadMeter: 'tech', week: 5 }), DECK).rating).toBe('PIP');
  });
  it('survived unbalanced → Meets Expectations', () => {
    expect(generateReview(run({ meters: { users: 80, business: 40, team: 50, tech: 45 } }), DECK).rating)
      .toBe('Meets Expectations');
  });
  it('survived balanced → Exceeds Expectations', () => {
    expect(generateReview(run({}), DECK).rating).toBe('Exceeds Expectations');
  });
  it('survived, >= 2 arcs resolved → Promoted (even unbalanced)', () => {
    const s = run({
      meters: { users: 80, business: 40, team: 50, tech: 45 },
      flags: [`arc:${arcA}:resolved`, `arc:${arcB}:resolved`],
      history: [...arcCards(arcA), ...arcCards(arcB)],
    });
    expect(generateReview(s, DECK).rating).toBe('Promoted');
  });
  it('survived, balanced, all drawn arcs resolved (>= 2) → CEO-in-waiting', () => {
    const s = run({
      flags: [`arc:${arcA}:resolved`, `arc:${arcB}:resolved`],
      history: [...arcCards(arcA), ...arcCards(arcB)],
    });
    expect(generateReview(s, DECK).rating).toBe('CEO-in-waiting');
  });
  it('a drawn-but-fumbled arc blocks CEO-in-waiting', () => {
    const s = run({
      flags: [`arc:${arcA}:resolved`],
      history: [...arcCards(arcA), ...arcCards(arcB)], // arcB drawn, never resolved
    });
    expect(generateReview(s, DECK).rating).not.toBe('CEO-in-waiting');
  });
});

describe('prose', () => {
  it('is 2-3 sentences, seeded-deterministic, and mentions the lowest meter', () => {
    const s = run({ meters: { users: 31, business: 60, team: 55, tech: 62 } });
    const a = generateReview(s, DECK);
    expect(a.prose).toBe(generateReview(s, DECK).prose);
    const sentences = a.prose.match(/[.!?](\s|$)/g) ?? [];
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(sentences.length).toBeLessThanOrEqual(3);
    expect(a.prose.toLowerCase()).toContain('users');
  });
  it('different seeds give different prose (pools actually vary)', () => {
    const texts = new Set(
      [1, 2, 3, 4, 5, 6].map((seed) => generateReview(run({ seed }), DECK).prose));
    expect(texts.size).toBeGreaterThan(1);
  });
});

describe('share text', () => {
  it('matches the exact spec format', () => {
    const s = run({ meters: { users: 62, business: 48, team: 55, tech: 41 }, week: 13 });
    const review = generateReview(s, DECK);
    expect(buildShareText(review, s, 'https://lab.example')).toBe(
      `Ship It · Exceeds Expectations · survived 13w · U62 B48 T55 P41\nhttps://lab.example/ship-it`,
    );
  });
});

describe('xpForRun', () => {
  it('weeks * 10 + rating bonus', () => {
    expect(xpForRun('PIP', 5)).toBe(50);
    expect(xpForRun('Meets Expectations', 12)).toBe(170);
    expect(xpForRun('CEO-in-waiting', 14)).toBe(540);
  });
});
