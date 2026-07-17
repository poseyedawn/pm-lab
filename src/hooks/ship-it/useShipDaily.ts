'use client';

import { useCallback, useEffect, useState } from 'react';
import { localToday, msToLocalMidnight } from '@/hooks/useDaily';
import { shipitDailySeed } from '@/lib/ship-it/daily';
import {
  loadShipItState, recordBestRating, recordShipItDaily, saveShipItState, type ShipItState,
} from '@/lib/ship-it/state';
import type { Rating } from '@/lib/ship-it/types';

const fmt = (ms: number): string => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

export function useShipDaily() {
  const [state, setState] = useState<ShipItState | null>(null);
  const [countdown, setCountdown] = useState('--:--:--');
  const [today, setToday] = useState(() => localToday(new Date()));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount, not a derived-state loop
    setState(loadShipItState());
    const tick = () => {
      setCountdown(fmt(msToLocalMidnight(new Date())));
      const current = localToday(new Date());
      setToday((prev) => (prev === current ? prev : current));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const complete = useCallback((rating: Rating, xp: number) => {
    const date = localToday(new Date());
    setState((prev) => {
      // recordShipItDaily is idempotent for the streak, but the XP add must be
      // guarded here too — same double-grant bug class as Significant (3c43256).
      if (!prev || prev.lastDailyDate === date) return prev;
      const next = recordBestRating(
        { ...recordShipItDaily(prev, date, rating), xp: prev.xp + xp },
        'daily',
        rating,
      );
      saveShipItState(next);
      return next;
    });
  }, []);

  return {
    ready: state !== null,
    today,
    seed: shipitDailySeed(today),
    playedToday: state?.lastDailyDate === today,
    lastRating: state?.lastDailyRating ?? null,
    streak: state?.dailyStreak ?? 0,
    shields: state?.shields ?? 0,
    bestRatingDaily: state?.bestRatingDaily ?? null,
    xp: state?.xp ?? 0,
    complete,
    countdown,
  };
}
