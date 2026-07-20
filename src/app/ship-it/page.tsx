'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadShipItState, type ShipItState } from '@/lib/ship-it/state';
import { METERS, METER_INFO } from '@/lib/ship-it/types';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';
import { Fire } from '@phosphor-icons/react';
import { ShipMeterIcon } from '@/components/ship-it/ShipIcon';

export default function ShipItHome() {
  const [state, setState] = useState<ShipItState | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
    setState(loadShipItState());
  }, []);

  return (
    <>
      {state === null ? (
        <GameEntryLoading
          gameName="Ship It"
          description="Loading the quarter, its tradeoffs, and your saved review."
          theme="ship-it"
        />
      ) : (
        <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
          <header>
            <h1 className="text-2xl font-extrabold text-sky-deep">Ship It</h1>
            <p className="text-sm text-ink-soft">One card at a time. Everyone wants something.</p>
          </header>

          <p className="text-sm text-ink-soft">
            You are the PM. Make twelve weekly calls in about three minutes. Keep Customer, Business, Team and Tech
            above zero through the quarter. Open consequences can extend the run to eighteen weeks.
          </p>

          <p className="text-sm text-ink-soft">
            Most cards are real tradeoffs. Consent, accessibility, security and truthful claims are hard boundaries.
            A balanced roadmap cannot erase an integrity breach.
          </p>

          <div className="grid grid-cols-4 gap-2 rounded-[var(--radius-card)] bg-surface p-4 shadow-lg">
            {METERS.map((m) => (
              <div key={m} className="flex flex-col items-center text-center">
                <ShipMeterIcon id={m} size={24} />
                <p className="text-xs font-extrabold text-ink-soft">{METER_INFO[m].label}</p>
              </div>
            ))}
          </div>

          <Link href="/ship-it/play" className="rounded-[var(--radius-card)] bg-sky p-5 text-[#2c0d34] shadow-lg active:scale-95">
            <p className="text-lg font-extrabold">Free run</p>
            <p className="text-sm">A fresh product, a fresh mess.{state.bestRatingFree ? ` Best: ${state.bestRatingFree}` : ''}</p>
          </Link>
          <Link href="/ship-it/daily" className="rounded-[var(--radius-card)] bg-gold p-5 text-ink shadow-lg active:scale-95">
            <p className="flex items-center gap-2 text-lg font-extrabold">
              Daily run
              {state.dailyStreak > 0 && (
                <span className="inline-flex items-center gap-1 text-sm" aria-label={`Streak ${state.dailyStreak}`}>
                  <Fire aria-hidden data-testid="ship-daily-streak-icon" size={18} weight="fill" /> {state.dailyStreak}
                </span>
              )}
            </p>
            <p className="text-sm opacity-80">One shared deck for your device&apos;s local date.{state.bestRatingDaily ? ` Best: ${state.bestRatingDaily}` : ''}</p>
          </Link>
          <Link href="/ship-it/about" className="text-center text-sm font-extrabold text-ink-soft underline">
            How this game was designed
          </Link>
        </main>
      )}
    </>
  );
}
