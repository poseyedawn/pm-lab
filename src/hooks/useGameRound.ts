'use client';

import { useCallback, useRef, useState } from 'react';
import type { Call, RoundResult, Scenario } from '@/lib/engine/types';
import { xpForCall } from '@/lib/progress';

interface RoundState {
  phase: 'deciding' | 'revealed';
  call: Call | null;
  correct: boolean | null;
  crit: boolean;
  xpEarned: number;
}

function scoreCall(scenario: Scenario, combo: number, call: Call): RoundState & RoundResult {
  const correct = call === scenario.truth.correctCall;
  const crit = correct && Math.random() < 0.05;
  const xpEarned = xpForCall(correct, combo) * (crit ? 2 : 1);
  return { phase: 'revealed', call, correct, crit, xpEarned };
}

function restoredRound(result: RoundResult): RoundState {
  return { phase: 'revealed', ...result };
}

export function useGameRound(scenario: Scenario, combo: number, initialResult: RoundResult | null = null) {
  const [state, setState] = useState<RoundState>(() => (
    initialResult
      ? restoredRound(initialResult)
      : { phase: 'deciding', call: null, correct: null, crit: false, xpEarned: 0 }
  ));
  const stateRef = useRef<RoundState>(state);

  const decide = useCallback(
    (call: Call): RoundResult | null => {
      if (stateRef.current.phase === 'revealed') return null;
      const next = scoreCall(scenario, combo, call);
      stateRef.current = next;
      setState(next);
      return { call, correct: next.correct, crit: next.crit, xpEarned: next.xpEarned };
    },
    [scenario, combo],
  );

  return { ...state, decide };
}
