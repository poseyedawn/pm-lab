'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { dayNumber } from '@/lib/engine/daily';
import { useShipDaily } from '@/hooks/ship-it/useShipDaily';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { RunScreen } from '@/components/ship-it/RunScreen';
import { streakBand, track } from '@/services/analyticsService';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';
import { Fire, ShieldCheck } from '@phosphor-icons/react';

export default function ShipItDaily() {
  const daily = useShipDaily();
  const { preferences, ready: preferencesReady, reducedMotion } = usePreferences();
  const startTracked = useRef(false);
  // True once the run finished during THIS visit: keep the review card (with
  // share) on screen instead of instantly swapping to the played-today gate.
  const [ranThisVisit, setRanThisVisit] = useState(false);
  // Baseline streak value, captured on the first "ready" render. See
  // significant/daily/page.tsx for why this is driven off the re-rendered prop.
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (daily.ready && !daily.playedToday && !startTracked.current) {
      startTracked.current = true;
      track('shipit_run_started', { mode: 'daily' });
    }
  }, [daily.ready, daily.playedToday]);

  useEffect(() => {
    if (!daily.ready) return;
    if (prevStreakRef.current === null) {
      prevStreakRef.current = daily.streak;
      return;
    }
    if (daily.streak > prevStreakRef.current) track('shipit_streak_extended', { streakBand: streakBand(daily.streak) });
    prevStreakRef.current = daily.streak;
  }, [daily.ready, daily.streak]);

  return (
    <>
      {!daily.ready || !preferencesReady ? (
        <GameEntryLoading
          gameName="Ship It Daily"
          description="Checking today's local quarter and your saved review."
          theme="ship-it"
        />
      ) : (
        <main className="ship-it-run-page mx-auto flex max-w-md flex-col gap-4 p-6">
          <header className="flex items-center justify-between">
            <h1 className="font-extrabold text-sky-deep">Daily run #{dayNumber(daily.today)}</h1>
            <p className="flex items-center gap-2 font-extrabold text-gold-text" aria-label={`Streak ${daily.streak}${daily.shields > 0 ? `, ${daily.shields} shields` : ''}`}>
              <span aria-hidden className="inline-flex items-center gap-1">
                <Fire data-testid="ship-daily-streak-icon" size={18} weight="fill" /> {daily.streak}
              </span>
              {daily.shields > 0 && (
                <span aria-hidden className="inline-flex items-center gap-1">
                  <ShieldCheck data-testid="ship-daily-shield-icon" size={18} weight="duotone" /> {daily.shields}
                </span>
              )}
            </p>
          </header>

          {daily.playedToday && !ranThisVisit ? (
            <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-lg">
              <p className="text-lg font-extrabold">Today&apos;s review is filed: {daily.lastRating}.</p>
              <p className="text-sm text-ink-soft">Next quarter starts in <span className="font-extrabold text-ink">{daily.countdown}</span></p>
              <Link href="/ship-it/play" className="text-sm font-extrabold text-ink-soft underline">Play a free run</Link>
              <Link href="/ship-it" className="text-sm font-extrabold text-ink-soft underline">Back to Ship It</Link>
            </section>
          ) : (
            <RunScreen
              key={daily.seed}
              seed={daily.seed}
              mode="daily"
              soundOn={preferences.sound}
              hapticsOn={preferences.haptics}
              reducedMotion={reducedMotion}
              totalXp={daily.xp}
              initialSnapshot={daily.activeSnapshot}
              rewardAlreadyRecorded={daily.rewardAlreadyRecorded}
              onSnapshotChange={daily.persistSnapshot}
              onRunEnd={(review, run, xp) => {
                setRanThisVisit(true);
                daily.complete(review.rating, run, xp);
                track('shipit_daily_completed', { rating: review.rating, streakBand: streakBand(daily.streak + 1) });
              }}
            />
          )}
        </main>
      )}
    </>
  );
}
