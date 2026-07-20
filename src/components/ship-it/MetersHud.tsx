'use client';

import { METERS, METER_INFO, type Meters } from '@/lib/ship-it/types';
import { MeterBar } from '@/components/ship-it/MeterBar';

interface MetersHudProps {
  meters: Meters;
  week: number;
}

export function MetersHud({ meters, week }: MetersHudProps) {
  const critical = METERS.filter((meter) => meters[meter] < 20);
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-3">
        {METERS.map((m) => (
          <MeterBar key={m} id={m} value={meters[m]} />
        ))}
      </div>
      <p className="self-center rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-ink-soft shadow">
        Week {week}
      </p>
      {critical.length > 0 && (
        <p role="status" aria-live="assertive" className="rounded-xl bg-lose/10 px-3 py-2 text-center text-xs font-extrabold text-lose-deep">
          Danger: {critical.map((meter) => `${METER_INFO[meter].label} is ${meters[meter]}`).join(', ')}. Zero ends the run.
        </p>
      )}
    </div>
  );
}
