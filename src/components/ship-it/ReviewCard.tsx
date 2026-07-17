'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CountUp } from '@/components/juice/CountUp';
import { PressButton } from '@/components/juice/PressButton';
import { ShareGrid } from '@/components/significant/ShareGrid';
import { buildShareText, type Review } from '@/lib/ship-it/review';
import { METERS, METER_INFO, type RunState } from '@/lib/ship-it/types';

interface ReviewCardProps {
  review: Review;
  run: RunState;
  xpEarned: number;
  totalXp: number;
  onRunBack?: () => void;
}

export function ReviewCard({ review, run, xpEarned, totalXp, onRunBack }: ReviewCardProps) {
  const reduced = useReducedMotion() ?? false;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-6 shadow-lg">
      <p className="text-center text-xs font-extrabold uppercase tracking-widest text-ink-soft">
        Quarterly review · {run.product}
      </p>
      <motion.p
        initial={reduced ? false : { scale: 2.4, rotate: -14, opacity: 0 }}
        animate={{ scale: 1, rotate: -3, opacity: 1 }}
        transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 16 }}
        className="self-center rounded-lg border-4 border-lose-deep px-4 py-2 text-center text-xl font-extrabold uppercase text-lose-deep"
      >
        {review.rating}
      </motion.p>
      <p className="text-center text-ink">{review.prose}</p>
      <div className="grid grid-cols-4 gap-3">
        {METERS.map((m) => (
          <div key={m} className="text-center">
            <p aria-hidden className="text-base">{METER_INFO[m].emoji}</p>
            <p className="text-sm font-extrabold">{run.meters[m]}</p>
          </div>
        ))}
      </div>
      <p className="text-center font-extrabold text-gold-text">
        +{xpEarned} XP · <CountUp value={totalXp} /> total
      </p>
      <ShareGrid text={buildShareText(review, run, origin)} />
      {onRunBack && (
        <PressButton color="win" onClick={onRunBack} className="w-full">Run it back</PressButton>
      )}
    </section>
  );
}
