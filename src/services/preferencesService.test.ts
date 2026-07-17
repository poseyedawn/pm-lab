import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LAB_PREFERENCES_STORAGE_KEY,
  defaultPreferences,
  loadPreferences,
  parseMotionPreference,
  savePreferences,
} from '@/services/preferencesService';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('preference migrations', () => {
  it('creates defaults when preferences are missing', () => {
    expect(loadPreferences()).toEqual(defaultPreferences());
  });

  it('migrates the legacy Significant sound preference', () => {
    window.localStorage.setItem('pmlab:significant:v1', JSON.stringify({ soundOn: false }));
    expect(loadPreferences()).toEqual({ sound: false, haptics: true, motion: 'system' });
  });

  it('falls back safely for malformed data', () => {
    window.localStorage.setItem(LAB_PREFERENCES_STORAGE_KEY, JSON.stringify({ version: 1, preferences: { sound: 'yes' } }));
    expect(loadPreferences()).toEqual(defaultPreferences());
  });

  it('does not overwrite preferences written by a future app version', () => {
    const future = JSON.stringify({ version: 4, preferences: { sound: false, haptics: false, motion: 'reduced' } });
    window.localStorage.setItem(LAB_PREFERENCES_STORAGE_KEY, future);

    expect(loadPreferences()).toEqual(defaultPreferences());
    expect(savePreferences({ sound: false, haptics: false, motion: 'reduced' })).toBe(false);
    expect(window.localStorage.getItem(LAB_PREFERENCES_STORAGE_KEY)).toBe(future);
  });
});

describe('preference persistence', () => {
  it('validates motion input at the settings boundary', () => {
    expect(parseMotionPreference('reduced')).toBe('reduced');
    expect(parseMotionPreference('cinematic')).toBeNull();
  });

  it('round-trips independent sound, haptic, and motion choices', () => {
    const preferences = { sound: false, haptics: false, motion: 'full' } as const;
    expect(savePreferences(preferences)).toBe(true);
    expect(loadPreferences()).toEqual(preferences);
  });

  it('keeps preferences available for the session when localStorage is denied', () => {
    const proto = Object.getPrototypeOf(window.localStorage) as Storage;
    vi.spyOn(proto, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    vi.spyOn(proto, 'getItem').mockImplementation(() => { throw new Error('SecurityError'); });

    savePreferences({ sound: false, haptics: false, motion: 'reduced' });
    expect(loadPreferences()).toEqual({ sound: false, haptics: false, motion: 'reduced' });
  });
});
