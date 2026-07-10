'use client';

import Link from 'next/link';
import { useCampaign } from '@/hooks/useCampaign';
import { LevelPath } from '@/components/significant/LevelPath';
import { IQCard } from '@/components/significant/IQCard';
import { CountUp } from '@/components/juice/CountUp';

export default function SignificantHome() {
  const { ready, state, levels, totalStars, allDone, toggleSound } = useCampaign();
  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-deep">Significant</h1>
          <p className="text-sm text-ink-soft">Ship, kill, or keep running?</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold"><CountUp value={state.xp} /> XP</p>
          <button type="button" onClick={toggleSound} className="text-sm font-extrabold text-ink-soft underline">
            Sound {state.soundOn ? 'on' : 'off'}
          </button>
        </div>
      </header>

      <p className="rounded-2xl bg-win/15 px-4 py-2 text-sm font-extrabold text-win-deep">
        Baseline calibrated ✓ — {totalStars} star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} />}
      <LevelPath levels={levels} />

      <Link href="/significant/daily" className="rounded-[var(--radius-card)] bg-gold p-4 text-center font-extrabold text-white shadow-lg active:scale-95">
        Daily experiment {state.dailyStreak > 0 ? `· streak ${state.dailyStreak}` : ''}
      </Link>
      <Link href="/significant/about" className="text-center text-sm font-extrabold text-ink-soft underline">
        How this game was designed
      </Link>
    </main>
  );
}
