'use client';

import { useCallback, useMemo, useState } from 'react';
import { CAMPAIGN_CASES } from '@/lib/exception-room/content/campaign';
import {
  availableCases,
  endShift,
  resolveCase,
  selectCase,
  startExceptionRun,
  viewEvidence,
} from '@/lib/exception-room/engine';
import { scoreRun } from '@/lib/exception-room/scoring';
import type {
  DecisionInput,
  ExceptionRunState,
  RunMode,
} from '@/lib/exception-room/types';

export type ExceptionRunPhase = 'review' | 'reveal' | 'debrief';

interface UseExceptionRunOptions {
  seed: number;
  mode?: RunMode;
  initialState?: ExceptionRunState;
}

export function useExceptionRun({ seed, mode = 'campaign', initialState }: UseExceptionRunOptions) {
  const [run, setRun] = useState<ExceptionRunState>(
    () => initialState ?? startExceptionRun(seed, mode, CAMPAIGN_CASES),
  );
  const [phase, setPhase] = useState<ExceptionRunPhase>('review');
  const [lastDecision, setLastDecision] = useState<DecisionInput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queue = useMemo(() => availableCases(run, CAMPAIGN_CASES), [run]);
  const selectedCase = useMemo(
    () => CAMPAIGN_CASES.find((candidate) => candidate.id === run.selectedCaseId) ?? null,
    [run.selectedCaseId],
  );
  const lastResolution = useMemo(
    () => run.resolutions.findLast((resolution) => resolution.caseId === lastDecision?.caseId) ?? null,
    [lastDecision, run.resolutions],
  );
  const score = useMemo(
    () => (run.status === 'complete' ? scoreRun(run, CAMPAIGN_CASES) : null),
    [run],
  );

  const openCase = useCallback((caseId: string) => {
    setRun((current) => {
      const result = selectCase(current, caseId);
      if (!result.ok) setError(result.error.message);
      else setError(null);
      return result.state;
    });
  }, []);

  const inspectEvidence = useCallback((caseId: string, evidenceId: string) => {
    setRun((current) => {
      const result = viewEvidence(current, caseId, evidenceId, CAMPAIGN_CASES);
      if (!result.ok) setError(result.error.message);
      else setError(null);
      return result.state;
    });
  }, []);

  const submitDecision = useCallback((decision: DecisionInput) => {
    setRun((current) => {
      if (phase !== 'review') return current;
      const result = resolveCase(current, decision, CAMPAIGN_CASES);
      if (!result.ok) {
        setError(result.error.message);
        return result.state;
      }
      setError(null);
      setLastDecision(decision);
      setPhase('reveal');
      return result.state;
    });
  }, [phase]);

  const continueRun = useCallback(() => {
    setPhase(run.status === 'complete' ? 'debrief' : 'review');
  }, [run.status]);

  const finishShift = useCallback(() => {
    setRun((current) => {
      const result = endShift(current, CAMPAIGN_CASES);
      if (!result.ok) setError(result.error.message);
      else setError(null);
      if (result.state.status === 'complete') setPhase('debrief');
      return result.state;
    });
  }, []);

  const restart = useCallback((nextSeed = seed) => {
    setRun(startExceptionRun(nextSeed, mode, CAMPAIGN_CASES));
    setPhase('review');
    setLastDecision(null);
    setError(null);
  }, [mode, seed]);

  return {
    run,
    phase,
    queue,
    selectedCase,
    lastDecision,
    lastResolution,
    score,
    error,
    openCase,
    inspectEvidence,
    submitDecision,
    continueRun,
    finishShift,
    restart,
  };
}
