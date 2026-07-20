'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RunScreen } from '@/components/ship-it/RunScreen';
import { usePreferences } from '@/hooks/lab/usePreferences';
import {
  freeRunKey,
  loadShipItState,
  recordFreeRunReward,
  saveShipItState,
  type ShipItState,
} from '@/lib/ship-it/state';
import type { SavedShipRun } from '@/lib/ship-it/types';
import { track } from '@/services/analyticsService';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export default function ShipItPlay() {
  const [state, setState] = useState<ShipItState | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const { preferences, ready: preferencesReady, reducedMotion } = usePreferences();
  const startTracked = useRef(false);

  useEffect(() => {
    const loaded = loadShipItState();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration + seed mint from browser storage
    setState(loaded);
    setSeed(loaded.activeFreeRun?.run.seed ?? randomSeed());
    if (!startTracked.current) {
      startTracked.current = true;
      track('shipit_run_started', { mode: 'free' });
    }
  }, []);

  const persistSnapshot = (snapshot: SavedShipRun) => {
    setState((previous) => {
      if (!previous) return previous;
      const next = { ...previous, activeFreeRun: snapshot };
      saveShipItState(next);
      return next;
    });
  };

  const rewardAlreadyRecorded = state?.activeFreeRun
    ? state.rewardedRunKeys.includes(freeRunKey(state.activeFreeRun.run))
    : false;

  return (
    <>
      {!state || seed === null || !preferencesReady ? (
        <GameEntryLoading
          gameName="Ship It"
          description="Restoring the quarter and its latest decision."
          theme="ship-it"
        />
      ) : (
        <main className="ship-it-run-page mx-auto flex max-w-md flex-col gap-4 p-6">
          <header className="flex items-center justify-between">
            <Link href="/ship-it" className="text-sm font-extrabold text-ink-soft underline">← Ship It</Link>
            <p className="text-sm font-extrabold text-ink-soft">Free run</p>
          </header>
          <RunScreen
            key={seed}
            seed={seed}
            mode="free"
            soundOn={preferences.sound}
            hapticsOn={preferences.haptics}
            reducedMotion={reducedMotion}
            totalXp={state.xp}
            initialSnapshot={state.activeFreeRun ?? undefined}
            rewardAlreadyRecorded={rewardAlreadyRecorded}
            onSnapshotChange={persistSnapshot}
            onRunEnd={(review, run, xp) => {
              setState((prev) => {
                if (!prev) return prev;
                const next = recordFreeRunReward(prev, run, review.rating, xp);
                saveShipItState(next);
                return next;
              });
            }}
            onRunBack={() => {
              track('shipit_run_started', { mode: 'free' });
              const nextSeed = randomSeed();
              setState((previous) => {
                if (!previous) return previous;
                const next = { ...previous, activeFreeRun: null };
                saveShipItState(next);
                return next;
              });
              setSeed(nextSeed);
            }}
          />
        </main>
      )}
    </>
  );
}
