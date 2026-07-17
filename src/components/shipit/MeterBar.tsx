'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { METER_INFO, type MeterId } from '@/lib/shipit/types';

interface MeterBarProps {
  id: MeterId;
  value: number;
  delta?: number;
}

export function MeterBar({ id, value, delta }: MeterBarProps) {
  const info = METER_INFO[id];
  const reduced = useReducedMotion() ?? false;
  const critical = value < 20;

  return (
    <div className="relative flex flex-col items-center gap-1">
      <span aria-hidden className="text-base leading-none">{info.emoji}</span>
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
      <AnimatePresence>
        {delta !== undefined && delta !== 0 && (
          <motion.span
            key={`${value}:${delta}`}
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: reduced ? 0 : -14 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.7 }}
            className={`absolute -top-4 text-xs font-extrabold ${delta > 0 ? 'text-win-text' : 'text-lose-deep'}`}
          >
            {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
