import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { generateScenario } from '@/lib/engine/scenario';
import { useGameRound } from '@/hooks/useGameRound';

afterEach(() => vi.restoreAllMocks());

describe('useGameRound', () => {
  it('scores a correct call with combo multiplier', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // no crit
    const s = generateScenario(7, 'clean-win'); // correct call: ship
    const { result } = renderHook(() => useGameRound(s, 2));
    act(() => result.current.decide('ship'));
    expect(result.current.phase).toBe('revealed');
    expect(result.current.correct).toBe(true);
    expect(result.current.xpEarned).toBe(200); // 100 * combo 2
  });
  it('a wrong call earns nothing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const s = generateScenario(7, 'peeking'); // correct call: keep
    const { result } = renderHook(() => useGameRound(s, 1));
    act(() => result.current.decide('ship'));
    expect(result.current.correct).toBe(false);
    expect(result.current.xpEarned).toBe(0);
  });
  it('a crit doubles xp', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // crit
    const s = generateScenario(7, 'clean-win');
    const { result } = renderHook(() => useGameRound(s, 1));
    act(() => result.current.decide('ship'));
    expect(result.current.crit).toBe(true);
    expect(result.current.xpEarned).toBe(200);
  });
  it('decide is idempotent: second call returns null and state is unchanged', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const s = generateScenario(7, 'clean-win');
    const { result } = renderHook(() => useGameRound(s, 1));
    let first: unknown;
    let second: unknown;
    act(() => { first = result.current.decide('ship'); });
    act(() => { second = result.current.decide('kill'); });
    expect(first).toMatchObject({ correct: true });
    expect(second).toBeNull();
    expect(result.current.correct).toBe(true);
    expect(result.current.call).toBe('ship');
  });

  it('starts revealed when a calibrated landing call is supplied', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const s = generateScenario(7, 'clean-win');
    const { result } = renderHook(() => useGameRound(s, 1, 'ship'));

    expect(result.current).toMatchObject({
      phase: 'revealed',
      call: 'ship',
      correct: true,
      xpEarned: 100,
    });
    expect(result.current.decide('kill')).toBeNull();
  });
});
