'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useShipRun } from '@/hooks/useShipRun';
import { MetersHud } from '@/components/shipit/MetersHud';
import { DilemmaCard } from '@/components/shipit/DilemmaCard';
import { ChoiceButtons } from '@/components/shipit/ChoiceButtons';
import { FailureScreen } from '@/components/shipit/FailureScreen';
import { ReviewCard } from '@/components/shipit/ReviewCard';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { track } from '@/lib/analytics';
import type { Review } from '@/lib/shipit/review';
import type { Dir, RunState } from '@/lib/shipit/types';

interface RunScreenProps {
  seed: number;
  mode: 'shipit-free' | 'shipit-daily';
  soundOn: boolean;
  totalXp?: number;
  onRunEnd: (review: Review, run: RunState, xp: number) => void;
  /** "Run it back" — the parent mints a new seed and remounts via key={seed}. */
  onRunBack?: () => void;
}

export function RunScreen({ seed, soundOn, totalXp = 0, onRunEnd, onRunBack }: RunScreenProps) {
  const { run, card, review, xpEarned, lastDeltas, chooseDir } = useShipRun(seed);
  const reducedMotion = useReducedMotion() ?? false;
  const [failureSeen, setFailureSeen] = useState(false);
  const [dirSign, setDirSign] = useState(1);
  const endedRef = useRef(false);

  useEffect(() => {
    if (run.status !== 'active' && review && !endedRef.current) {
      endedRef.current = true;
      track('run_complete', { rating: review.rating, weeks: run.week, died: run.status === 'dead' });
      onRunEnd(review, run, xpEarned);
      if (run.status === 'complete') {
        sfx.reward(soundOn);
        fireConfetti({ big: review.rating === 'CEO-in-waiting', reducedMotion });
      } else {
        sfx.lose(soundOn);
        vibrate([80, 50, 80]);
      }
    }
  }, [run, review, xpEarned, onRunEnd, soundOn, reducedMotion]);

  const handleChoose = (dir: Dir) => {
    if (!card) return;
    track('card_choice', { cardId: card.id, dir });
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
