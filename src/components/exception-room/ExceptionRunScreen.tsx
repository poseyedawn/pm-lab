'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DoorOpen } from '@phosphor-icons/react';
import { CapacityHeader } from '@/components/exception-room/CapacityHeader';
import { CaseReview } from '@/components/exception-room/CaseReview';
import { EndShiftConfirmation } from '@/components/exception-room/EndShiftConfirmation';
import { QueueList } from '@/components/exception-room/QueueList';
import { ResolutionReveal } from '@/components/exception-room/ResolutionReveal';
import { ShiftSummary } from '@/components/exception-room/ShiftSummary';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { useExceptionRun } from '@/hooks/useExceptionRun';
import { trackException } from '@/lib/exception-room/analytics';
import { nextDueSummary, shiftEndForecast } from '@/lib/exception-room/presentation';
import {
  clearActiveExceptionRun,
  saveActiveExceptionRun,
  type ActiveExceptionMode,
} from '@/lib/exception-room/state';
import type {
  DecisionInput,
  ExceptionRunPhase,
  ExceptionRunState,
  ScoreBreakdown,
} from '@/lib/exception-room/types';

interface ExceptionRunScreenProps {
  seed: number;
  mode: ActiveExceptionMode;
  totalXp: number;
  initialState?: ExceptionRunState;
  initialPhase?: ExceptionRunPhase;
  initialDecision?: DecisionInput | null;
  persistState?: boolean;
  onComplete: (score: ScoreBreakdown, mode: ActiveExceptionMode) => void;
  onNewRun: () => void;
}

