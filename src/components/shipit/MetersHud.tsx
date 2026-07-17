'use client';

import { METERS, type Meters, type MeterId } from '@/lib/shipit/types';
import { MeterBar } from '@/components/shipit/MeterBar';

interface MetersHudProps {
  meters: Meters;
  week: number;
  deltas: Partial<Record<MeterId, number>>;
}

export function MetersHud({ meters, week, deltas }: MetersHudProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-3">
        {METERS.map((m) => (
          <MeterBar key={m} id={m} value={meters[m]} delta={deltas[m]} />
        ))}
      </div>
      <p className="self-center rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-ink-soft shadow">
        Week {week}
      </p>
    </div>
  );
}
