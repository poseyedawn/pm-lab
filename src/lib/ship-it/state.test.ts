import { beforeEach, describe, expect, it } from 'vitest';
import {
  defaultShipItState,
  loadShipItState,
  recordBestRating,
  recordFreeRunReward,
  recordShipItDaily,
  saveShipItState,
} from '@/lib/ship-it/state';
import { DECK, PRODUCTS } from '@/lib/ship-it/cards';
import { startRun } from '@/lib/ship-it/engine';

beforeEach(() => window.localStorage.clear());

describe('storage round-trip', () => {
  it('loads defaults when empty, round-trips a save, survives corrupt JSON', () => {
    expect(loadShipItState()).toEqual(defaultShipItState());
    saveShipItState({ ...defaultShipItState(), xp: 340, soundOn: false });
    expect(loadShipItState().xp).toBe(340);
    window.localStorage.setItem('pmlab:shipit:v1', '{nope');
    expect(loadShipItState()).toEqual(defaultShipItState());
  });

  it('rejects valid JSON with an invalid active-run shape', () => {
    window.localStorage.setItem('pmlab:shipit:v1', JSON.stringify({
      ...defaultShipItState(),
      activeFreeRun: { run: { seed: 'wrong' }, failureSeen: false },
    }));
    expect(loadShipItState()).toEqual(defaultShipItState());
  });

  it('round-trips an active run and its failure acknowledgement', () => {
    const run = startRun(42, DECK, PRODUCTS);
    saveShipItState({ ...defaultShipItState(), activeFreeRun: { run, failureSeen: true } });
    expect(loadShipItState().activeFreeRun).toEqual({ run, failureSeen: true });
  });

  it('records ship-it progress in the lab profile (v2)', () => {
    saveShipItState({ ...defaultShipItState(), xp: 250, bestRatingFree: 'Promoted' });
    const profile = JSON.parse(window.localStorage.getItem('pmlab:profile:v2')!) as {
      games: { 'ship-it': { xp: number; completedMilestones: string[] } };
    };
    expect(profile.games['ship-it'].xp).toBe(250);
    expect(profile.games['ship-it'].completedMilestones).toContain('free:Promoted');
  });
});

describe('recordShipItDaily (same streak/shield semantics as Significant)', () => {
  it('idempotent per date; consecutive days extend; gap of 2 consumes a shield; shield every 7', () => {
    let s = defaultShipItState();
    s = recordShipItDaily(s, '2026-07-10', 'PIP');
    expect(s.dailyStreak).toBe(1);
    expect(recordShipItDaily(s, '2026-07-10', 'Promoted')).toEqual(s);
    s = recordShipItDaily(s, '2026-07-11', 'Meets Expectations');
    expect(s.dailyStreak).toBe(2);
    s = { ...s, shields: 1 };
    s = recordShipItDaily(s, '2026-07-13', 'PIP'); // gap of 2, shield burns
    expect(s.dailyStreak).toBe(3);
    expect(s.shields).toBe(0);
    s = { ...s, dailyStreak: 6 };
    s = recordShipItDaily(s, '2026-07-14', 'PIP'); // streak 7 → earn shield
    expect(s.shields).toBe(1);
  });

  it('breaks the streak after an unshielded gap', () => {
    let s = recordShipItDaily(defaultShipItState(), '2026-07-10', 'PIP');
    s = recordShipItDaily(s, '2026-07-14', 'PIP');
    expect(s.dailyStreak).toBe(1);
  });
});

describe('recordBestRating', () => {
  it('keeps the higher rating per mode', () => {
    let s = recordBestRating(defaultShipItState(), 'free', 'Meets Expectations');
    s = recordBestRating(s, 'free', 'Promoted');
    s = recordBestRating(s, 'free', 'PIP');
    expect(s.bestRatingFree).toBe('Promoted');
    expect(s.bestRatingDaily).toBeNull();
  });

  it('records free-run XP once for a stable run key', () => {
    const run = { ...startRun(42, DECK, PRODUCTS), status: 'complete' as const, currentCardId: null };
    const first = recordFreeRunReward(defaultShipItState(), run, 'Exceeds Expectations', 220);
    const second = recordFreeRunReward(first, run, 'CEO-in-waiting', 520);
    expect(first.xp).toBe(220);
    expect(second).toEqual(first);
  });
});
