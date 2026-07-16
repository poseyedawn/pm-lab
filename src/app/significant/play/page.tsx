'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAMPAIGN_LEVELS, campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { resolveCampaignLevel } from '@/lib/engine/level';
import { useCampaign } from '@/hooks/useCampaign';
import { GameRound } from '@/components/significant/GameRound';
import { ComboFlame } from '@/components/significant/ComboFlame';
import { track } from '@/services/analyticsService';

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { levelId, isCanonical } = resolveCampaignLevel(params.get('level'));
  const { ready, state, completeLevel } = useCampaign();
  const redirectStartedRef = useRef(false);

  useEffect(() => {
    if (isCanonical || redirectStartedRef.current) return;
    redirectStartedRef.current = true;
    router.replace('/significant/play?level=1');
  }, [isCanonical, router]);

  const calibrationTrackedRef = useRef(false);
  useEffect(() => {
    if (!ready || !state || levelId !== 1 || Object.keys(state.campaign).length > 0 || calibrationTrackedRef.current) return;
    calibrationTrackedRef.current = true;
    track('calibration_started', { gameId: 'significant' });
  }, [levelId, ready, state]);

  const scenario = useMemo(() => {
    const level = CAMPAIGN_LEVELS.find((l) => l.id === levelId) ?? CAMPAIGN_LEVELS[0];
    const attempts = state?.campaign[level.id]?.attempts ?? 0;
    return generateScenario(campaignSeed(level.id, attempts + 1), level.archetype);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate only per page load, not per state change
  }, [levelId, ready]);

  if (!ready || !state) return <main className="mx-auto max-w-md p-6" aria-busy="true" />;

  const combo = 1 + state.campaignStreak;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-brand-deep">Level {levelId}</h1>
        <ComboFlame combo={combo} />
      </header>
      <GameRound
        scenario={scenario}
        combo={combo}
        mode="campaign"
        level={levelId}
        onComplete={({ correct, xpEarned }) => {
          const previous = state.campaign[levelId];
          const attempts = (previous?.attempts ?? 0) + 1;
          const earnedStars: 0 | 1 | 3 = correct ? (attempts === 1 ? 3 : 1) : 0;
          const stars = Math.max(previous?.stars ?? 0, earnedStars) as 0 | 1 | 3;
          completeLevel(levelId, correct, xpEarned);
          if (correct) track('campaign_level_completed', { level: levelId, attempts, stars });
          router.push('/significant');
        }}
      />
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayInner />
    </Suspense>
  );
}
