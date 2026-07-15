'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { dayNumber } from '@/lib/engine/daily';
import { useShipDaily } from '@/hooks/useShipDaily';
import { RunScreen } from '@/components/shipit/RunScreen';
import { track } from '@/lib/analytics';

export default function ShipItDaily() {
  const daily = useShipDaily();
  const startTracked = useRef(false);
  // True once the run finished during THIS visit: keep the review card (with
  // share) on screen instead of instantly swapping to the played-today gate.
  const [ranThisVisit, setRanThisVisit] = useState(false);
  // Baseline streak value, captured on the first "ready" render — see
  // significant/daily/page.tsx for why this is driven off the re-rendered prop.
  const prevStreakRef = useRef<number | null>(null);

  useEffect(() => {
    if (daily.ready && !daily.playedToday && !startTracked.current) {
      startTracked.current = true;
      track('game_start', { mode: 'shipit-daily' });
    }
  }, [daily.ready, daily.playedToday]);

  useEffect(() => {
    if (!daily.ready) return;
    if (prevStreakRef.current === null) {
      prevStreakRef.current = daily.streak;
      return;
    }
    if (daily.streak > prevStreakRef.current) track('streak_extended', { streak: daily.streak });
    prevStreakRef.current = daily.streak;
  }, [daily.ready, daily.streak]);

  if (!daily.ready) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-sky-deep">Daily run #{dayNumber(daily.today)}</h1>
        <div className="flex flex-col items-end gap-1">
          <p className="font-extrabold text-gold-text">
            <span role="img" aria-label={`Streak ${daily.streak}`}>
              🔥 {daily.streak}{daily.shields > 0 ? ` · 🛡 ${daily.shields}` : ''}
            </span>
          </p>
          <button type="button" onClick={() => { track('sound_toggled', { on: !daily.soundOn }); daily.toggleSound(); }} className="text-sm font-extrabold text-ink-soft underline">
            Sound {daily.soundOn ? 'on' : 'off'}
          </button>
        </div>
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
          mode="shipit-daily"
          soundOn={daily.soundOn}
          totalXp={daily.xp}
          onRunEnd={(review, _run, xp) => {
            setRanThisVisit(true);
            daily.complete(review.rating, xp);
            track('daily_played', { rating: review.rating });
          }}
        />
      )}
    </main>
  );
}
