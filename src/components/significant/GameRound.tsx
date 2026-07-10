'use client';

import { useReducedMotion } from 'framer-motion';
import type { Scenario } from '@/lib/engine/types';
import { useGameRound } from '@/hooks/useGameRound';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';
import { RevealPanel } from '@/components/significant/RevealPanel';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';

interface GameRoundProps {
  scenario: Scenario;
  combo: number;
  soundOn: boolean;
  onComplete: (r: { correct: boolean; xpEarned: number }) => void;
}

export function GameRound({ scenario, combo, soundOn, onComplete }: GameRoundProps) {
  const round = useGameRound(scenario, combo);
  const reducedMotion = useReducedMotion() ?? false;

  const handleCall = (call: Parameters<typeof round.decide>[0]) => {
    sfx.click(soundOn);
    round.decide(call);
    // decide() resolves synchronously into state on next render; recompute here for feedback:
    const correct = call === scenario.truth.correctCall;
    if (correct) {
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
          onNext={() => onComplete({ correct: round.correct!, xpEarned: round.xpEarned })}
        />
      )}
    </div>
  );
}
