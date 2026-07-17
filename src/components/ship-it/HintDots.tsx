import { METERS, METER_INFO, type MeterId } from '@/lib/ship-it/types';

export function HintDots({ effects }: { effects: Partial<Record<MeterId, number>> }) {
  const affected = METERS.filter((m) => effects[m] !== undefined && effects[m] !== 0);
  if (affected.length === 0) return null;
  return (
    <span aria-label={`Affects ${affected.map((m) => METER_INFO[m].label).join(', ')}`} className="flex justify-center gap-1">
      {affected.map((m) => (
        <span key={m} aria-hidden className={`h-2 w-2 rounded-full ${METER_INFO[m].bar}`} />
      ))}
    </span>
  );
}
