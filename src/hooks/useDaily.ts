'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dailyArchetype, dailySeed, dayNumber } from '@/lib/engine/daily';
import { generateScenario } from '@/lib/engine/scenario';
import {
  clearDailyReveal,
  commitDailyDecision,
  loadState,
  saveState,
  type SignificantState,
} from '@/lib/progress';
import { significantGameProgress } from '@/lib/labProgress';
import { saveGameProgress } from '@/services/labProfileService';
import type { RoundResult } from '@/lib/engine/types';

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
  const stateRef = useRef<SignificantState | null>(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [today, setToday] = useState(() => localToday(new Date()));

  useEffect(() => {
    const saved = loadState();
    stateRef.current = saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount, not a derived-state loop
    setState(saved);
    const tick = () => {
      setCountdown(fmt(msToLocalMidnight(new Date())));
      const current = localToday(new Date());
      setToday((prev) => (prev === current ? prev : current));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const scenario = useMemo(
    () => generateScenario(dailySeed(today), dailyArchetype(today)),
    [today],
  );

  const mutate = useCallback((update: (current: SignificantState) => SignificantState) => {
    if (!stateRef.current) return;
    const next = update(stateRef.current);
    stateRef.current = next;
    saveState(next);
    saveGameProgress(significantGameProgress(next, new Date().toISOString()));
    setState(next);
  }, []);

  const commitDecision = useCallback((result: RoundResult) => {
    const date = localToday(new Date());
    mutate((current) => commitDailyDecision(current, date, scenario.seed, result));
  }, [mutate, scenario.seed]);

  const finishReveal = useCallback(() => {
    const date = localToday(new Date());
    mutate((current) => clearDailyReveal(current, date));
  }, [mutate]);

  const pendingReveal = state?.pendingDailyReveal?.date === today
    ? state.pendingDailyReveal
    : null;

  return {
    ready: state !== null,
    calibrated: state?.warmupDone ?? false,
    today,
    scenario,
    playedToday: state?.lastDailyDate === today,
    lastCorrect: state?.lastDailyCorrect ?? null,
    streak: state?.dailyStreak ?? 0,
    shields: state?.shields ?? 0,
    pendingReveal,
    commitDecision,
    finishReveal,
    countdown,
  };
}
