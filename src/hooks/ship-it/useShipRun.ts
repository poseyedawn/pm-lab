'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { choose, startRun } from '@/lib/ship-it/engine';
import { DECK, PRODUCTS } from '@/lib/ship-it/cards';
import { getLastDecisionFeedback } from '@/lib/ship-it/decision-guidance';
import { generateReview, xpForRun } from '@/lib/ship-it/review';
import type { Dir, RunState } from '@/lib/ship-it/types';

interface UseShipRunOptions {
  initialRun?: RunState;
  onRunChange?: (run: RunState) => void;
}

export function useShipRun(seed: number, options: UseShipRunOptions = {}) {
  const { initialRun, onRunChange } = options;
  const [run, setRun] = useState<RunState>(() => initialRun ?? startRun(seed, DECK, PRODUCTS));
  const runRef = useRef(run);

  const card = useMemo(
    () => DECK.find((c) => c.id === run.currentCardId) ?? null,
    [run.currentCardId],
  );

  const chooseDir = useCallback((dir: Dir): RunState => {
    const previous = runRef.current;
    if (previous.status !== 'active' || !previous.currentCardId) return previous;
    const next = choose(previous, dir, DECK);
    runRef.current = next;
    setRun(next);
    onRunChange?.(next);
    return next;
  }, [onRunChange]);

  const reset = useCallback((newSeed: number) => {
    const next = startRun(newSeed, DECK, PRODUCTS);
    runRef.current = next;
    setRun(next);
    onRunChange?.(next);
  }, [onRunChange]);

  const review = useMemo(
    () => (run.status === 'active' ? null : generateReview(run, DECK)),
    [run],
  );
  const xpEarned = review ? xpForRun(review.rating, run.week) : 0;
  const lastFeedback = useMemo(() => getLastDecisionFeedback(run, DECK), [run]);

  return {
    run,
    card,
    review,
    xpEarned,
    lastDeltas: lastFeedback?.effects ?? {},
    lastFeedback,
    chooseDir,
    reset,
  };
}
