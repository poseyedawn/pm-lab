import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useShipRun } from '@/hooks/useShipRun';

describe('useShipRun', () => {
  it('starts an active run with a current card and no review', () => {
    const { result } = renderHook(() => useShipRun(42));
    expect(result.current.run.status).toBe('active');
    expect(result.current.card?.id).toBe(result.current.run.currentCardId);
    expect(result.current.review).toBeNull();
    expect(result.current.xpEarned).toBe(0);
  });

  it('chooseDir advances the run and exposes the applied deltas', () => {
    const { result } = renderHook(() => useShipRun(42));
    const effects = result.current.card!.left.effects;
    act(() => result.current.chooseDir('left'));
    expect(result.current.run.week).toBe(2);
    expect(result.current.lastDeltas).toEqual(effects);
  });

  it('produces a review and XP when the run ends', () => {
    const { result } = renderHook(() => useShipRun(42));
    let guard = 0;
    while (result.current.run.status === 'active' && guard++ < 40) {
      act(() => result.current.chooseDir('left'));
    }
    expect(result.current.run.status).not.toBe('active');
    expect(result.current.review).not.toBeNull();
    expect(result.current.xpEarned).toBeGreaterThan(0);
  });

  it('chooseDir on a finished run is a no-op; reset starts fresh', () => {
    const { result } = renderHook(() => useShipRun(42));
    let guard = 0;
    while (result.current.run.status === 'active' && guard++ < 40) {
      act(() => result.current.chooseDir('left'));
    }
    const finished = result.current.run;
    act(() => result.current.chooseDir('right'));
    expect(result.current.run).toBe(finished);
    act(() => result.current.reset(7));
    expect(result.current.run.status).toBe('active');
    expect(result.current.run.seed).toBe(7);
  });
});
