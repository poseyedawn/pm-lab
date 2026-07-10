'use client';

import { useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Call, Scenario } from '@/lib/engine/types';
import { useGameRound } from '@/hooks/useGameRound';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';
import { RevealPanel } from '@/components/significant/RevealPanel';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { track } from '@/lib/analytics';

interface GameRoundProps {
  scenario: Scenario;
  combo: number;
  soundOn: boolean;
  onComplete: (r: { correct: boolean; xpEarned: number }) => void;
}

export function GameRound({ scenario, combo, soundOn, onComplete }: GameRoundProps) {
  const round = useGameRound(scenario, combo);
  const reducedMotion = useReducedMotion() ?? false;
  // Guards against a double-tap on "Next" double-granting XP: onComplete
  // must fire at most once per round, even if the button is tapped twice
  // before the parent navigates away.
  const nextCalledRef = useRef(false);

  const handleCall = (call: Call) => {
    const result = round.decide(call);
    if (!result) return; // duplicate tap — already revealed
    track('round_complete', {
      archetype: scenario.archetype,
      correct: result.correct,
      mode: window.location.pathname.includes('daily') ? 'daily' : 'campaign',
    });
    sfx.click(soundOn);
    if (result.correct) {
      sfx.win(soundOn);
      vibrate(30);
      fireConfetti({ reducedMotion });
    } else {
      sfx.lose(soundOn);
      vibrate([60, 40, 60]);
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
            onComplete({ correct: round.correct!, xpEarned: round.xpEarned });
          }}
        />
      )}
    </div>
  );
}
