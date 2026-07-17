import { describe, expect, it } from 'vitest';
import { hashString } from '@/lib/prng';
import { shipitDailySeed } from '@/lib/ship-it/daily';

describe('shipitDailySeed', () => {
  it('derives from the spec key format and differs from Significant daily', () => {
    expect(shipitDailySeed('2026-07-15')).toBe(hashString('shipit-daily-2026-07-15'));
    expect(shipitDailySeed('2026-07-15')).not.toBe(hashString('significant-daily-2026-07-15'));
  });
});
