'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCampaign } from '@/hooks/useCampaign';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { CALIBRATION_XP } from '@/lib/progress';
import { track } from '@/services/analyticsService';
import type { Call, Scenario } from '@/lib/engine/types';

interface CalibrationRoundState {
  phase: 'deciding' | 'revealed';
  call: Call | null;
  correct: boolean | null;
}

interface UseCalibrationOptions {
  scenario: Scenario;
  initialCall: Call | null;
}

function resolvedRound(scenario: Scenario, call: Call): CalibrationRoundState {
  return {
    phase: 'revealed',
    call,
    correct: call === scenario.truth.correctCall,
  };
}

export function useCalibration({ scenario, initialCall }: UseCalibrationOptions) {
  const campaign = useCampaign();
  const { completeCalibration } = campaign;
  const { preferences } = usePreferences();
  const initialRound = initialCall
    ? resolvedRound(scenario, initialCall)
    : { phase: 'deciding', call: null, correct: null } satisfies CalibrationRoundState;
  const [round, setRound] = useState<CalibrationRoundState>(initialRound);
  const [coaching, setCoaching] = useState(true);
  const roundRef = useRef(initialRound);
  const introTrackedRef = useRef(false);
  const initialCallHandledRef = useRef(false);

  const playFeedback = useCallback((correct: boolean) => {
    sfx.click(preferences.sound);
    if (correct) {
      sfx.win(preferences.sound);
      vibrate(30, preferences.haptics);
    } else {
      sfx.lose(preferences.sound);
      vibrate([60, 40, 60], preferences.haptics);
    }
  }, [preferences.haptics, preferences.sound]);

  const finalizeDecision = useCallback((call: Call, correct: boolean, playDecisionFeedback = true) => {
    track('decision_made', {
      gameId: 'significant',
      mode: 'calibration',
      level: 'calibration',
      call,
    });
    track('reveal_viewed', {
      gameId: 'significant',
      mode: 'calibration',
      correct,
      archetype: scenario.archetype,
    });
    completeCalibration();
    if (playDecisionFeedback) playFeedback(correct);
  }, [completeCalibration, playFeedback, scenario.archetype]);

  useEffect(() => {
    if (!campaign.ready || !campaign.state || !campaign.visitor) return;
    if (!introTrackedRef.current) {
      introTrackedRef.current = true;
      track('game_intro_viewed', { gameId: 'significant', visitor: campaign.visitor });
      track('calibration_started', { gameId: 'significant' });
    }
    if (initialCall && !initialCallHandledRef.current) {
      initialCallHandledRef.current = true;
      finalizeDecision(initialCall, initialCall === scenario.truth.correctCall, false);
    }
  }, [campaign.ready, campaign.state, campaign.visitor, finalizeDecision, initialCall, scenario.truth.correctCall]);

  const decide = useCallback((call: Call): boolean | null => {
    if (!campaign.ready || roundRef.current.phase === 'revealed') return null;
    const next = resolvedRound(scenario, call);
    roundRef.current = next;
    setRound(next);
    finalizeDecision(call, next.correct!);
    return next.correct;
  }, [campaign.ready, finalizeDecision, scenario]);

  const continueToCampaign = useCallback(() => {
    track('round_continued', {
      gameId: 'significant',
      mode: 'calibration',
      nextAction: 'campaign_path',
    });
  }, []);

  return {
    ready: campaign.ready,
    coaching,
    setCoaching,
    phase: round.phase,
    call: round.call,
    correct: round.correct,
    earnedBaseline: round.phase === 'revealed' && campaign.visitor === 'first',
    baselineXp: CALIBRATION_XP,
    decide,
    continueToCampaign,
  };
}
