import { describe, expect, it } from 'vitest';
import { defaultState, recordCampaignResult } from '@/lib/progress';
import { labLandingHref, labLandingProgress } from '@/lib/labLanding';

describe('Lab landing progress', () => {
  it('starts new visitors in calibration on level one', () => {
    const progress = labLandingProgress(defaultState());

    expect(progress).toEqual({ completedCases: 0, isReturning: false, nextLevel: 1 });
    expect(labLandingHref(progress, 'ship')).toBe('/significant/calibration?call=ship');
    expect(labLandingHref(progress, null)).toBe('/significant/calibration');
  });

  it('continues returning visitors at the first incomplete level', () => {
    const state = recordCampaignResult({ ...defaultState(), warmupDone: true }, 1, true);
    const progress = labLandingProgress(state);

    expect(progress).toEqual({ completedCases: 1, isReturning: true, nextLevel: 2 });
    expect(labLandingHref(progress, null)).toBe('/significant/play?level=2');
    expect(labLandingHref(progress, 'ship')).toBe('/significant/play?level=2');
  });

  it('keeps completed players on the final replayable level', () => {
    const state = Array.from({ length: 10 }, (_, index) => index + 1)
      .reduce((current, level) => recordCampaignResult(current, level, true), defaultState());

    expect(labLandingProgress(state)).toMatchObject({ completedCases: 10, nextLevel: 10 });
  });
});
