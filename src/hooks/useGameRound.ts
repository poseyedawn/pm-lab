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

export function useGameRound(scenario: Scenario, combo: number) {
  const initialState: RoundState = {
    phase: 'deciding', call: null, correct: null, crit: false, xpEarned: 0,
  };
  const [state, setState] = useState<RoundState>(initialState);
  const stateRef = useRef<RoundState>(initialState);

  const decide = useCallback(
    (call: Call): DecideResult | null => {
      if (stateRef.current.phase === 'revealed') return null;
      const correct = call === scenario.truth.correctCall;
      const crit = correct && Math.random() < 0.05;
      const xpEarned = xpForCall(correct, combo) * (crit ? 2 : 1);
      const next: RoundState = { phase: 'revealed', call, correct, crit, xpEarned };
      stateRef.current = next;
      setState(next);
      return { correct, crit, xpEarned };
    },
    [scenario, combo],
  );

  return { ...state, decide };
}
