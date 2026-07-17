import { z } from 'zod';
import type { GameId, LabGameProgress, LabProfile } from '@/types/lab';

export const LAB_PROFILE_STORAGE_KEY = 'pmlab:profile:v2';
const LEGACY_PROFILE_STORAGE_KEY = 'pmlab:profile:v1';
const PROFILE_CHANGE_EVENT = 'pmlab:profile-change';

const gameIdSchema = z.enum(['significant', 'ship-it', 'exception-room']);
const gameProgressSchema = z.object({
  gameId: gameIdSchema,
  xp: z.number().int().nonnegative(),
  completedMilestones: z.array(z.string().min(1).max(80)).max(100),
  lastPlayedAt: z.string().datetime({ offset: true }).nullable(),
}).strict();
const profileSchema = z.object({
  version: z.literal(2),
  games: z.object({
    significant: gameProgressSchema.optional(),
    'ship-it': gameProgressSchema.optional(),
    'exception-room': gameProgressSchema.optional(),
  }).strict(),
}).strict();
const legacyProfileSchema = z.object({ xp: z.number().int().nonnegative() }).passthrough();
const versionSchema = z.object({ version: z.number() }).passthrough();

let memoryFallback: string | null = null;

export function defaultLabProfile(): LabProfile {
  return { version: 2, games: {} };
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return key === LAB_PROFILE_STORAGE_KEY ? memoryFallback : null;
  }
}

function writeCurrentProfile(profile: LabProfile): boolean {
  const raw = JSON.stringify(profile);
  memoryFallback = raw;
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(LAB_PROFILE_STORAGE_KEY, raw);
    window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
    return true;
  } catch {
    return false;
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

export function loadLabProfile(): LabProfile {
  const currentRaw = readStorage(LAB_PROFILE_STORAGE_KEY);
  if (currentRaw) {
    const current = profileSchema.safeParse(parseJson(currentRaw));
    return current.success ? current.data : defaultLabProfile();
  }

  const legacy = legacyProfileSchema.safeParse(parseJson(readStorage(LEGACY_PROFILE_STORAGE_KEY) ?? ''));
  if (!legacy.success) return defaultLabProfile();

  const migrated: LabProfile = {
    version: 2,
    games: {
      significant: {
        gameId: 'significant',
        xp: legacy.data.xp,
        completedMilestones: [],
        lastPlayedAt: null,
      },
    },
  };
  writeCurrentProfile(migrated);
  return migrated;
}

export function saveGameProgress(progress: LabGameProgress): boolean {
  const currentRaw = readStorage(LAB_PROFILE_STORAGE_KEY);
  const version = storedVersion(currentRaw);
  if (version !== null && version > 2) return false;

  const profile = loadLabProfile();
  const existing = profile.games[progress.gameId];
  const nextProgress: LabGameProgress = {
    ...progress,
    completedMilestones: [...new Set(progress.completedMilestones)],
    lastPlayedAt: progress.lastPlayedAt ?? existing?.lastPlayedAt ?? null,
  };
  return writeCurrentProfile({
    version: 2,
    games: { ...profile.games, [progress.gameId]: nextProgress },
  });
}

export function gameProgress(profile: LabProfile, gameId: GameId): LabGameProgress | null {
  return profile.games[gameId] ?? null;
}

export function totalProfileXp(profile: LabProfile): number {
  return Object.values(profile.games).reduce((total, progress) => total + (progress?.xp ?? 0), 0);
}

export function subscribeToLabProfile(listener: (profile: LabProfile) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handleChange = () => listener(loadLabProfile());
  const handleStorage = (event: StorageEvent) => {
    if ([LAB_PROFILE_STORAGE_KEY, LEGACY_PROFILE_STORAGE_KEY].includes(event.key ?? '')) handleChange();
  };
  window.addEventListener(PROFILE_CHANGE_EVENT, handleChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(PROFILE_CHANGE_EVENT, handleChange);
    window.removeEventListener('storage', handleStorage);
  };
}
