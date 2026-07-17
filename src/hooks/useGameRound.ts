'use client';

import { useCallback, useRef, useState } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';
import { xpForCall } from '@/lib/progress';

interface RoundState {
  phase: 'deciding' | 'revealed';
  call: Call | null;
  correct: boolean | null;
  crit: boolean;
  xpEarned: number;
}

export interface DecideResult {
  correct: boolean;
  crit: boolean;
  xpEarned: number;
}

function scoreCall(scenario: Scenario, combo: number, call: Call): RoundState {
  const correct = call === scenario.truth.correctCall;
  const crit = correct && Math.random() < 0.05;
  const xpEarned = xpForCall(correct, combo) * (crit ? 2 : 1);
  return { phase: 'revealed', call, correct, crit, xpEarned };
}

export function useGameRound(scenario: Scenario, combo: number, initialCall: Call | null = null) {
  const [state, setState] = useState<RoundState>(() => (
    initialCall
      ? scoreCall(scenario, combo, initialCall)
      : { phase: 'deciding', call: null, correct: null, crit: false, xpEarned: 0 }
  ));
  const stateRef = useRef<RoundState>(state);

  const decide = useCallback(
    (call: Call): DecideResult | null => {
      if (stateRef.current.phase === 'revealed') return null;
      const next = scoreCall(scenario, combo, call);
      stateRef.current = next;
      setState(next);
      return { correct: next.correct!, crit: next.crit, xpEarned: next.xpEarned };
    },
    [scenario, combo],
  );

  return { ...state, decide };
}
