'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { METER_INFO, type MeterId } from '@/lib/ship-it/types';
import { ShipMeterIcon } from '@/components/ship-it/ShipIcon';

interface MeterBarProps {
  id: MeterId;
  value: number;
}

export function MeterBar({ id, value }: MeterBarProps) {
  const info = METER_INFO[id];
  const reduced = useReducedMotion() ?? false;
  const critical = value < 20;

  return (
    <div className="relative flex flex-col items-center gap-1">
      <ShipMeterIcon id={id} />
      <div
        role="meter"
        aria-label={info.label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        data-critical={critical}
        className={`h-2 w-full overflow-hidden rounded-full bg-ink/10 ${critical ? 'animate-pulse ring-2 ring-lose' : ''}`}
      >
        <motion.div
          className={`h-full rounded-full ${info.bar}`}
          animate={{ width: `${value}%` }}
          initial={false}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 28 }}
        />
      </div>
    </div>
  );
}
