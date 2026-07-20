'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCampaign } from '@/hooks/useCampaign';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { CALIBRATION_CORRECT_XP } from '@/lib/progress';
import {
  CALIBRATION_ROUNDS,
  CALIBRATION_TOTAL,
  type CalibrationRoundDefinition,
} from '@/lib/significant/calibration';
import { track } from '@/services/analyticsService';
import type { Call } from '@/lib/engine/types';

export function useCalibration() {
  const campaign = useCampaign();
  const { preferences } = usePreferences();
  const [coaching, setCoaching] = useState(true);
  const introTrackedRef = useRef(false);
  const decisionStepRef = useRef<number | null>(null);
  const continuedRevealRef = useRef<string | null>(null);
  const stepIndex = campaign.state?.calibrationStep ?? 0;
  const definition: CalibrationRoundDefinition = CALIBRATION_ROUNDS[stepIndex];
  const call = campaign.state?.pendingCalibrationCall ?? null;
  const correct = call === null ? null : call === definition.correctCall;
  const phase = call === null ? 'deciding' : 'revealed';
  const isFinalRound = stepIndex === CALIBRATION_TOTAL - 1;

  useEffect(() => {
    if (!campaign.ready || !campaign.state || !campaign.visitor || introTrackedRef.current) return;
    introTrackedRef.current = true;
    track('game_intro_viewed', { gameId: 'significant', visitor: campaign.visitor });
    track('calibration_started', { gameId: 'significant' });
  }, [campaign.ready, campaign.state, campaign.visitor]);

  const playFeedback = useCallback((wasCorrect: boolean) => {
    sfx.click(preferences.sound);
    if (wasCorrect) {
      sfx.win(preferences.sound);
      vibrate(30, preferences.haptics);
      return;
    }
    sfx.lose(preferences.sound);
    vibrate([60, 40, 60], preferences.haptics);
  }, [preferences.haptics, preferences.sound]);

  const decide = useCallback((nextCall: Call): boolean | null => {
    if (!campaign.ready || call !== null || decisionStepRef.current === stepIndex) return null;
    decisionStepRef.current = stepIndex;
    const wasCorrect = nextCall === definition.correctCall;
    campaign.commitCalibrationDecision(nextCall, wasCorrect);
    track('decision_made', {
      gameId: 'significant',
      mode: 'calibration',
      level: 'calibration',
      call: nextCall,
    });
    track('reveal_viewed', {
      gameId: 'significant',
      mode: 'calibration',
      correct: wasCorrect,
      archetype: definition.scenario.archetype,
    });
    playFeedback(wasCorrect);
    return wasCorrect;
  }, [call, campaign, definition, playFeedback, stepIndex]);

  const continueRound = useCallback((): boolean => {
    if (call === null) return false;
    const revealKey = `${stepIndex}:${call}`;
    if (continuedRevealRef.current === revealKey) return false;
    continuedRevealRef.current = revealKey;
    if (isFinalRound) {
      track('round_continued', {
        gameId: 'significant',
        mode: 'calibration',
        nextAction: 'campaign_path',
      });
    }
    campaign.continueCalibration();
    return isFinalRound;
  }, [call, campaign, isFinalRound, stepIndex]);

  return {
    ready: campaign.ready,
    coaching,
    setCoaching,
    phase,
    call,
    correct,
    scenario: definition.scenario,
    prompt: definition.prompt,
    reason: definition.reason,
    stepNumber: definition.id,
    totalSteps: CALIBRATION_TOTAL,
    isFinalRound,
    xpEarned: correct && campaign.visitor === 'first' ? CALIBRATION_CORRECT_XP : 0,
    isReplay: campaign.visitor === 'returning',
    decide,
    continueRound,
  };
}
