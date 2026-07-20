'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CAMPAIGN_LEVELS, campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { resolveCampaignLevel } from '@/lib/engine/level';
import { useCampaign } from '@/hooks/useCampaign';
import { GameRound } from '@/components/significant/GameRound';
import { ComboFlame } from '@/components/significant/ComboFlame';
import { track } from '@/services/analyticsService';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { levelId, isCanonical } = resolveCampaignLevel(params.get('level'));
  const { ready, state, commitLevelDecision, clearLevelReveal } = useCampaign();
  const redirectStartedRef = useRef(false);
  const legacyCalibration = params.get('calibration') === '1';

  useEffect(() => {
    if (redirectStartedRef.current) return;
    if (legacyCalibration) {
      redirectStartedRef.current = true;
      router.replace('/significant/calibration');
      return;
    }
    if (!ready || !state) return;
    if (!state.warmupDone) {
      redirectStartedRef.current = true;
      router.replace('/significant/calibration');
      return;
    }
    if (state.pendingCampaignReveal && state.pendingCampaignReveal.levelId !== levelId) {
      redirectStartedRef.current = true;
      router.replace(`/significant/play?level=${state.pendingCampaignReveal.levelId}`);
      return;
    }
    if (isCanonical) return;
    redirectStartedRef.current = true;
    router.replace('/significant/play?level=1');
  }, [isCanonical, legacyCalibration, levelId, ready, router, state]);

  const pendingReveal = state?.pendingCampaignReveal?.levelId === levelId
    ? state.pendingCampaignReveal
    : null;
  const level = CAMPAIGN_LEVELS.find((candidate) => candidate.id === levelId) ?? CAMPAIGN_LEVELS[0];
  const scenarioSeed = pendingReveal?.scenarioSeed
    ?? campaignSeed(level.id, (state?.campaign[level.id]?.attempts ?? 0) + 1);

  const scenario = useMemo(() => {
    return generateScenario(scenarioSeed, level.archetype);
  }, [level.archetype, scenarioSeed]);

  if (
    !ready
    || !state
    || !state.warmupDone
    || !isCanonical
    || legacyCalibration
    || (state.pendingCampaignReveal && state.pendingCampaignReveal.levelId !== levelId)
  ) {
    return (
      <GameEntryLoading
        gameName="Significant"
        description="Restoring the experiment case and your committed decision."
        theme="significant"
      />
    );
  }

  const combo = 1 + state.campaignStreak;

  return (
    <main className="significant-play mx-auto flex max-w-md flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-coral-deep">Campaign case</p>
          <h1 className="significant-section-title text-lg text-ink">Level {levelId}</h1>
        </div>
        <ComboFlame combo={combo} />
      </header>
      <GameRound
        key={`${scenario.seed}:${pendingReveal?.call ?? 'deciding'}`}
        scenario={scenario}
        combo={combo}
        mode="campaign"
        level={levelId}
        initialResult={pendingReveal}
        onDecision={(result) => {
          const previous = state.campaign[levelId];
          const attempts = (previous?.attempts ?? 0) + 1;
          const earnedStars: 0 | 1 | 3 = result.correct ? (attempts === 1 ? 3 : 1) : 0;
          const stars = Math.max(previous?.stars ?? 0, earnedStars) as 0 | 1 | 3;
          commitLevelDecision(levelId, scenario.seed, result);
          if (result.correct) track('campaign_level_completed', { level: levelId, attempts, stars });
        }}
        onContinue={() => {
          clearLevelReveal(levelId);
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
