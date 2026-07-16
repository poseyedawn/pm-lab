'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { dayNumber } from '@/lib/engine/daily';
import { buildShareText, useDaily } from '@/hooks/useDaily';
import { GameRound } from '@/components/significant/GameRound';
import { ShareGrid } from '@/components/significant/ShareGrid';
import { streakBand, track } from '@/services/analyticsService';

export default function DailyPage() {
  const daily = useDaily();
  const viewTrackedRef = useRef(false);
  const pendingCorrectRef = useRef<boolean | null>(null);
  // Baseline streak value, captured on the first "ready" render — null until then.
  // We compare against this (not against a value read via loadState() right after
  // daily.complete()) because React's setState updater — where saveState() actually
  // runs — is not guaranteed to have flushed synchronously by the next line of the
  // handler; driving the comparison off the re-rendered `daily.streak` prop is
  // deterministic regardless of batching.
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (!daily.ready || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    track('daily_viewed', { state: daily.playedToday ? 'completed' : 'unplayed' });
  }, [daily.ready, daily.playedToday]);

  useEffect(() => {
    if (!daily.playedToday || pendingCorrectRef.current === null) return;
    track('daily_completed', {
      correct: pendingCorrectRef.current,
      streakBand: streakBand(daily.streak),
    });
    pendingCorrectRef.current = null;
  }, [daily.playedToday, daily.streak]);

  useEffect(() => {
    if (!daily.ready) return;
    if (prevStreakRef.current === null) {
      prevStreakRef.current = daily.streak; // establish baseline, don't fire on first render
      return;
    }
    if (daily.streak > prevStreakRef.current) {
      track('daily_streak_extended', { streakBand: streakBand(daily.streak) });
    }
    prevStreakRef.current = daily.streak;
  }, [daily.ready, daily.streak]);

  if (!daily.ready) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleToggleSound = () => {
    track('settings_changed', { setting: 'sound', enabled: !daily.soundOn });
    daily.toggleSound();
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-brand-deep">Daily #{dayNumber(daily.today)}</h1>
        <div className="flex flex-col items-end gap-1">
          <p className="font-extrabold text-gold-text">
            <span role="img" aria-label={`Streak ${daily.streak}`}>
              🔥 {daily.streak}{daily.shields > 0 ? ` · 🛡 ${daily.shields}` : ''}
            </span>
          </p>
          <button type="button" onClick={handleToggleSound} className="text-sm font-extrabold text-ink-soft underline">
            Sound {daily.soundOn ? 'on' : 'off'}
          </button>
        </div>
      </header>

      {daily.playedToday ? (
        <section className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-surface p-6 text-center shadow-lg">
          <p className="text-lg font-extrabold">
            {daily.lastCorrect ? 'Nailed it. See you tomorrow.' : 'Missed it — tomorrow is a new experiment.'}
          </p>
          <p className="text-sm text-ink-soft">Next experiment in <span className="font-extrabold text-ink">{daily.countdown}</span></p>
          <ShareGrid text={buildShareText(daily.today, daily.lastCorrect ?? false, daily.streak, origin)} />
          <Link href="/significant" className="text-sm font-extrabold text-ink-soft underline">Back to campaign</Link>
        </section>
      ) : (
        <GameRound
          key={daily.scenario.seed}
          scenario={daily.scenario}
          combo={1}
          soundOn={daily.soundOn}
          mode="daily"
          onComplete={({ correct, xpEarned }) => {
            pendingCorrectRef.current = correct;
            daily.complete(correct, xpEarned);
          }}
        />
      )}
    </main>
  );
}
