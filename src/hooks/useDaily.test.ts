import { describe, expect, it } from 'vitest';
import { buildShareText, localToday, msToLocalMidnight } from '@/hooks/useDaily';
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
