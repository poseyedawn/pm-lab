'use client';

import { useCallback, useState } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';
import { xpForCall } from '@/lib/progress';

interface RoundState {
  phase: 'deciding' | 'revealed';
  call: Call | null;
  correct: boolean | null;
  crit: boolean;
  xpEarned: number;
}

export function useGameRound(scenario: Scenario, combo: number) {
  const [state, setState] = useState<RoundState>({
    phase: 'deciding', call: null, correct: null, crit: false, xpEarned: 0,
  });

  const decide = useCallback(
    (call: Call) => {
      setState((prev) => {
        if (prev.phase === 'revealed') return prev;
        const correct = call === scenario.truth.correctCall;
        const crit = correct && Math.random() < 0.05;
        return {
          phase: 'revealed', call, correct, crit,
          xpEarned: xpForCall(correct, combo) * (crit ? 2 : 1),
        };
      });
    },
    [scenario, combo],
  );

  return { ...state, decide };
}
