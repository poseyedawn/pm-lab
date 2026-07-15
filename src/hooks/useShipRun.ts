'use client';

import { useCallback, useMemo, useState } from 'react';
import { choose, startRun } from '@/lib/shipit/engine';
import { DECK, PRODUCTS } from '@/lib/shipit/cards';
import { generateReview, xpForRun, type Review } from '@/lib/shipit/review';
import type { Dir, MeterId, RunState } from '@/lib/shipit/types';

export function useShipRun(seed: number) {
  const [run, setRun] = useState<RunState>(() => startRun(seed, DECK, PRODUCTS));
  const [lastDeltas, setLastDeltas] = useState<Partial<Record<MeterId, number>>>({});

  const card = useMemo(
    () => DECK.find((c) => c.id === run.currentCardId) ?? null,
    [run.currentCardId],
  );

  const chooseDir = useCallback((dir: Dir) => {
    setRun((prev) => {
      if (prev.status !== 'active' || !prev.currentCardId) return prev;
      const current = DECK.find((c) => c.id === prev.currentCardId);
      if (current) setLastDeltas(dir === 'left' ? current.left.effects : current.right.effects);
      return choose(prev, dir, DECK);
    });
  }, []);

  const reset = useCallback((newSeed: number) => {
    setLastDeltas({});
    setRun(startRun(newSeed, DECK, PRODUCTS));
  }, []);

  const review = useMemo(
    () => (run.status === 'active' ? null : generateReview(run, DECK)),
    [run],
  );
  const xpEarned = review ? xpForRun(review.rating, run.week) : 0;

  return { run, card, review, xpEarned, lastDeltas, chooseDir, reset };
}