export function ExceptionRunScreen({
  seed,
  mode,
  totalXp,
  initialState,
  initialPhase,
  initialDecision,
  persistState = true,
  onComplete,
  onNewRun,
}: ExceptionRunScreenProps) {
  const game = useExceptionRun({ seed, mode, initialState, initialPhase, initialDecision });
  const { preferences } = usePreferences();
  const completionSent = useRef(false);
  const pendingFeedbackCaseId = useRef<string | null>(null);
  const [showShiftConfirmation, setShowShiftConfirmation] = useState(false);
  const [queueFocusSignal, setQueueFocusSignal] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (!persistState) return;
    if (game.phase === 'debrief') {
      clearActiveExceptionRun();
      return;
    }
    saveActiveExceptionRun({
      seed,
      mode,
      run: game.run,
      phase: game.phase,
      lastDecision: game.lastDecision,
    });
  }, [game.lastDecision, game.phase, game.run, mode, persistState, seed]);

  useEffect(() => {
    if (!game.score || completionSent.current) return;
    completionSent.current = true;
    onComplete(game.score, mode);
    trackException({
      name: 'exception_run_completed',
      mode,
      profile: game.score.profile,
      safety: game.score.safety,
      service: game.score.service,
      capacity: game.score.capacity,
    });
  }, [game.score, mode, onComplete]);

  useEffect(() => {
    const resolution = game.lastResolution;
    if (!resolution || game.phase !== 'reveal') return;
    if (pendingFeedbackCaseId.current !== resolution.caseId) return;
    pendingFeedbackCaseId.current = null;
    const safe = resolution.outcome === 'preferred' || resolution.outcome === 'acceptable';
    if (safe && !resolution.acceptedEvidenceDeficit) {
      sfx.win(preferences.sound);
      vibrate(30, preferences.haptics);
    } else {
      sfx.lose(preferences.sound);
      vibrate([60, 40, 60], preferences.haptics);
    }
  }, [game.lastResolution, game.phase, preferences.haptics, preferences.sound]);

  const dueSummary = useMemo(
    () => nextDueSummary(game.queue, game.run.tick),
    [game.queue, game.run.tick],
  );
  const endForecast = useMemo(
    () => shiftEndForecast(game.run, game.cases),
    [game.cases, game.run],
  );

  if (game.phase === 'debrief' && game.score) {
    return (
      <section className="exception-shell exception-run-shell">
        <ShiftSummary
          score={game.score}
          run={game.run}
          cases={game.cases}
          mode={mode}
          totalXp={totalXp}
          onNewRun={onNewRun}
        />
      </section>
    );
  }

  const revealedCase = game.lastDecision
    ? game.cases.find((candidate) => candidate.id === game.lastDecision?.caseId) ?? null
    : null;

  const handleOpenCase = (caseId: string) => {
    if (!game.openCase(caseId)) return;
    sfx.click(preferences.sound);
    setAnnouncement('Case opened. Review the case summary, AI recommendation, and required evidence.');
    trackException({ name: 'exception_case_opened', mode, shift: game.run.shift, caseId });
  };

  const handleEvidence = (caseId: string, evidenceId: string) => {
    if (!game.inspectEvidence(caseId, evidenceId)) return;
    sfx.click(preferences.sound);
    setAnnouncement('Evidence reviewed.');
    trackException({ name: 'exception_evidence_viewed', mode, caseId, evidenceId });
  };

  const handleDecision = (decision: DecisionInput): boolean => {
    pendingFeedbackCaseId.current = decision.caseId;
    const accepted = game.submitDecision(decision);
    if (!accepted) {
      pendingFeedbackCaseId.current = null;
      return false;
    }
    setAnnouncement('Case resolved. Review the outcome and evidence receipt.');
    trackException({ name: 'exception_decision_submitted', mode, caseId: decision.caseId, action: decision.action });
    return true;
  };

  const handleContinue = () => {
    sfx.click(preferences.sound);
    const completed = game.run.status === 'complete';
    game.continueRun();
    if (!completed) {
      setQueueFocusSignal((current) => current + 1);
      setAnnouncement(`${game.queue.length} cases are open. Review capacity is ${game.run.capacityRemaining}.`);
    }
  };

  const handleConfirmShiftEnd = () => {
    setShowShiftConfirmation(false);
    trackException({
      name: 'exception_shift_ended',
      mode,
      shift: game.run.shift,
      remaining: game.run.capacityRemaining,
    });
    if (game.finishShift()) {
      sfx.click(preferences.sound);
      setAnnouncement(`Shift ended. ${endForecast.expires} cases expired and ${endForecast.carries} carried forward.`);
      setQueueFocusSignal((current) => current + 1);
    }
  };

  return (
    <section className="exception-shell exception-run-shell">
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
      <CapacityHeader run={game.run} dueSummary={dueSummary} />

      <div className="exception-run-scroll">
        {game.phase === 'reveal' && revealedCase && game.lastResolution ? (
          <ResolutionReveal
            candidate={revealedCase}
            resolution={game.lastResolution}
            onContinue={handleContinue}
          />
        ) : (
          <>
            <QueueList
              queue={game.queue}
              selectedCaseId={game.run.selectedCaseId}
              tick={game.run.tick}
              focusFirstSignal={queueFocusSignal}
              onSelect={handleOpenCase}
            />
            {game.selectedCase && (
              <CaseReview
                key={game.selectedCase.id}
                candidate={game.selectedCase}
                viewedEvidenceIds={game.run.caseStates[game.selectedCase.id]?.evidenceViewedIds ?? []}
                capacityRemaining={game.run.capacityRemaining}
                tick={game.run.tick}
                mode={mode}
                onViewEvidence={(evidenceId) => handleEvidence(game.selectedCase?.id ?? '', evidenceId)}
                onSubmit={handleDecision}
              />
            )}
          </>
        )}
        {game.error && <p className="exception-error" role="alert">{game.error}</p>}
      </div>

      {game.phase === 'review' && (
        <footer className="exception-run-footer">
          {mode === 'campaign' ? (
            <button type="button" onClick={() => setShowShiftConfirmation(true)}>
              <DoorOpen size={17} weight="bold" /> END SHIFT
            </button>
          ) : <span>PRACTICE IS UNSCORED</span>}
          <span>TICK {game.run.tick}</span>
        </footer>
      )}

      {showShiftConfirmation && (
        <EndShiftConfirmation
          shift={game.run.shift}
          forecast={endForecast}
          onCancel={() => setShowShiftConfirmation(false)}
          onConfirm={handleConfirmShiftEnd}
        />
      )}
    </section>
  );
}
