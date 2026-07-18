'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadShipItState, type ShipItState } from '@/lib/ship-it/state';
import { METERS, METER_INFO } from '@/lib/ship-it/types';

export default function ShipItHome() {
  const [state, setState] = useState<ShipItState | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage on mount
    setState(loadShipItState());
  }, []);

  return (
    <>
      {state === null ? (
        <main className="mx-auto max-w-md p-6" aria-busy="true" />
      ) : (
        <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
          <header>
            <h1 className="text-2xl font-extrabold text-sky-deep">Ship It</h1>
            <p className="text-sm text-ink-soft">One card at a time. Everyone wants something.</p>
          </header>

          <p className="text-sm text-ink-soft">
            You are the PM. Twelve weeks, four meters, no correct answers. Keep Users, Business, Team and Tech
            alive to the end of the quarter. Let any hit zero and it&apos;s over.
          </p>

          <div className="grid grid-cols-4 gap-2 rounded-[var(--radius-card)] bg-surface p-4 shadow-lg">
            {METERS.map((m) => (
              <div key={m} className="text-center">
                <p aria-hidden className="text-xl">{METER_INFO[m].emoji}</p>
                <p className="text-xs font-extrabold text-ink-soft">{METER_INFO[m].label}</p>
              </div>
            ))}
          </div>

          <Link href="/ship-it/play" className="rounded-[var(--radius-card)] bg-sky p-5 text-white shadow-lg active:scale-95">
            <p className="text-lg font-extrabold">Free run</p>
            <p className="text-sm opacity-90">A fresh product, a fresh mess.{state.bestRatingFree ? ` Best: ${state.bestRatingFree}` : ''}</p>
          </Link>
          <Link href="/ship-it/daily" className="rounded-[var(--radius-card)] bg-gold p-5 text-ink shadow-lg active:scale-95">
            <p className="text-lg font-extrabold">Daily run{state.dailyStreak > 0 ? ` · 🔥 ${state.dailyStreak}` : ''}</p>
            <p className="text-sm opacity-80">Same deck order for everyone today.{state.bestRatingDaily ? ` Best: ${state.bestRatingDaily}` : ''}</p>
          </Link>
          <Link href="/ship-it/about" className="text-center text-sm font-extrabold text-ink-soft underline">
            How this game was designed
          </Link>
        </main>
      )}
    </>
  );
}
