'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { DoorOpen, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { CapacityHeader } from '@/components/exception-room/CapacityHeader';
import { CaseReview } from '@/components/exception-room/CaseReview';
import { QueueList } from '@/components/exception-room/QueueList';
import { ResolutionReveal } from '@/components/exception-room/ResolutionReveal';
import { ShiftSummary } from '@/components/exception-room/ShiftSummary';
import { useExceptionRun } from '@/hooks/useExceptionRun';
import { trackException } from '@/lib/exception-room/analytics';
import { CAMPAIGN_CASES } from '@/lib/exception-room/content/campaign';
import type { ExceptionRunState, ScoreBreakdown } from '@/lib/exception-room/types';

interface ExceptionRunScreenProps {
  seed: number;
  soundOn: boolean;
  totalXp: number;
  initialState?: ExceptionRunState;
  onComplete: (score: ScoreBreakdown) => void;
  onNewRun: () => void;
}

export function ExceptionRunScreen({
  seed,
  soundOn,
  totalXp,
  initialState,
  onComplete,
  onNewRun,
}: ExceptionRunScreenProps) {
  const game = useExceptionRun({ seed, initialState });
  const completionSent = useRef(false);

  useEffect(() => {
    if (!game.score || completionSent.current) return;
    completionSent.current = true;
    onComplete(game.score);
    trackException({
      name: 'exception_run_completed',
      mode: 'campaign',
      profile: game.score.profile,
      safety: game.score.safety,
      service: game.score.service,
      capacity: game.score.capacity,
    });
  }, [game.score, onComplete]);

  const nextDueIn = useMemo(() => {
    const due = game.queue.map((candidate) => candidate.dueAtTick - game.run.tick);
    return due.length ? Math.min(...due) : null;
  }, [game.queue, game.run.tick]);

  if (game.phase === 'debrief' && game.score) {
    return (
      <section className="exception-shell exception-run-shell">
        <ShiftSummary score={game.score} totalXp={totalXp} onNewRun={onNewRun} />
      </section>
    );
  }

  const revealedCase = game.lastDecision
    ? CAMPAIGN_CASES.find((candidate) => candidate.id === game.lastDecision?.caseId) ?? null
    : null;

  return (
    <section className="exception-shell exception-run-shell">
      <header className="exception-run-header">
        <Link href="/exception-room" className="exception-run-title" aria-label="Back to Exception Room briefing">
          <h1><span>EXCEPTION</span><strong>ROOM</strong></h1>
        </Link>
        <div className="exception-shift-progress">
          <p>SHIFT {game.run.shift} OF 3</p>
          <div role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={game.run.shift}>
            {[1, 2, 3].map((shift) => <i key={shift} className={shift <= game.run.shift ? 'is-complete' : ''} />)}
          </div>
        </div>
        <span className="exception-sound-status" aria-label={`Sound ${soundOn ? 'on' : 'off'}`}>
          {soundOn ? <SpeakerHigh size={18} weight="fill" /> : <SpeakerSlash size={18} weight="fill" />}
        </span>
      </header>

      <CapacityHeader run={game.run} nextDueIn={nextDueIn} />

      <div className="exception-run-scroll">
        {game.phase === 'reveal' && revealedCase && game.lastResolution ? (
          <ResolutionReveal candidate={revealedCase} resolution={game.lastResolution} onContinue={game.continueRun} />
        ) : (
          <>
            <QueueList
              queue={game.queue}
              selectedCaseId={game.run.selectedCaseId}
              onSelect={(caseId) => {
                game.openCase(caseId);
                trackException({ name: 'exception_case_opened', mode: 'campaign', shift: game.run.shift, caseId });
              }}
            />
            {game.selectedCase && (
              <CaseReview
                candidate={game.selectedCase}
                viewedEvidenceIds={game.run.caseStates[game.selectedCase.id]?.evidenceViewedIds ?? []}
                capacityRemaining={game.run.capacityRemaining}
                onViewEvidence={(evidenceId) => {
                  game.inspectEvidence(game.selectedCase?.id ?? '', evidenceId);
                  trackException({ name: 'exception_evidence_viewed', mode: 'campaign', caseId: game.selectedCase?.id ?? '', evidenceId });
                }}
                onSubmit={(decision) => {
                  game.submitDecision(decision);
                  trackException({ name: 'exception_decision_submitted', mode: 'campaign', caseId: decision.caseId, action: decision.action });
                }}
              />
            )}
          </>
        )}
        {game.error && <p className="exception-error" role="alert">{game.error}</p>}
      </div>

      {game.phase === 'review' && (
        <footer className="exception-run-footer">
          <button type="button" onClick={() => {
            trackException({ name: 'exception_shift_ended', mode: 'campaign', shift: game.run.shift, remaining: game.run.capacityRemaining });
            game.finishShift();
          }}>
            <DoorOpen size={17} weight="bold" /> END SHIFT
          </button>
          <span>TICK {game.run.tick}</span>
        </footer>
      )}
    </section>
  );
}
