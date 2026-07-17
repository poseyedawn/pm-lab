import { beforeEach, describe, expect, it } from 'vitest';
import {
  defaultExceptionRoomState,
  loadExceptionRoomState,
  recordCampaignCompletion,
  recordExceptionDaily,
  saveExceptionRoomState,
} from '@/lib/exception-room/state';

beforeEach(() => window.localStorage.clear());

describe('Exception Room progress', () => {
  it('round-trips progress and recovers from corrupt storage', () => {
    expect(loadExceptionRoomState()).toEqual(defaultExceptionRoomState());
    saveExceptionRoomState({ ...defaultExceptionRoomState(), xp: 200, soundOn: false });
    expect(loadExceptionRoomState()).toMatchObject({ xp: 200, soundOn: false });
    window.localStorage.setItem('pmlab:exception-room:v1', '{bad');
    expect(loadExceptionRoomState()).toEqual(defaultExceptionRoomState());
  });

  it('awards the campaign once while preserving the best profile', () => {
    let progress = recordCampaignCompletion(defaultExceptionRoomState(), 'Safety First');
    expect(progress).toMatchObject({ xp: 200, campaignComplete: true, bestProfile: 'Safety First' });
    progress = recordCampaignCompletion(progress, 'Backlog Bound');
    expect(progress).toMatchObject({ xp: 200, bestProfile: 'Safety First' });
    progress = recordCampaignCompletion(progress, 'Balanced Operator');
    expect(progress).toMatchObject({ xp: 200, bestProfile: 'Balanced Operator' });
  });

  it('keeps daily rewards idempotent and resets a broken streak', () => {
    let progress = recordExceptionDaily(defaultExceptionRoomState(), '2026-07-15', 'Safety First');
    expect(recordExceptionDaily(progress, '2026-07-15', 'Balanced Operator')).toEqual(progress);
    progress = recordExceptionDaily(progress, '2026-07-16', 'Balanced Operator');
    expect(progress).toMatchObject({ xp: 100, dailyStreak: 2 });
    progress = recordExceptionDaily(progress, '2026-07-20', 'Calibration in Progress');
    expect(progress).toMatchObject({ xp: 150, dailyStreak: 1 });
  });

  it('contributes Exception Room XP to the shared Lab profile', () => {
    window.localStorage.setItem('pmlab:significant:v1', JSON.stringify({ xp: 100 }));
    window.localStorage.setItem('pmlab:shipit:v1', JSON.stringify({ xp: 250 }));
    saveExceptionRoomState({ ...defaultExceptionRoomState(), xp: 200 });
    expect(JSON.parse(window.localStorage.getItem('pmlab:profile:v1')!)).toEqual({ xp: 550 });
  });
});
