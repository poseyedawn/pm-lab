import { SHIFT_CONFIGS } from '@/lib/exception-room/config';
import { hashString, mulberry32 } from '@/lib/prng';
import type {
  ExceptionCase,
  ScheduledCaseTiming,
  ScheduledExceptionCase,
  ShiftNumber,
} from '@/lib/exception-room/types';

function shuffled<T>(values: readonly T[], seed: number): T[] {
  const result = [...values];
  const random = mulberry32(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function buildSchedule(cases: readonly ExceptionCase[], seed: number): ScheduledCaseTiming[] {
  return SHIFT_CONFIGS.flatMap((config) => {
    const shiftCases = cases.filter((candidate) => candidate.shift === config.shift);
    if (shiftCases.length !== config.arrivalSlots.length) {
      throw new Error(
        `Shift ${config.shift} requires ${config.arrivalSlots.length} cases; received ${shiftCases.length}`,
      );
    }
    const ordered = shuffled(
      shiftCases,
      hashString(`exception-room:${seed}:shift:${config.shift}`),
    );
    return ordered.map((candidate, index) => {
      const arrivesAtTick = config.arrivalSlots[index];
      return {
        caseId: candidate.id,
        shift: config.shift,
        arrivesAtTick,
        dueAtTick: arrivesAtTick + candidate.dueOffsetTicks,
      };
    });
  });
}

export function scheduledCase(
  candidate: ExceptionCase,
  schedule: readonly ScheduledCaseTiming[],
): ScheduledExceptionCase {
  const timing = schedule.find((entry) => entry.caseId === candidate.id);
  if (!timing) throw new Error(`Missing schedule entry for case ${candidate.id}`);
  return { ...candidate, arrivesAtTick: timing.arrivesAtTick, dueAtTick: timing.dueAtTick };
}

export function shiftSchedule(
  schedule: readonly ScheduledCaseTiming[],
  shift: ShiftNumber,
): ScheduledCaseTiming[] {
  return schedule.filter((entry) => entry.shift === shift);
}

export const dueBand = (dueOffsetTicks: number): 'soon' | 'standard' =>
  dueOffsetTicks <= 2 ? 'soon' : 'standard';
