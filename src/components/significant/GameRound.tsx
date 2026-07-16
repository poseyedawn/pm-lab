'use client';

import { useRef } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';
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
  onComplete: (r: { correct: boolean; xpEarned: number }) => void;
}

type GameRoundProps = GameRoundBaseProps & (
  | { mode: 'campaign'; level: number }
  | { mode: 'daily'; level?: never }
);

export function GameRound({ scenario, combo, mode, level, onComplete }: GameRoundProps) {
  const round = useGameRound(scenario, combo);
  const { preferences, reducedMotion } = usePreferences();
  // Guards against a double-tap on "Next" double-granting XP: onComplete
  // must fire at most once per round, even if the button is tapped twice
  // before the parent navigates away.
  const nextCalledRef = useRef(false);

  const handleCall = (call: Call) => {
    const result = round.decide(call);
    if (!result) return; // duplicate tap — already revealed
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
      fireConfetti({ reducedMotion });
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
        <RevealPanel
          scenario={scenario}
          call={round.call!}
          correct={round.correct!}
          xpEarned={round.xpEarned}
          crit={round.crit}
          onNext={() => {
            if (nextCalledRef.current) return;
            nextCalledRef.current = true;
            track('round_continued', {
              gameId: 'significant',
              mode,
              nextAction: mode === 'daily' ? 'daily_result' : 'campaign_path',
            });
            onComplete({ correct: round.correct!, xpEarned: round.xpEarned });
          }}
        />
      )}
    </div>
  );
}
