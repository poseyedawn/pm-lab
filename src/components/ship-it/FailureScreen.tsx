'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PressButton } from '@/components/juice/PressButton';
import { METER_INFO, type MeterId } from '@/lib/ship-it/types';
import { ShipMeterIcon } from '@/components/ship-it/ShipIcon';

const DEATH_COPY: Record<MeterId, string> = {
  users: 'Customers have stopped trusting and using the product. It is shelved.',
  business: "The board pulls funding. You're fired.",
  team: 'Your senior engineers quit in one week.',
  tech: 'The platform collapses during peak traffic.',
};

interface FailureScreenProps {
  meter: MeterId;
  onContinue: () => void;
  reducedMotion?: boolean;
}

export function FailureScreen({ meter, onContinue, reducedMotion = false }: FailureScreenProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <motion.div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ship-it-failure-title"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={reducedMotion ? {} : { opacity: 1, x: [0, -8, 8, -4, 4, 0] }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/95 p-6"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onContinue();
        if (event.key === 'Tab') event.preventDefault();
      }}
    >
      <div className="flex max-w-md flex-col items-center gap-6 text-center text-white">
        <span aria-hidden className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
          <ShipMeterIcon id={meter} size={40} tone="inverse" />
        </span>
        <p className="text-sm font-extrabold uppercase tracking-widest opacity-70">{METER_INFO[meter].label} hit zero</p>
        <p id="ship-it-failure-title" className="text-2xl font-extrabold">{DEATH_COPY[meter]}</p>
        <PressButton buttonRef={buttonRef} color="lose" onClick={onContinue}>See your review</PressButton>
      </div>
    </motion.div>
  );
}
