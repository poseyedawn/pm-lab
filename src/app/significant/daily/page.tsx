'use client';

import Link from 'next/link';
import { dayNumber } from '@/lib/engine/daily';
import { buildShareText, useDaily } from '@/hooks/useDaily';
import { GameRound } from '@/components/significant/GameRound';
import { ShareGrid } from '@/components/significant/ShareGrid';

export default function DailyPage() {
  const daily = useDaily();
  if (!daily.ready) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-brand-deep">Daily #{dayNumber(daily.today)}</h1>
        <p className="font-extrabold text-gold" aria-label={`Streak ${daily.streak}`}>
          🔥 {daily.streak}{daily.shields > 0 ? ` · 🛡 ${daily.shields}` : ''}
        </p>
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
          scenario={daily.scenario}
          combo={1}
          soundOn={daily.soundOn}
          onComplete={({ correct, xpEarned }) => daily.complete(correct, xpEarned)}
        />
      )}
    </main>
  );
}
