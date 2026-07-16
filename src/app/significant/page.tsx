'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCampaign } from '@/hooks/useCampaign';
import { LevelPath } from '@/components/significant/LevelPath';
import { IQCard } from '@/components/significant/IQCard';
import { firstTryBand, track } from '@/services/analyticsService';

export default function SignificantHome() {
  const { ready, visitor, state, levels, totalStars, allDone, markCampaignCompleteTracked } = useCampaign();
  const introTrackedRef = useRef(false);

  useEffect(() => {
    if (!ready || !visitor || introTrackedRef.current) return;
    introTrackedRef.current = true;
    track('game_intro_viewed', { gameId: 'significant', visitor });
  }, [ready, visitor]);

  // Persisted dedup: campaignCompleteTracked lives in SignificantState, so this
  // fires exactly once across the player's lifetime, not once per session.
  const celebrate = allDone && !!state && !state.campaignCompleteTracked;

  useEffect(() => {
    if (allDone && state && !state.campaignCompleteTracked) {
      markCampaignCompleteTracked();
      const firstTry = levels.filter((level) => level.stars === 3).length;
      track('campaign_completed', { firstTryBand: firstTryBand(firstTry) });
    }
  }, [allDone, state, levels, markCampaignCompleteTracked]);

  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-deep">Significant</h1>
        <p className="text-sm text-ink-soft">Ship, kill, or keep running?</p>
      </header>

      <p className="rounded-2xl bg-win/15 px-4 py-2 text-sm font-extrabold text-win-text">
        Baseline calibrated ✓ — {totalStars} star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} celebrate={celebrate} />}
      <LevelPath levels={levels} />

      <Link href="/significant/daily" className="rounded-[var(--radius-card)] bg-gold p-4 text-center font-extrabold text-ink shadow-lg active:scale-95">
        Daily experiment {state.dailyStreak > 0 ? `· streak ${state.dailyStreak}` : ''}
      </Link>
      <Link href="/significant/about?from=significant" className="text-center text-sm font-extrabold text-ink-soft underline">
        How this game was designed
      </Link>
    </main>
  );
}
