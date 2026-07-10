'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCampaign } from '@/hooks/useCampaign';
import { LevelPath } from '@/components/significant/LevelPath';
import { IQCard } from '@/components/significant/IQCard';
import { CountUp } from '@/components/juice/CountUp';
import { track } from '@/lib/analytics';

export default function SignificantHome() {
  const { ready, state, levels, totalStars, allDone, toggleSound } = useCampaign();
  const completeTracked = useRef(false);

  useEffect(() => {
    if (allDone && !completeTracked.current) {
      completeTracked.current = true;
      track('campaign_complete', { stars: totalStars });
    }
    // Session-level dedup only (ref, not persisted) — a fresh page load can
    // re-fire this once more; localStorage-based dedup is not required here.
  }, [allDone, totalStars]);

  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const handleToggleSound = () => {
    track('sound_toggled', { on: !state.soundOn });
    toggleSound();
  };

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-deep">Significant</h1>
          <p className="text-sm text-ink-soft">Ship, kill, or keep running?</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold"><CountUp value={state.xp} /> XP</p>
          <button type="button" onClick={handleToggleSound} className="text-sm font-extrabold text-ink-soft underline">
            Sound {state.soundOn ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <p className="rounded-2xl bg-win/15 px-4 py-2 text-sm font-extrabold text-win-text">
        Baseline calibrated ✓ — {totalStars} star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} />}
      <LevelPath levels={levels} />

      <Link href="/significant/daily" className="rounded-[var(--radius-card)] bg-gold p-4 text-center font-extrabold text-ink shadow-lg active:scale-95">
        Daily experiment {state.dailyStreak > 0 ? `· streak ${state.dailyStreak}` : ''}
      </Link>
      <Link href="/significant/about" className="text-center text-sm font-extrabold text-ink-soft underline">
        How this game was designed
      </Link>
    </main>
  );
}
