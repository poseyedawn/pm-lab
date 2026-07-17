import type { ShiftConfig, ShiftNumber } from '@/lib/exception-room/types';

export const SHIFT_CONFIGS = [
  {
    shift: 1,
    openingTick: 0,
    maxTick: 3,
    capacity: 8,
    arrivalSlots: [0, 0, 0],
  },
  {
    shift: 2,
    openingTick: 4,
    maxTick: 7,
    capacity: 10,
    arrivalSlots: [4, 4, 5, 6],
  },
  {
    shift: 3,
    openingTick: 8,
    maxTick: 12,
    capacity: 12,
    arrivalSlots: [8, 8, 9, 10, 11],
  },
] as const satisfies readonly ShiftConfig[];

export const DEFAULT_ACTION_COSTS = {
  approve: 1,
  correct: 2,
  escalate: 3,
} as const;

export function shiftConfig(shift: ShiftNumber): ShiftConfig {
  const config = SHIFT_CONFIGS.find((candidate) => candidate.shift === shift);
  if (!config) throw new Error(`Missing shift configuration for shift ${shift}`);
  return config;
}

export const nextShift = (shift: ShiftNumber): ShiftNumber | null => {
  if (shift === 1) return 2;
  if (shift === 2) return 3;
  return null;
};
