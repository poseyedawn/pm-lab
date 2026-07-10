'use client';

import { useCallback, useEffect, useState } from 'react';
import { CAMPAIGN_LEVELS } from '@/lib/engine/scenario';
import type { ArchetypeId } from '@/lib/engine/types';
import {
  addXp, completeWarmup, loadState, recordCampaignResult, saveState,
  type SignificantState,
} from '@/lib/progress';

export interface LevelStatus {
  id: number;
  archetype: ArchetypeId;
  stars: 0 | 1 | 3;
  status: 'locked' | 'open' | 'done';
}

export function levelStatuses(state: SignificantState): LevelStatus[] {
  return CAMPAIGN_LEVELS.map((lvl) => {
    const result = state.campaign[lvl.id];
    const prevAllPassed = CAMPAIGN_LEVELS
      .filter((p) => p.id < lvl.id)
      .every((p) => state.campaign[p.id]?.correct);
    const status: LevelStatus['status'] = result?.correct ? 'done' : prevAllPassed ? 'open' : 'locked';
    return { id: lvl.id, archetype: lvl.archetype, stars: result?.stars ?? 0, status };
  });
}

const IQ_TITLES: [number, string][] = [
  [0, 'Coin Flipper'], [4, 'Dashboard Watcher'], [7, 'Growth PM'],
  [9, 'Decision Scientist'], [10, "p-Hacker's Nightmare"],
];

export const iqTitle = (correctCount: number): string =>
  IQ_TITLES.filter(([min]) => correctCount >= min).at(-1)![1];

export function useCampaign() {
  const [state, setState] = useState<SignificantState | null>(null);

  useEffect(() => {
    let s = loadState();
    if (!s.warmupDone) {
      s = addXp(completeWarmup(s), 50); // endowed progress: path starts non-empty
      saveState(s);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount, not a derived-state loop
    setState(s);
  }, []);

  const mutate = useCallback((fn: (s: SignificantState) => SignificantState) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const completeLevel = useCallback(
    (id: number, correct: boolean, xp: number) =>
      mutate((s) => addXp(recordCampaignResult(s, id, correct), xp)),
    [mutate],
  );

  const toggleSound = useCallback(
    () => mutate((s) => ({ ...s, soundOn: !s.soundOn })),
    [mutate],
  );

  const markCampaignCompleteTracked = useCallback(
    () => mutate((s) => ({ ...s, campaignCompleteTracked: true })),
    [mutate],
  );

  const levels = state ? levelStatuses(state) : [];
  return {
    ready: state !== null,
    state: state ?? null,
    levels,
    totalStars: levels.reduce((sum, l) => sum + l.stars, 0),
    allDone: levels.length > 0 && levels.every((l) => l.status === 'done'),
    completeLevel,
    toggleSound,
    markCampaignCompleteTracked,
  };
}
