'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PressButton } from '@/components/juice/PressButton';
import { METER_INFO, type MeterId } from '@/lib/ship-it/types';

const DEATH_COPY: Record<MeterId, string> = {
  users: 'Your DAU chart is a cliff. The product is shelved.',
  business: "The board pulls funding. You're fired.",
  team: 'Your senior engineers quit in one week.',
  tech: 'The platform collapses during peak traffic.',
};

export function FailureScreen({ meter, onContinue }: { meter: MeterId; onContinue: () => void }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      role="alertdialog"
      aria-label="Run over"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? {} : { opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6"
    >
      <div className="flex max-w-md flex-col items-center gap-6 text-center text-white">
        <span aria-hidden className="text-5xl">{METER_INFO[meter].emoji}</span>
        <p className="text-sm font-extrabold uppercase tracking-widest opacity-70">{METER_INFO[meter].label} hit zero</p>
        <p className="text-2xl font-extrabold">{DEATH_COPY[meter]}</p>
        <PressButton color="lose" onClick={onContinue}>See your review</PressButton>
      </div>
    </motion.div>
  );
}
