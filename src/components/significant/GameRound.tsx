'use client';

import { useEffect, useRef } from 'react';
import type { Call, RoundResult, Scenario } from '@/lib/engine/types';
import { useGameRound } from '@/hooks/useGameRound';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';
import { RevealPanel } from '@/components/significant/RevealPanel';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { track } from '@/services/analyticsService';
import { usePreferences } from '@/hooks/lab/usePreferences';

interface GameRoundBaseProps {
  scenario: Scenario;
  combo: number;
  initialResult?: RoundResult | null;
  onDecision: (result: RoundResult) => void;
  onContinue: (result: RoundResult) => void;
}

type GameRoundProps = GameRoundBaseProps & (
  | { mode: 'campaign'; level: number }
  | { mode: 'daily'; level?: never }
);

export function GameRound({
  scenario,
  combo,
  initialResult = null,
  mode,
  level,
  onDecision,
  onContinue,
}: GameRoundProps) {
  const round = useGameRound(scenario, combo, initialResult);
  const { preferences, reducedMotion } = usePreferences();
  const nextCalledRef = useRef(false);
  const resultHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (round.phase !== 'revealed' || !round.correct || !resultHostRef.current) return;
    return fireConfetti({ reducedMotion, container: resultHostRef.current });
  }, [reducedMotion, round.correct, round.phase]);

  const handleCall = (call: Call) => {
    const result = round.decide(call);
    if (!result) return; // A duplicate tap has already revealed the result.
    onDecision(result);
    if (mode === 'campaign') {
      track('decision_made', { gameId: 'significant', mode, level, call });
    } else {
      track('decision_made', { gameId: 'significant', mode, level: 'daily', call });
    }
    track('reveal_viewed', { gameId: 'significant', mode, correct: result.correct, archetype: scenario.archetype });
    sfx.click(preferences.sound);
    if (result.correct) {
      sfx.win(preferences.sound);
      vibrate(30, preferences.haptics);
    } else {
      sfx.lose(preferences.sound);
      vibrate([60, 40, 60], preferences.haptics);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {round.phase === 'deciding' ? (
        <>
          <ReadoutCard scenario={scenario} />
          <DecisionButtons onCall={handleCall} />
        </>
      ) : (
        <div ref={resultHostRef} className="significant-result-host">
          <RevealPanel
            scenario={scenario}
            call={round.call!}
            correct={round.correct!}
            xpEarned={round.xpEarned}
            crit={round.crit}
            nextLabel={mode === 'daily'
              ? "See today's result"
              : 'Return to campaign'}
            onNext={() => {
              if (nextCalledRef.current) return;
              nextCalledRef.current = true;
              track('round_continued', {
                gameId: 'significant',
                mode,
                nextAction: mode === 'daily' ? 'daily_result' : 'campaign_path',
              });
              onContinue({
                call: round.call!,
                correct: round.correct!,
                crit: round.crit,
                xpEarned: round.xpEarned,
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
