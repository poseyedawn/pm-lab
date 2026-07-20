'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/juice/CountUp';
import { fireConfetti } from '@/components/juice/confetti';
import { PressButton } from '@/components/juice/PressButton';
import { ShareGrid } from '@/components/significant/ShareGrid';
import { buildShareText, type Review } from '@/lib/ship-it/review';
import { METERS, type RunState } from '@/lib/ship-it/types';
import { ShipMeterIcon } from '@/components/ship-it/ShipIcon';

interface ReviewCardProps {
  review: Review;
  run: RunState;
  xpEarned: number;
  totalXp: number;
  onRunBack?: () => void;
  celebrate?: boolean;
  reducedMotion?: boolean;
}

export function ReviewCard({
  review,
  run,
  xpEarned,
  totalXp,
  onRunBack,
  celebrate = false,
  reducedMotion = false,
}: ReviewCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [celebrateOnMount] = useState(celebrate);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!celebrateOnMount) return;
    return fireConfetti({ container: cardRef.current, particleCount: 32, reducedMotion });
  }, [celebrateOnMount, reducedMotion]);

  return (
    <section ref={cardRef} className="ship-it-review-card relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-card)] bg-surface p-6 shadow-lg">
      <p className="text-center text-xs font-extrabold uppercase tracking-widest text-ink-soft">
        Quarterly review · {run.product}
      </p>
      <motion.h2
        ref={headingRef}
        tabIndex={-1}
        initial={reducedMotion ? false : { scale: 2.4, rotate: -14, opacity: 0 }}
        animate={{ scale: 1, rotate: -3, opacity: 1 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 16 }}
        className="relative z-[3] self-center rounded-lg border-4 border-lose-deep px-4 py-2 text-center text-xl font-extrabold uppercase text-lose-deep focus:outline-none focus-visible:ring-4 focus-visible:ring-sky"
      >
        {review.rating}
      </motion.h2>
      <p className="relative z-[3] text-center text-ink">{review.prose}</p>
      <div className="relative z-[3] grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-bg p-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">Operating balance</p>
          <p className="font-extrabold text-ink">{review.balanced ? 'Balanced' : 'Strained'}</p>
        </div>
        <div className={`rounded-xl p-3 ${review.integrityIssues.length === 0 ? 'bg-win/10' : 'bg-lose/10'}`}>
          <p className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">Integrity</p>
          <p className={`font-extrabold ${review.integrityIssues.length === 0 ? 'text-win-text' : 'text-lose-deep'}`}>
            {review.integrityIssues.length === 0 ? 'Clear' : `${review.integrityIssues.length} to review`}
          </p>
        </div>
      </div>
      {review.integrityIssues.length > 0 && (
        <div className="relative z-[3] rounded-xl border border-lose/40 bg-lose/10 p-3">
          <p className="text-xs font-extrabold uppercase tracking-widest text-lose-deep">Integrity review</p>
          <ul className="mt-2 flex list-disc flex-col gap-2 pl-4 text-sm text-ink">
            {review.integrityIssues.map((issue) => (
              <li key={`${issue.cardId}:${issue.choiceLabel}`}>
                <span className="font-extrabold">{issue.choiceLabel}:</span> {issue.boundary}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-4 gap-3">
        {METERS.map((m) => (
          <div key={m} className="flex flex-col items-center text-center">
            <ShipMeterIcon id={m} />
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
