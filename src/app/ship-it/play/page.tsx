'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RunScreen } from '@/components/shipit/RunScreen';
import { loadShipItState, recordBestRating, saveShipItState, type ShipItState } from '@/lib/shipit/state';
import { track } from '@/lib/analytics';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function ShipItPlay() {
  const [state, setState] = useState<ShipItState | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const startTracked = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration + seed mint on mount
    setState(loadShipItState());
    setSeed(randomSeed());
    if (!startTracked.current) {
      startTracked.current = true;
      track('game_start', { mode: 'shipit-free' });
    }
  }, []);

  if (!state || seed === null) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <Link href="/ship-it" className="text-sm font-extrabold text-ink-soft underline">← Ship It</Link>
        <p className="text-sm font-extrabold text-ink-soft">Free run</p>
      </header>
      <RunScreen
        key={seed}
        seed={seed}
        mode="shipit-free"
        soundOn={state.soundOn}
        totalXp={state.xp}
        onRunEnd={(review, _run, xp) => {
          setState((prev) => {
            if (!prev) return prev;
            const next = recordBestRating({ ...prev, xp: prev.xp + xp }, 'free', review.rating);
            saveShipItState(next);
            return next;
          });
        }}
        onRunBack={() => {
          track('game_start', { mode: 'shipit-free' });
          setSeed(randomSeed());
        }}
      />
    </main>
  );
}
