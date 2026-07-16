import { afterEach, describe, expect, it, vi } from 'vitest';
import { track as vercelTrack } from '@vercel/analytics';
import {
  classifyCaseStudyEntry,
  classifyReferrer,
  classifyViewport,
  firstTryBand,
  streakBand,
  track,
  validateAnalyticsEvent,
} from '@/services/analyticsService';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

afterEach(() => vi.clearAllMocks());

describe('analytics event validation', () => {
  it('accepts a known event with the documented properties', () => {
    expect(validateAnalyticsEvent({
      name: 'decision_made',
      gameId: 'significant',
      mode: 'campaign',
      level: 4,
      call: 'keep',
    })).toBe(true);
  });

  it('rejects unknown events, unknown properties, and sensitive content fields', () => {
    expect(validateAnalyticsEvent({ name: 'anything', value: true })).toBe(false);
    expect(validateAnalyticsEvent({ name: 'daily_viewed', state: 'unplayed', seed: 42 })).toBe(false);
    expect(validateAnalyticsEvent({ name: 'share_succeeded', surface: 'daily', method: 'clipboard', clipboardText: 'private' })).toBe(false);
    expect(validateAnalyticsEvent({ name: 'campaign_completed', firstTryBand: '7-9', xp: 2400 })).toBe(false);
  });

  it('requires the correct value shape for each setting', () => {
    expect(validateAnalyticsEvent({ name: 'settings_changed', setting: 'haptics', enabled: false })).toBe(true);
    expect(validateAnalyticsEvent({ name: 'settings_changed', setting: 'motion', value: 'reduced' })).toBe(true);
    expect(validateAnalyticsEvent({ name: 'settings_changed', setting: 'motion', enabled: false })).toBe(false);
  });

  it('does not call Vercel when runtime data is invalid', () => {
    track('campaign_level_completed', { level: 999, attempts: 1, stars: 3 });
    expect(vercelTrack).not.toHaveBeenCalled();
  });

  it('never lets a Vercel failure interrupt the game', () => {
    vi.mocked(vercelTrack).mockImplementationOnce(() => {
      throw new Error('analytics unavailable');
    });
    expect(() => track('daily_viewed', { state: 'unplayed' })).not.toThrow();
  });

  it('rejects arbitrary event strings at compile time', () => {
    if (false) {
      // @ts-expect-error arbitrary analytics names are intentionally unsupported
      track('arbitrary_event', {});
    }
    expect(true).toBe(true);
  });
});

describe('privacy-preserving classifiers', () => {
  it('coarsens viewport widths', () => {
    expect(classifyViewport(390)).toBe('mobile');
    expect(classifyViewport(768)).toBe('tablet');
    expect(classifyViewport(1440)).toBe('desktop');
  });

  it('coarsens referrers without returning a URL', () => {
    expect(classifyReferrer('', 'https://lab.example')).toBe('direct');
    expect(classifyReferrer('https://lab.example/significant', 'https://lab.example')).toBe('internal');
    expect(classifyReferrer('https://alvn.io/work', 'https://lab.example')).toBe('portfolio');
    expect(classifyReferrer('https://search.example/query', 'https://lab.example')).toBe('external');
  });

  it('recognizes a Significant-to-case-study visit', () => {
    expect(classifyCaseStudyEntry('https://lab.example/significant', 'https://lab.example')).toBe('significant');
    expect(classifyCaseStudyEntry('', 'https://lab.example', 'portfolio')).toBe('portfolio');
  });

  it('coarsens streaks into non-identifying bands', () => {
    expect(streakBand(1)).toBe('1-2');
    expect(streakBand(5)).toBe('3-6');
    expect(streakBand(14)).toBe('7-29');
    expect(streakBand(40)).toBe('30+');
  });

  it('coarsens campaign performance instead of sending the local profile', () => {
    expect(firstTryBand(2)).toBe('0-3');
    expect(firstTryBand(5)).toBe('4-6');
    expect(firstTryBand(8)).toBe('7-9');
    expect(firstTryBand(10)).toBe('10');
  });
});
