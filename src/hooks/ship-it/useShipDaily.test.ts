import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { localToday } from '@/hooks/useDaily';
import { useShipDaily } from '@/hooks/ship-it/useShipDaily';
import { shipitDailySeed } from '@/lib/ship-it/daily';
import { DECK, PRODUCTS } from '@/lib/ship-it/cards';
import { startRun } from '@/lib/ship-it/engine';

beforeEach(() => window.localStorage.clear());

describe('useShipDaily', () => {
  it("hydrates, exposes today's seed, not played yet", async () => {
    const { result } = renderHook(() => useShipDaily());
    await act(async () => {});
    expect(result.current.ready).toBe(true);
    expect(result.current.today).toBe(localToday(new Date()));
    expect(result.current.seed).toBe(shipitDailySeed(result.current.today));
    expect(result.current.playedToday).toBe(false);
    expect(result.current.streak).toBe(0);
  });

  it('complete() records the daily, grants XP, sets best rating, and is idempotent for today', async () => {
    const { result } = renderHook(() => useShipDaily());
    await act(async () => {});
    const run = { ...startRun(result.current.seed, DECK, PRODUCTS), status: 'complete' as const, currentCardId: null };
    act(() => result.current.complete('Exceeds Expectations', run, 220));
    expect(result.current.playedToday).toBe(true);
    expect(result.current.streak).toBe(1);
    expect(result.current.lastRating).toBe('Exceeds Expectations');
    expect(result.current.bestRatingDaily).toBe('Exceeds Expectations');
    expect(result.current.xp).toBe(220);
    act(() => result.current.complete('PIP', run, 50)); // second call same day: no double-record
    expect(result.current.streak).toBe(1);
    expect(result.current.lastRating).toBe('Exceeds Expectations');
  });
});
