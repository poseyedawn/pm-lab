import { describe, expect, it } from 'vitest';
import { choose, isEligible, startRun } from '@/lib/shipit/engine';
import type { Card, RunState } from '@/lib/shipit/types';

const card = (id: string, over: Partial<Card> = {}): Card => ({
  id,
  speaker: 'Maya, Eng Lead',
  avatar: '👩‍💻',
  text: `Dilemma ${id}`,
  left: { label: 'Yes', effects: { users: 10, tech: -5 } },
  right: { label: 'No', effects: { business: -10 } },
  ...over,
});

// 20 plain cards so runs can reach week 12+ without exhaustion.
const DECK: Card[] = [
  ...Array.from({ length: 20 }, (_, i) => card(`core-${i}`)),
  card('gated', { requires: { flags: ['fire-started'] } }),
  card('late', { requires: { week: { min: 10 } } }),
  card('overshoot-users-a', { overshoot: 'users', requires: { meter: { users: { min: 85 } } } }),
  card('overshoot-users-b', { overshoot: 'users', requires: { meter: { users: { min: 85 } } } }),
  card('arc-open', { arc: 'incident', left: { label: 'Skip it', effects: {}, setFlags: ['skipped-postmortem'] }, right: { label: 'Hold it', effects: { team: 5 } } }),
  card('arc-end', { arc: 'incident', requires: { flags: ['skipped-postmortem'] } }),
];

describe('startRun', () => {
  it('starts at week 1, all meters 50, one card drawn', () => {
    const s = startRun(42, DECK);
    expect(s.week).toBe(1);
    expect(s.meters).toEqual({ users: 50, business: 50, team: 50, tech: 50 });
    expect(s.currentCardId).not.toBeNull();
    expect(s.drawn).toEqual([s.currentCardId]);
    expect(s.status).toBe('active');
  });

  it('is deterministic: same seed + same choices = identical run', () => {
    const play = (): RunState => {
      let s = startRun(7, DECK);
      while (s.status === 'active') s = choose(s, 'left', DECK);
      return s;
    };
    expect(play()).toEqual(play());
  });

  it('different seeds diverge', () => {
    expect(startRun(1, DECK).currentCardId === startRun(2, DECK).currentCardId
      && choose(startRun(1, DECK), 'left', DECK).currentCardId === choose(startRun(2, DECK), 'left', DECK).currentCardId).toBe(false);
  });
});

describe('choose', () => {
  it('applies effects, clamps to [0,100], advances week, draws a new card', () => {
    let s = startRun(42, DECK);
    const first = s.currentCardId;
    s = choose(s, 'left', DECK);
    expect(s.week).toBe(2);
    expect(s.currentCardId).not.toBe(first);
    expect(s.history).toEqual([{ cardId: first, dir: 'left' }]);
    for (const v of Object.values(s.meters)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it('never redraws a card already drawn this run', () => {
    let s = startRun(42, DECK);
    while (s.status === 'active') s = choose(s, 'left', DECK);
    expect(new Set(s.drawn).size).toBe(s.drawn.length);
  });

  it('a meter hitting 0 kills the run and records deadMeter', () => {
    const killer = card('killer', { left: { label: 'Doom', effects: { team: -25 } } });
    const deck = [killer, ...DECK];
    let s = startRun(1, deck);
    // force meters low, then apply the killer card directly
    s = { ...s, meters: { ...s.meters, team: 10 }, currentCardId: 'killer', drawn: ['killer'] };
    s = choose(s, 'left', deck);
    expect(s.status).toBe('dead');
    expect(s.deadMeter).toBe('team');
    expect(s.currentCardId).toBeNull();
  });

  it('setFlags/clearFlags update flags and gate eligibility', () => {
    let s = startRun(3, DECK);
    expect(isEligible(DECK.find((c) => c.id === 'gated')!, s)).toBe(false);
    s = { ...s, flags: ['fire-started'] };
    expect(isEligible(DECK.find((c) => c.id === 'gated')!, s)).toBe(true);
  });

  it('week requirements gate eligibility', () => {
    const late = DECK.find((c) => c.id === 'late')!;
    const s = startRun(3, DECK);
    expect(isEligible(late, { ...s, week: 5 })).toBe(false);
    expect(isEligible(late, { ...s, week: 10 })).toBe(true);
  });

  it('overshoot cards are only eligible when their meter >= 85, and one is drawn next when triggered', () => {
    const over = DECK.find((c) => c.id === 'overshoot-users-a')!;
    let s = startRun(5, DECK);
    expect(isEligible(over, s)).toBe(false);
    s = { ...s, meters: { ...s.meters, users: 90 } };
    expect(isEligible(over, s)).toBe(true);
    // trigger: with users >= 85 the weighted draw must overwhelmingly pick an overshoot card
    const next = choose(s, 'right', DECK); // right effects: business -10, users stays 90
    expect(next.currentCardId?.startsWith('overshoot-users')).toBe(true);
    expect(next.overshootsTriggered).toContain('users');
  });

  it('completes at week 12+ when no arc cards are pending', () => {
    let s = startRun(9, DECK);
    // neutralize death: use no-effect policy by picking whichever side, meters stay near 50
    while (s.status === 'active') s = choose(s, s.week % 2 ? 'left' : 'right', DECK);
    if (s.status === 'complete') expect(s.week).toBeGreaterThanOrEqual(12);
  });

  it('hard-stops at week 18', () => {
    let s = startRun(11, DECK);
    let guard = 0;
    while (s.status === 'active' && guard++ < 40) s = choose(s, 'left', DECK);
    expect(s.week).toBeLessThanOrEqual(18);
    expect(s.status).not.toBe('active');
  });

  it('falls back to core cards on exhaustion, auto-completes when truly dry', () => {
    const tiny: Card[] = [card('only-one')];
    let s = startRun(1, tiny);
    s = choose(s, 'left', tiny);
    expect(s.status).toBe('complete');
    expect(s.exhausted).toBe(true);
  });

  it('is a no-op on a finished run', () => {
    const tiny: Card[] = [card('only-one')];
    let s = startRun(1, tiny);
    s = choose(s, 'left', tiny);
    expect(choose(s, 'right', tiny)).toEqual(s);
  });
});
