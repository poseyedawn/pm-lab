'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { Card, Dir } from '@/lib/ship-it/types';
import { ShipAvatarIcon } from '@/components/ship-it/ShipIcon';

const SWIPE_THRESHOLD = 100;

interface DilemmaCardProps {
  card: Card;
  onChoose: (dir: Dir) => void;
  reducedMotion?: boolean;
}

export function DilemmaCard({ card, onChoose, reducedMotion = false }: DilemmaCardProps) {
  const reduced = reducedMotion;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);
  const rightOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);

  return (
    <motion.div
      data-testid="ship-it-dilemma"
      key={card.id}
      drag={reduced ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={reduced ? undefined : { x, rotate }}
      onDragEnd={(_, info) => {
        if (info.offset.x <= -SWIPE_THRESHOLD) onChoose('left');
        else if (info.offset.x >= SWIPE_THRESHOLD) onChoose('right');
      }}
      initial={reduced ? false : { scale: 0.9, opacity: 0, rotateY: 40 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      className="relative flex min-h-56 touch-pan-y flex-col gap-3 rounded-[var(--radius-card)] bg-surface p-6 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-bg text-ink-soft">
          <ShipAvatarIcon avatar={card.avatar} />
        </span>
        <span className="text-sm font-extrabold text-ink-soft">{card.speaker}</span>
      </div>
      <p className="text-lg font-extrabold leading-snug">{card.text}</p>
      {!reduced && (
        <>
          <motion.span style={{ opacity: leftOpacity }} className="absolute left-4 top-4 rounded-lg bg-sky-deep px-2 py-1 text-xs font-extrabold text-white">
            {card.left.label}
          </motion.span>
          <motion.span style={{ opacity: rightOpacity }} className="absolute right-4 top-4 rounded-lg bg-brand-deep px-2 py-1 text-xs font-extrabold text-white">
            {card.right.label}
          </motion.span>
        </>
      )}
    </motion.div>
  );
}
