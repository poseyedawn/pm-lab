import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addXp,
  advanceCalibration,
  CALIBRATION_CORRECT_XP,
  clearCampaignReveal,
  clearDailyReveal,
  commitCampaignDecision,
  commitDailyDecision,
  completeCalibration,
  defaultState,
  loadState,
  recordCalibrationDecision,
  recordCampaignResult,
  recordDaily,
  saveState,
  xpForCall,
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

  it('commits one stable reveal with the attempt, stars, streak, and XP', () => {
    const miss = { call: 'kill', correct: false, crit: false, xpEarned: 0 } as const;
    const first = commitCampaignDecision(defaultState(), 1, 123, miss);

    expect(first.campaign[1]).toEqual({ stars: 0, attempts: 1, correct: false });
    expect(first.pendingCampaignReveal).toEqual({ levelId: 1, scenarioSeed: 123, ...miss });
    expect(commitCampaignDecision(first, 1, 456, { ...miss, call: 'ship' })).toEqual(first);

    const readyForRetry = clearCampaignReveal(first, 1);
    const hit = { call: 'ship', correct: true, crit: true, xpEarned: 200 } as const;
    const second = commitCampaignDecision(readyForRetry, 1, 456, hit);
    expect(second.campaign[1]).toEqual({ stars: 1, attempts: 2, correct: true });
    expect(second).toMatchObject({ xp: 200, campaignStreak: 1, pendingCampaignReveal: hit });
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

  it('commits and clears one daily reveal without duplicating XP', () => {
    const hit = { call: 'ship', correct: true, crit: false, xpEarned: 100 } as const;
    const committed = commitDailyDecision(defaultState(), '2026-08-01', 42, hit);

    expect(committed).toMatchObject({
      lastDailyDate: '2026-08-01',
      lastDailyCorrect: true,
      xp: 100,
      pendingDailyReveal: { date: '2026-08-01', scenarioSeed: 42, ...hit },
    });
    expect(commitDailyDecision(committed, '2026-08-01', 42, hit)).toEqual(committed);
    expect(clearDailyReveal(committed, '2026-08-01').pendingDailyReveal).toBeNull();

    const nextDay = commitDailyDecision(committed, '2026-08-02', 43, { ...hit, xpEarned: 120 });
    expect(nextDay).toMatchObject({
      lastDailyDate: '2026-08-02',
      xp: 220,
      pendingDailyReveal: { date: '2026-08-02', scenarioSeed: 43, xpEarned: 120 },
    });
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

  it('completes calibration without adding a completion-only reward', () => {
    const fresh = defaultState();
    expect(fresh).toMatchObject({ warmupDone: false, xp: 0 });

    const completed = completeCalibration(fresh);
    expect(completed).toMatchObject({ warmupDone: true, xp: 0 });
    expect(completeCalibration(completed)).toEqual(completed);
  });

  it('awards each correct calibration call and gives review calls zero XP', () => {
    let state = defaultState();
    for (const [index, call] of (['ship', 'kill', 'keep'] as const).entries()) {
      state = recordCalibrationDecision(state, call, index !== 1);
      expect(state.pendingCalibrationCall).toBe(call);
      state = advanceCalibration(state);
    }

    expect(state).toMatchObject({
      warmupDone: true,
      calibrationStep: 0,
      pendingCalibrationCall: null,
      xp: CALIBRATION_CORRECT_XP * 2,
    });
    expect(advanceCalibration(state)).toEqual(state);

    const replay = recordCalibrationDecision(state, 'ship', true);
    expect(replay.xp).toBe(CALIBRATION_CORRECT_XP * 2);
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
