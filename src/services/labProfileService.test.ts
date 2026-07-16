import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LAB_PROFILE_STORAGE_KEY,
  defaultLabProfile,
  gameProgress,
  loadLabProfile,
  saveGameProgress,
  totalProfileXp,
} from '@/services/labProfileService';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('lab profile migrations', () => {
  it('returns an empty versioned profile when storage is missing', () => {
    expect(loadLabProfile()).toEqual(defaultLabProfile());
  });

  it('migrates the legacy shared XP record into Significant progress', () => {
    window.localStorage.setItem('pmlab:profile:v1', JSON.stringify({ xp: 450 }));
    const profile = loadLabProfile();

    expect(gameProgress(profile, 'significant')).toMatchObject({ gameId: 'significant', xp: 450 });
    expect(JSON.parse(window.localStorage.getItem(LAB_PROFILE_STORAGE_KEY) ?? '')).toEqual(profile);
  });

  it('falls back safely for malformed profile data', () => {
    window.localStorage.setItem(LAB_PROFILE_STORAGE_KEY, '{broken');
    expect(loadLabProfile()).toEqual(defaultLabProfile());
  });

  it('does not overwrite a profile written by a future app version', () => {
    const future = JSON.stringify({ version: 99, games: { significant: { xp: 9000 } } });
    window.localStorage.setItem(LAB_PROFILE_STORAGE_KEY, future);

    expect(loadLabProfile()).toEqual(defaultLabProfile());
    expect(saveGameProgress({ gameId: 'significant', xp: 100, completedMilestones: [], lastPlayedAt: null })).toBe(false);
    expect(window.localStorage.getItem(LAB_PROFILE_STORAGE_KEY)).toBe(future);
  });
});

describe('lab profile updates', () => {
  it('combines game XP and deduplicates milestones', () => {
    saveGameProgress({
      gameId: 'significant',
      xp: 300,
      completedMilestones: ['baseline-calibrated', 'baseline-calibrated'],
      lastPlayedAt: '2026-07-15T18:00:00.000Z',
    });
    saveGameProgress({
      gameId: 'ship-it',
      xp: 200,
      completedMilestones: ['first-run'],
      lastPlayedAt: null,
    });

    const profile = loadLabProfile();
    expect(totalProfileXp(profile)).toBe(500);
    expect(profile.games.significant?.completedMilestones).toEqual(['baseline-calibrated']);
  });

  it('keeps session progress available when localStorage is denied', () => {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    vi.spyOn(proto, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    vi.spyOn(proto, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });

    saveGameProgress({ gameId: 'significant', xp: 125, completedMilestones: [], lastPlayedAt: null });
    expect(loadLabProfile().games.significant?.xp).toBe(125);
  });
});
