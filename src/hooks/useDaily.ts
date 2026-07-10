'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { dailyArchetype, dailySeed, dayNumber } from '@/lib/engine/daily';
import { generateScenario } from '@/lib/engine/scenario';
import { addXp, loadState, recordDaily, saveState, type SignificantState } from '@/lib/progress';

export function localToday(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const buildShareText = (date: string, correct: boolean, streak: number, origin: string): string =>
  `Significant #${dayNumber(date)} ${correct ? '🟢' : '🔴'} 🔥${streak}\n${origin}/significant/daily`;

export function msToLocalMidnight(now: Date): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return midnight.getTime() - now.getTime();
}

const fmt = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export function useDaily() {
  const [state, setState] = useState<SignificantState | null>(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const today = useMemo(() => localToday(new Date()), []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount, not a derived-state loop
    setState(loadState());
    const tick = () => setCountdown(fmt(msToLocalMidnight(new Date())));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const scenario = useMemo(
    () => generateScenario(dailySeed(today), dailyArchetype(today)),
    [today],
  );

  const complete = useCallback(
    (correct: boolean, xp: number) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = addXp(recordDaily(prev, today, correct), xp);
        saveState(next);
        return next;
      });
    },
    [today],
  );

  return {
    ready: state !== null,
    today,
    scenario,
    playedToday: state?.lastDailyDate === today,
    lastCorrect: state?.lastDailyCorrect ?? null,
    streak: state?.dailyStreak ?? 0,
    shields: state?.shields ?? 0,
    soundOn: state?.soundOn ?? true,
    complete,
    countdown,
  };
}
