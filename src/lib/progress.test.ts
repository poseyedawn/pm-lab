import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addXp, CALIBRATION_XP, completeCalibration, defaultState, loadState, recordCampaignResult,
  recordDaily, saveState, xpForCall,
} from '@/lib/progress';

describe('campaign results', () => {
  it('first-try correct → 3 stars; retry correct → 1 star; keeps best', () => {
    let s = defaultState();
    s = recordCampaignResult(s, 1, true);
    expect(s.campaign[1]).toMatchObject({ stars: 3, correct: true });
    s = recordCampaignResult(defaultState(), 2, false);
    expect(s.campaign[2].stars).toBe(0);
    s = recordCampaignResult(s, 2, true);
    expect(s.campaign[2].stars).toBe(1);
    s = recordCampaignResult(s, 2, false); // never downgrade
    expect(s.campaign[2].stars).toBe(1);
  });

  it('campaignStreak counts consecutive correct results and resets on a miss', () => {
    let s = defaultState();
    s = recordCampaignResult(s, 1, true);
    s = recordCampaignResult(s, 2, true);
    expect(s.campaignStreak).toBe(2);
    s = recordCampaignResult(s, 3, false);
    expect(s.campaignStreak).toBe(0);
    s = recordCampaignResult(s, 3, true);
    expect(s.campaignStreak).toBe(1);
  });
});

describe('daily streaks', () => {
  it('consecutive days increment; playing twice is a no-op', () => {
    let s = defaultState();
    s = recordDaily(s, '2026-08-01', true);
    s = recordDaily(s, '2026-08-02', false); // played = streak, regardless of correctness
    expect(s.dailyStreak).toBe(2);
    const again = recordDaily(s, '2026-08-02', true);
    expect(again).toEqual(s);
  });
  it('a one-day gap spends a shield; without one, resets', () => {
    let s = { ...defaultState(), shields: 1 };
    s = recordDaily(s, '2026-08-01', true);
    s = recordDaily(s, '2026-08-03', true); // missed Aug 2
    expect(s.dailyStreak).toBe(2);
    expect(s.shields).toBe(0);
    s = recordDaily(s, '2026-08-06', true); // 2-day gap, no shield
    expect(s.dailyStreak).toBe(1);
  });
  it('earns a shield at each 7-multiple, capped at 2', () => {
    let s = defaultState();
    for (let d = 1; d <= 7; d++) s = recordDaily(s, `2026-08-0${d}`, true);
    expect(s.dailyStreak).toBe(7);
    expect(s.shields).toBe(1);
  });
});

describe('xp', () => {
  it('scales with combo, capped at x3', () => {
    expect(xpForCall(true, 1)).toBe(100);
    expect(xpForCall(true, 3)).toBe(300);
    expect(xpForCall(true, 9)).toBe(300);
    expect(xpForCall(false, 5)).toBe(0);
    expect(addXp(defaultState(), 250).xp).toBe(250);
  });

  it('awards the baseline only after calibration and never awards it twice', () => {
    const fresh = defaultState();
    expect(fresh).toMatchObject({ warmupDone: false, xp: 0 });

    const completed = completeCalibration(fresh);
    expect(completed).toMatchObject({ warmupDone: true, xp: CALIBRATION_XP });
    expect(completeCalibration(completed)).toEqual(completed);
  });
});

describe('defaultState', () => {
  it('campaignCompleteTracked starts false', () => {
    expect(defaultState().campaignCompleteTracked).toBe(false);
  });
});

describe('storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('loadState/saveState round-trip through localStorage', () => {
    const s = addXp(recordCampaignResult(defaultState(), 1, true), 100);
    saveState(s);
    expect(loadState()).toEqual(s);
  });

  it('falls back to in-memory storage when localStorage throws, so saveState never throws', () => {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    vi.spyOn(proto, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    vi.spyOn(proto, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    const s = addXp(recordCampaignResult(defaultState(), 1, true), 150);
    expect(() => saveState(s)).not.toThrow();
    expect(loadState()).toEqual(s);
  });
});
