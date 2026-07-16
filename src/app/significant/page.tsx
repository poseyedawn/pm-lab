'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from '@phosphor-icons/react';
import { useCampaign } from '@/hooks/useCampaign';
import { LevelPath } from '@/components/significant/LevelPath';
import { IQCard } from '@/components/significant/IQCard';
import { firstTryBand, track } from '@/services/analyticsService';

export default function SignificantHome() {
  const router = useRouter();
  const { ready, visitor, state, levels, totalStars, allDone, markCampaignCompleteTracked } = useCampaign();
  const introTrackedRef = useRef(false);
  const calibrationRedirectRef = useRef(false);

  useEffect(() => {
    if (!ready || visitor !== 'first' || calibrationRedirectRef.current) return;
    calibrationRedirectRef.current = true;
    router.replace('/significant/calibration');
  }, [ready, router, visitor]);

  useEffect(() => {
    if (!ready || visitor !== 'returning' || introTrackedRef.current) return;
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

  if (!ready || !state || visitor !== 'returning') {
    return <main className="mx-auto max-w-md p-6" aria-busy="true" />;
  }

  const nextLevel = levels.find((level) => level.status === 'open');

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-deep">Significant</h1>
        <p className="text-sm text-ink-soft">Ship, kill, or keep running?</p>
      </header>

      <p className="rounded-2xl bg-win/15 px-4 py-2 text-sm font-extrabold text-win-text">
        Calibration complete — {totalStars} campaign star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} celebrate={celebrate} />}
      {!allDone && nextLevel && (
        <Link
          href={`/significant/play?level=${nextLevel.id}`}
          className="flex min-h-16 items-center justify-between gap-3 rounded-[var(--radius-card)] bg-brand-deep px-5 py-4 text-white shadow-lg shadow-brand/20 active:scale-[0.98]"
        >
          <span>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-white/75">Continue campaign</span>
            <span className="mt-1 block font-extrabold">Case {nextLevel.id} · {nextLevel.id === 1 ? 'Confirm a clean win' : 'Practice the next signal'}</span>
          </span>
          <ArrowRight size={22} weight="bold" aria-hidden />
        </Link>
      )}
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
