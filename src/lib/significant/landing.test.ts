import { describe, expect, it } from 'vitest';
import { defaultState, recordCampaignResult } from '@/lib/progress';
import { significantLandingHref, significantLandingProgress } from '@/lib/significant/landing';

describe('Significant landing progress', () => {
  it('starts new visitors in calibration on level one', () => {
    const progress = significantLandingProgress(defaultState());

    expect(progress).toEqual({ completedCases: 0, isReturning: false, nextLevel: 1 });
    expect(significantLandingHref(progress, 'ship')).toBe('/significant/calibration?call=ship');
    expect(significantLandingHref(progress, null)).toBe('/significant/calibration');
  });

  it('continues returning visitors at the first incomplete level', () => {
    const state = recordCampaignResult({ ...defaultState(), warmupDone: true }, 1, true);
    const progress = significantLandingProgress(state);

    expect(progress).toEqual({ completedCases: 1, isReturning: true, nextLevel: 2 });
    expect(significantLandingHref(progress, null)).toBe('/significant/play?level=2');
    expect(significantLandingHref(progress, 'ship')).toBe('/significant/play?level=2');
  });

  it('keeps completed players on the final replayable level', () => {
    const state = Array.from({ length: 10 }, (_, index) => index + 1)
      .reduce((current, level) => recordCampaignResult(current, level, true), defaultState());

    expect(significantLandingProgress(state)).toMatchObject({ completedCases: 10, nextLevel: 10 });
  });
});
