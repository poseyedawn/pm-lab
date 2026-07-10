import { hashString } from '@/lib/prng';
import type { ArchetypeId } from '@/lib/engine/types';

/** Puzzle #1 = 2026-08-01 (launch). Earlier dates give numbers <= 0; fine for dev. */
const EPOCH_UTC = Date.UTC(2026, 7, 1);

/** Fixed rotation, shuffled so consecutive days always differ. */
const ROTATION: ArchetypeId[] = [
  'peeking', 'clean-win', 'srm', 'novelty', 'clean-loss',
  'multiple-comparisons', 'winners-curse', 'seasonality', 'underpowered', 'simpson',
];

export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - EPOCH_UTC) / 86_400_000) + 1;
}

export const dailySeed = (date: string): number => hashString(`significant-daily-${date}`);

export function dailyArchetype(date: string): ArchetypeId {
  const idx = ((dayNumber(date) % ROTATION.length) + ROTATION.length) % ROTATION.length;
  return ROTATION[idx];
}
