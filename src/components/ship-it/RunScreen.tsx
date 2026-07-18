'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useShipRun } from '@/hooks/ship-it/useShipRun';
import { MetersHud } from '@/components/ship-it/MetersHud';
import { DilemmaCard } from '@/components/ship-it/DilemmaCard';
import { ChoiceButtons } from '@/components/ship-it/ChoiceButtons';
import { FailureScreen } from '@/components/ship-it/FailureScreen';
import { ReviewCard } from '@/components/ship-it/ReviewCard';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { track } from '@/services/analyticsService';
import type { Review } from '@/lib/ship-it/review';
import type { Dir, RunState } from '@/lib/ship-it/types';

interface RunScreenProps {
  seed: number;
  mode: 'free' | 'daily';
  soundOn: boolean;
  totalXp?: number;
  onRunEnd: (review: Review, run: RunState, xp: number) => void;
  /** "Run it back" makes the parent mint a new seed and remount via key={seed}. */
  onRunBack?: () => void;
}

export function RunScreen({ seed, mode, soundOn, totalXp = 0, onRunEnd, onRunBack }: RunScreenProps) {
  const { run, card, review, xpEarned, lastDeltas, chooseDir } = useShipRun(seed);
  const reducedMotion = useReducedMotion() ?? false;
  const [failureSeen, setFailureSeen] = useState(false);
  const [dirSign, setDirSign] = useState(1);
  const endedRef = useRef(false);

  useEffect(() => {
    if (run.status !== 'active' && review && !endedRef.current) {
      endedRef.current = true;
      track('shipit_run_completed', { mode, rating: review.rating, weeks: run.week, died: run.status === 'dead' });
      onRunEnd(review, run, xpEarned);
      if (run.status === 'complete') {
        sfx.reward(soundOn);
        fireConfetti({ big: review.rating === 'CEO-in-waiting', reducedMotion });
      } else {
        sfx.lose(soundOn);
        vibrate([80, 50, 80]);
      }
    }
  }, [run, review, xpEarned, onRunEnd, soundOn, reducedMotion, mode]);

  const handleChoose = (dir: Dir) => {
    if (!card) return;
    track('shipit_card_choice', { cardId: card.id, dir });
    sfx.click(soundOn);
    vibrate(20);
    setDirSign(dir === 'left' ? -1 : 1);
    chooseDir(dir);
    if (Object.values(run.meters).some((v) => v < 20)) sfx.heartbeat(soundOn);
  };

  if (run.status === 'dead' && run.deadMeter && !failureSeen) {
    return <FailureScreen meter={run.deadMeter} onContinue={() => setFailureSeen(true)} />;
  }

  if (run.status !== 'active' && review) {
    return (
      <ReviewCard review={review} run={run} xpEarned={xpEarned} totalXp={totalXp} onRunBack={onRunBack} />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <MetersHud meters={run.meters} week={run.week} deltas={lastDeltas} />
      {card && (
        <>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={card.id}
              exit={reducedMotion ? undefined : { x: 300 * dirSign, opacity: 0, rotate: 20 * dirSign }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
            >
              <DilemmaCard card={card} onChoose={handleChoose} />
            </motion.div>
          </AnimatePresence>
          <ChoiceButtons card={card} onChoose={handleChoose} />
        </>
      )}
    </div>
  );
}
