import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildShareText, localToday, msToLocalMidnight, useDaily } from '@/hooks/useDaily';
import { dayNumber } from '@/lib/engine/daily';

describe('daily helpers', () => {
  it('localToday formats local date as YYYY-MM-DD', () => {
    expect(localToday(new Date(2026, 7, 9, 23, 59))).toBe('2026-08-09');
    expect(localToday(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });
  it('buildShareText matches the exact grid format', () => {
    const n = dayNumber('2026-08-09');
    expect(buildShareText('2026-08-09', true, 6, 'https://lab.test')).toBe(
      `Significant #${n} 🟢 🔥6\nhttps://lab.test/significant/daily`,
    );
  });
  it('msToLocalMidnight is positive and under 24h', () => {
    const ms = msToLocalMidnight(new Date(2026, 7, 9, 18, 30));
    expect(ms).toBe(5.5 * 3600 * 1000);
  });
});

describe('useDaily midnight rollover', () => {
  afterEach(() => vi.useRealTimers());
  it('rolls today forward when the countdown tick crosses midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 9, 23, 59, 59));
    const { result } = renderHook(() => useDaily());
    expect(result.current.today).toBe('2026-08-09');
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.today).toBe('2026-08-10');
  });
});
