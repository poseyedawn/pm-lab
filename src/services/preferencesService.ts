import { z } from 'zod';
import type { LabPreferences, MotionPreference, StoredLabPreferences } from '@/types/preferences';

export const LAB_PREFERENCES_STORAGE_KEY = 'pmlab:preferences:v1';
const LEGACY_SIGNIFICANT_STORAGE_KEY = 'pmlab:significant:v1';
const PREFERENCES_CHANGE_EVENT = 'pmlab:preferences-change';

const motionPreferenceSchema = z.enum(['system', 'reduced', 'full']);
const preferencesSchema = z.object({
  sound: z.boolean(),
  haptics: z.boolean(),
  motion: motionPreferenceSchema,
}).strict();
const storedPreferencesSchema = z.object({
  version: z.literal(1),
  preferences: preferencesSchema,
}).strict();
const legacySoundSchema = z.object({ soundOn: z.boolean() }).passthrough();
const versionSchema = z.object({ version: z.number() }).passthrough();

let memoryFallback: string | null = null;

export function defaultPreferences(legacySound = true): LabPreferences {
  return { sound: legacySound, haptics: true, motion: 'system' };
}

export function parseMotionPreference(value: unknown): MotionPreference | null {
  const parsed = motionPreferenceSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return key === LAB_PREFERENCES_STORAGE_KEY ? memoryFallback : null;
  }
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function storedVersion(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = versionSchema.safeParse(parseJson(raw));
  return parsed.success ? parsed.data.version : null;
}

function writePreferences(preferences: LabPreferences): boolean {
  const stored: StoredLabPreferences = { version: 1, preferences };
  const raw = JSON.stringify(stored);
  memoryFallback = raw;
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(LAB_PREFERENCES_STORAGE_KEY, raw);
    window.dispatchEvent(new Event(PREFERENCES_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function loadPreferences(): LabPreferences {
  const currentRaw = readStorage(LAB_PREFERENCES_STORAGE_KEY);
  if (currentRaw) {
    const current = storedPreferencesSchema.safeParse(parseJson(currentRaw));
    return current.success ? current.data.preferences : defaultPreferences();
  }

  const legacy = legacySoundSchema.safeParse(parseJson(readStorage(LEGACY_SIGNIFICANT_STORAGE_KEY) ?? ''));
  const migrated = defaultPreferences(legacy.success ? legacy.data.soundOn : true);
  writePreferences(migrated);
  return migrated;
}

export function savePreferences(preferences: LabPreferences): boolean {
  const parsed = preferencesSchema.safeParse(preferences);
  if (!parsed.success) return false;
  const currentVersion = storedVersion(readStorage(LAB_PREFERENCES_STORAGE_KEY));
  if (currentVersion !== null && currentVersion > 1) return false;
  return writePreferences(parsed.data);
}

export function subscribeToPreferences(listener: (preferences: LabPreferences) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handleChange = () => listener(loadPreferences());
  const handleStorage = (event: StorageEvent) => {
    if ([LAB_PREFERENCES_STORAGE_KEY, LEGACY_SIGNIFICANT_STORAGE_KEY].includes(event.key ?? '')) handleChange();
  };
  window.addEventListener(PREFERENCES_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(PREFERENCES_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
}
