'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAMPAIGN_LEVELS, campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { useCampaign } from '@/hooks/useCampaign';
import { GameRound } from '@/components/significant/GameRound';
import { ComboFlame } from '@/components/significant/ComboFlame';
import { track } from '@/lib/analytics';

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const levelId = Number(params.get('level') ?? '1');
  const { ready, state, completeLevel } = useCampaign();
  const startTracked = useRef(false);

  useEffect(() => {
    if (startTracked.current) return;
    startTracked.current = true;
    track('game_start', { mode: 'campaign', level: levelId });
  }, [levelId]);

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
        soundOn={state.soundOn}
        onComplete={({ correct, xpEarned }) => {
          completeLevel(levelId, correct, xpEarned);
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
