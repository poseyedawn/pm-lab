import { describe, expect, it } from 'vitest';
import { CAMPAIGN_LEVELS, campaignSeed } from '@/lib/engine/scenario';
import { dailyArchetype, dailySeed, dayNumber } from '@/lib/engine/daily';

describe('daily', () => {
  it('dayNumber increments by 1 per calendar day', () => {
    expect(dayNumber('2026-07-10') - dayNumber('2026-07-09')).toBe(1);
    expect(dayNumber('2026-08-01') - dayNumber('2026-07-31')).toBe(1);
  });
  it('same date → same seed; consecutive dates → different archetypes', () => {
    expect(dailySeed('2026-07-09')).toBe(dailySeed('2026-07-09'));
    expect(dailyArchetype('2026-07-09')).not.toBe(dailyArchetype('2026-07-10'));
  });
});

describe('campaign', () => {
  it('has 10 ordered levels and distinct seeds per attempt', () => {
    expect(CAMPAIGN_LEVELS).toHaveLength(10);
    expect(CAMPAIGN_LEVELS[0].archetype).toBe('clean-win');
    expect(campaignSeed(3, 1)).not.toBe(campaignSeed(3, 2));
  });
});
