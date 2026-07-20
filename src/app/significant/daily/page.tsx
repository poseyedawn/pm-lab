'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fire, ShieldCheck } from '@phosphor-icons/react';
import { dayNumber } from '@/lib/engine/daily';
import { buildShareText, useDaily } from '@/hooks/useDaily';
import { GameRound } from '@/components/significant/GameRound';
import { ShareGrid } from '@/components/significant/ShareGrid';
import { streakBand, track } from '@/services/analyticsService';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';

export default function DailyPage() {
  const router = useRouter();
  const daily = useDaily();
  const viewTrackedRef = useRef(false);
  const pendingCorrectRef = useRef<boolean | null>(null);
  // Baseline streak value, captured on the first ready render. It stays null until then.
  // We compare against this (not against a value read via loadState() right after
  // daily.complete()) because React's setState updater, where saveState() actually
  // runs, is not guaranteed to have flushed synchronously by the next line of the
  // handler; driving the comparison off the re-rendered `daily.streak` prop is
  // deterministic regardless of batching.
  const prevStreakRef = useRef<number | null>(null);
  const calibrationRedirectRef = useRef(false);

  useEffect(() => {
    if (!daily.ready || daily.calibrated || calibrationRedirectRef.current) return;
    calibrationRedirectRef.current = true;
    router.replace('/significant/calibration');
  }, [daily.calibrated, daily.ready, router]);

  useEffect(() => {
    if (!daily.ready || !daily.calibrated || viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    track('daily_viewed', { state: daily.playedToday ? 'completed' : 'unplayed' });
  }, [daily.calibrated, daily.ready, daily.playedToday]);

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

  if (!daily.ready || !daily.calibrated) {
    return (
      <GameEntryLoading
        gameName="Significant Daily"
        description="Checking today's local experiment and your saved result."
        theme="significant"
      />
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="significant-daily mx-auto flex max-w-md flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-coral-deep">One fresh signal</p>
          <h1 className="significant-section-title text-lg text-ink">Daily #{dayNumber(daily.today)}</h1>
        </div>
        <p className="flex items-center gap-2 font-extrabold text-gold-text" aria-label={`Streak ${daily.streak}${daily.shields > 0 ? `, ${daily.shields} shields` : ''}`}>
          <span className="inline-flex items-center gap-1"><Fire size={20} weight="fill" aria-hidden />{daily.streak}</span>
          {daily.shields > 0 && <span className="inline-flex items-center gap-1"><ShieldCheck size={20} weight="fill" aria-hidden />{daily.shields}</span>}
        </p>
      </header>

      {daily.pendingReveal ? (
        <GameRound
          key={`${daily.scenario.seed}:${daily.pendingReveal.call}`}
          scenario={daily.scenario}
          combo={1}
          mode="daily"
          initialResult={daily.pendingReveal}
          onDecision={() => undefined}
          onContinue={() => daily.finishReveal()}
        />
      ) : daily.playedToday ? (
        <section className="significant-card flex flex-col gap-4 rounded-[var(--radius-card)] p-6 text-center">
          <p className="text-lg font-extrabold">
            {daily.lastCorrect ? 'Nailed it. See you tomorrow.' : 'Not this one. A new experiment arrives tomorrow.'}
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
          mode="daily"
          onDecision={(result) => {
            pendingCorrectRef.current = result.correct;
            daily.commitDecision(result);
          }}
          onContinue={() => daily.finishReveal()}
        />
      )}
    </main>
  );
}
