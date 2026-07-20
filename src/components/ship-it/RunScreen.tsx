'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShipRun } from '@/hooks/ship-it/useShipRun';
import { MetersHud } from '@/components/ship-it/MetersHud';
import { DilemmaCard } from '@/components/ship-it/DilemmaCard';
import { ChoiceButtons } from '@/components/ship-it/ChoiceButtons';
import { FailureScreen } from '@/components/ship-it/FailureScreen';
import { ReviewCard } from '@/components/ship-it/ReviewCard';
import { DecisionFeedback } from '@/components/ship-it/DecisionFeedback';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { CARD_CAUSAL_CONTEXT } from '@/lib/ship-it/decision-guidance';
import { track } from '@/services/analyticsService';
import type { Review } from '@/lib/ship-it/review';
import type { Dir, RunState, SavedShipRun } from '@/lib/ship-it/types';

interface RunScreenProps {
  seed: number;
  mode: 'free' | 'daily';
  soundOn: boolean;
  hapticsOn: boolean;
  reducedMotion: boolean;
  totalXp?: number;
  onRunEnd: (review: Review, run: RunState, xp: number) => void;
  initialSnapshot?: SavedShipRun;
  rewardAlreadyRecorded?: boolean;
  onSnapshotChange?: (snapshot: SavedShipRun) => void;
  /** "Run it back" makes the parent mint a new seed and remount via key={seed}. */
  onRunBack?: () => void;
}

export function RunScreen({
  seed,
  mode,
  soundOn,
  hapticsOn,
  reducedMotion,
  totalXp = 0,
  onRunEnd,
  initialSnapshot,
  rewardAlreadyRecorded = false,
  onSnapshotChange,
  onRunBack,
}: RunScreenProps) {
  const [failureSeen, setFailureSeen] = useState(initialSnapshot?.failureSeen ?? false);
  const persistRun = useCallback((nextRun: RunState) => {
    onSnapshotChange?.({ run: nextRun, failureSeen });
  }, [failureSeen, onSnapshotChange]);
  const { run, card, review, xpEarned, lastFeedback, chooseDir } = useShipRun(seed, {
    initialRun: initialSnapshot?.run,
    onRunChange: persistRun,
  });
  const [dirSign, setDirSign] = useState(1);
  const endedRef = useRef(rewardAlreadyRecorded);
  const inputLockedRef = useRef(false);

  useEffect(() => {
    inputLockedRef.current = false;
  }, [card?.id]);

  useEffect(() => {
    const reviewAccepted = run.status === 'complete' || (run.status === 'dead' && failureSeen);
    if (reviewAccepted && review && !endedRef.current) {
      endedRef.current = true;
      track('shipit_run_completed', { mode, rating: review.rating, weeks: run.week, died: run.status === 'dead' });
      onRunEnd(review, run, xpEarned);
      if (run.status === 'complete' && review.integrityIssues.length === 0) {
        sfx.reward(soundOn);
      } else if (run.status === 'dead') {
        sfx.lose(soundOn);
        vibrate([80, 50, 80], hapticsOn);
      }
    }
  }, [failureSeen, hapticsOn, mode, onRunEnd, review, run, soundOn, xpEarned]);

  const handleChoose = (dir: Dir) => {
    if (!card || inputLockedRef.current) return;
    inputLockedRef.current = true;
    track('shipit_card_choice', { cardId: card.id, dir });
    sfx.click(soundOn);
    vibrate(20, hapticsOn);
    setDirSign(dir === 'left' ? -1 : 1);
    const next = chooseDir(dir);
    if (Object.values(next.meters).some((value) => value < 20)) sfx.heartbeat(soundOn);
  };

  const handleFailureContinue = () => {
    setFailureSeen(true);
    onSnapshotChange?.({ run, failureSeen: true });
  };

  if (run.status === 'dead' && run.deadMeter && !failureSeen) {
    return <FailureScreen meter={run.deadMeter} reducedMotion={reducedMotion} onContinue={handleFailureContinue} />;
  }

  if (run.status !== 'active' && review) {
    return (
      <ReviewCard
        review={review}
        run={run}
        xpEarned={xpEarned}
        totalXp={totalXp}
        onRunBack={onRunBack}
        celebrate={run.status === 'complete' && review.integrityIssues.length === 0 && !rewardAlreadyRecorded}
        reducedMotion={reducedMotion}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <MetersHud meters={run.meters} week={run.week} />
      {lastFeedback && <DecisionFeedback feedback={lastFeedback} />}
      {card && (
        <>
          {CARD_CAUSAL_CONTEXT[card.id] && (
            <aside className="rounded-xl border border-gold/50 bg-gold/15 px-4 py-3 text-sm font-bold leading-relaxed text-ink">
              {CARD_CAUSAL_CONTEXT[card.id]}
            </aside>
          )}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={card.id}
              exit={reducedMotion ? undefined : { x: 300 * dirSign, opacity: 0, rotate: 20 * dirSign }}
              transition={{ duration: reducedMotion ? 0 : 0.25 }}
            >
              <DilemmaCard card={card} onChoose={handleChoose} reducedMotion={reducedMotion} />
            </motion.div>
          </AnimatePresence>
          <ChoiceButtons card={card} onChoose={handleChoose} />
        </>
      )}
    </div>
  );
}
