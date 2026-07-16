'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDots, Info } from '@phosphor-icons/react';
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
    return <main className="significant-campaign" aria-busy="true" />;
  }

  const nextLevel = levels.find((level) => level.status === 'open');

  return (
    <main className="significant-campaign mx-auto flex max-w-md flex-col gap-5">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral-deep">Your field notebook</p>
        <h1 className="significant-section-title mt-1 text-2xl text-ink">Significant</h1>
        <p className="mt-1 text-sm text-ink-soft">Find the signal. Make the call.</p>
      </header>

      <p className="rounded-2xl bg-[#e8fff1] px-4 py-3 text-sm font-extrabold text-win-text shadow-[0_4px_0_rgba(34,197,94,0.16)]">
        Calibration complete — {totalStars} campaign star{totalStars === 1 ? '' : 's'} collected
      </p>

      {allDone && <IQCard levels={levels} xp={state.xp} celebrate={celebrate} />}
      {!allDone && nextLevel && (
        <Link
          href={`/significant/play?level=${nextLevel.id}`}
          className="significant-sun-button flex min-h-16 items-center justify-between gap-3 px-5 py-4"
        >
          <span>
            <span className="block text-xs font-extrabold uppercase tracking-wide text-ink/65">Continue campaign</span>
            <span className="mt-1 block font-extrabold">Case {nextLevel.id} · {nextLevel.id === 1 ? 'Confirm a clean win' : 'Practice the next signal'}</span>
          </span>
          <ArrowRight size={22} weight="bold" aria-hidden />
        </Link>
      )}
      <LevelPath levels={levels} />

      <Link href="/significant/daily" className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-cyan px-4 text-center font-extrabold text-ink shadow-[0_5px_0_#209da5] active:translate-y-1 active:shadow-none">
        <CalendarDots size={22} weight="fill" aria-hidden />
        Daily experiment {state.dailyStreak > 0 ? `· streak ${state.dailyStreak}` : ''}
      </Link>
      <Link href="/significant/about?from=significant" className="flex min-h-11 items-center justify-center gap-2 text-center text-sm font-extrabold text-ink-soft underline underline-offset-4">
        <Info size={19} weight="fill" aria-hidden /> How this game was designed
      </Link>
    </main>
  );
}
