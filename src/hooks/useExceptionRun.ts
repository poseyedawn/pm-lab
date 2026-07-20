'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { CAMPAIGN_CASES } from '@/lib/exception-room/content/campaign';
import { PRACTICE_CASES } from '@/lib/exception-room/content/practice';
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
  ExceptionRunPhase,
  ExceptionRunState,
  RunMode,
} from '@/lib/exception-room/types';

interface UseExceptionRunOptions {
  seed: number;
  mode?: RunMode;
  initialState?: ExceptionRunState;
  initialPhase?: ExceptionRunPhase;
  initialDecision?: DecisionInput | null;
}

export function useExceptionRun({
  seed,
  mode = 'campaign',
  initialState,
  initialPhase = 'review',
  initialDecision = null,
}: UseExceptionRunOptions) {
  const cases = mode === 'practice' ? PRACTICE_CASES : CAMPAIGN_CASES;
  const startingRun = initialState ?? startExceptionRun(seed, mode, cases);
  const [run, setRun] = useState<ExceptionRunState>(
    startingRun,
  );
  const [phase, setPhase] = useState<ExceptionRunPhase>(initialPhase);
  const [lastDecision, setLastDecision] = useState<DecisionInput | null>(initialDecision);
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(startingRun);
  const phaseRef = useRef<ExceptionRunPhase>(initialPhase);
  const decisionLocked = useRef(initialPhase !== 'review');

  const queue = useMemo(() => availableCases(run, cases), [cases, run]);
  const selectedCase = useMemo(
    () => queue.find((candidate) => candidate.id === run.selectedCaseId) ?? null,
    [queue, run.selectedCaseId],
  );
  const lastResolution = useMemo(
    () => run.resolutions.findLast((resolution) => resolution.caseId === lastDecision?.caseId) ?? null,
    [lastDecision, run.resolutions],
  );
  const score = useMemo(
    () => (run.status === 'complete' ? scoreRun(run, cases) : null),
    [cases, run],
  );

  const openCase = useCallback((caseId: string) => {
    if (phaseRef.current !== 'review') return false;
    const result = selectCase(runRef.current, caseId);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    runRef.current = result.state;
    setRun(result.state);
    setError(null);
    return true;
  }, []);

  const inspectEvidence = useCallback((caseId: string, evidenceId: string) => {
    if (phaseRef.current !== 'review') return false;
    const result = viewEvidence(runRef.current, caseId, evidenceId, cases);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    runRef.current = result.state;
    setRun(result.state);
    setError(null);
    return true;
  }, [cases]);

  const submitDecision = useCallback((decision: DecisionInput) => {
    if (phaseRef.current !== 'review' || decisionLocked.current) return false;
    decisionLocked.current = true;
    const result = resolveCase(runRef.current, decision, cases);
    if (!result.ok) {
      decisionLocked.current = false;
      setError(result.error.message);
      return false;
    }
    runRef.current = result.state;
    phaseRef.current = 'reveal';
    setRun(result.state);
    setError(null);
    setLastDecision(decision);
    setPhase('reveal');
    return true;
  }, [cases]);

  const continueRun = useCallback(() => {
    const nextPhase = runRef.current.status === 'complete' ? 'debrief' : 'review';
    phaseRef.current = nextPhase;
    decisionLocked.current = nextPhase !== 'review';
    setPhase(nextPhase);
  }, []);

  const finishShift = useCallback(() => {
    if (phaseRef.current !== 'review') return false;
    const result = endShift(runRef.current, cases);
    if (!result.ok) {
      setError(result.error.message);
      return false;
    }
    runRef.current = result.state;
    setRun(result.state);
    setError(null);
    if (result.state.status === 'complete') {
      phaseRef.current = 'debrief';
      decisionLocked.current = true;
      setPhase('debrief');
    }
    return true;
  }, [cases]);

  const restart = useCallback((nextSeed = seed) => {
    const nextRun = startExceptionRun(nextSeed, mode, cases);
    runRef.current = nextRun;
    phaseRef.current = 'review';
    decisionLocked.current = false;
    setRun(nextRun);
    setPhase('review');
    setLastDecision(null);
    setError(null);
  }, [cases, mode, seed]);

  return {
    run,
    phase,
    queue,
    selectedCase,
    lastDecision,
    lastResolution,
    score,
    error,
    cases,
    openCase,
    inspectEvidence,
    submitDecision,
    continueRun,
    finishShift,
    restart,
  };
}
