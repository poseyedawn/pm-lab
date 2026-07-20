'use client';

import { useEffect, useRef } from 'react';
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Eye,
  ShieldCheck,
  Speedometer,
  Timer,
} from '@phosphor-icons/react';
import Link from 'next/link';
import { buildDebrief } from '@/lib/exception-room/review';
import { caseTitle } from '@/lib/exception-room/presentation';
import type {
  ExceptionCase,
  ExceptionRunState,
  RunMode,
  ScoreBreakdown,
} from '@/lib/exception-room/types';

interface ShiftSummaryProps {
  score: ScoreBreakdown;
  run: ExceptionRunState;
  cases: readonly ExceptionCase[];
  mode: RunMode;
  totalXp: number;
  onNewRun: () => void;
}

export function ShiftSummary({
  score,
  run,
  cases,
  mode,
  totalXp,
  onNewRun,
}: ShiftSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (mode === 'practice') {
    return (
      <section className="exception-debrief exception-practice-summary">
        <p className="exception-kicker">PRACTICE COMPLETE</p>
        <h1 ref={headingRef} tabIndex={-1}>READY FOR THE QUEUE</h1>
        <p className="exception-debrief-copy">
          You practiced Approve, Correct, and Escalate. Practice is unscored and awards no XP.
        </p>
        <div className="exception-practice-recap">
          {run.resolutions.map((resolution) => {
            const candidate = cases.find((item) => item.id === resolution.caseId);
            if (!candidate) return null;
            return (
              <p key={resolution.caseId}>
                <span>{caseTitle(candidate)}</span>
                <b>{resolution.action.toUpperCase()}</b>
              </p>
            );
          })}
        </div>
        <Link href="/exception-room/play?mode=campaign" className="exception-primary-button">
          START SCORED CAMPAIGN <ArrowRight size={20} weight="bold" />
        </Link>
        <Link href="/exception-room" className="exception-secondary-button">
          <ArrowLeft size={18} weight="bold" /> BACK TO BRIEFING
        </Link>
      </section>
    );
  }

  const debrief = buildDebrief(run, cases);
  return (
    <section className="exception-debrief">
      <p className="exception-kicker">CAMPAIGN COMPLETE</p>
      <h1 ref={headingRef} tabIndex={-1}>{score.profile.toUpperCase()}</h1>
      <p className="exception-debrief-copy">Your operating profile reflects how you balanced accountable review, safety, service, and finite capacity.</p>
      <div className="exception-score-grid">
        <Score label="Safety" value={score.safety} icon={<ShieldCheck size={22} weight="fill" />} />
        <Score label="Service" value={score.service} icon={<Timer size={22} weight="fill" />} />
        <Score label="Capacity" value={score.capacity} icon={<Speedometer size={22} weight="fill" />} />
        <Score label="Evidence" value={score.evidenceQuality} icon={<Eye size={22} weight="fill" />} />
      </div>

      <section className="exception-debrief-guidance" aria-labelledby="debrief-guidance-title">
        <h2 id="debrief-guidance-title">WHAT YOUR RUN SHOWED</h2>
        <p>{debrief.strengths[0]}</p>
        <p>{debrief.strengths[1]}</p>
        <p><b>Next pass:</b> {debrief.improvement}</p>
        {debrief.repeatedSignal && <p>{debrief.repeatedSignal}</p>}
      </section>

      <div className="exception-debrief-details">
        <p><span>Safe completions</span><b>{score.safeCompletions}</b></p>
        <p><span>Service breaches</span><b>{score.serviceBreaches}</b></p>
        <p><span>Complete evidence reviews</span><b>{score.evidenceCompleteCases}/{run.resolutions.length}</b></p>
        <p><span>Evidence-deficit decisions</span><b>{score.evidenceDeficitDecisions}</b></p>
        <p><span>Lab XP</span><b>{totalXp}</b></p>
      </div>

      <p className={`exception-profile-rule ${score.evidenceDeficitDecisions > 0 ? 'has-deficit' : ''}`}>
        {score.evidenceDeficitDecisions > 0
          ? 'Evidence deficits lowered Safety and prevented the strongest operator profile.'
          : 'Every resolved case met its required evidence threshold.'}
      </p>

      <section className="exception-decision-trace" aria-labelledby="decision-trace-title">
        <div className="exception-section-heading">
          <h2 id="decision-trace-title">DECISION TRACE</h2>
          <span>{run.resolutions.length} RESOLVED</span>
        </div>
        <div>
          {run.resolutions.map((resolution) => {
            const candidate = cases.find((item) => item.id === resolution.caseId);
            if (!candidate) return null;
            const reviewed = resolution.requiredEvidenceIds.length
              - resolution.missingRequiredEvidenceIds.length;
            return (
              <article key={resolution.caseId} className={`is-${resolution.outcome}`}>
                <p><b>{caseTitle(candidate)}</b><span>{resolution.action.toUpperCase()}</span></p>
                <small>
                  {resolution.outcome.toUpperCase()} · {reviewed}/{resolution.requiredEvidenceIds.length} REQUIRED EVIDENCE · TICK {resolution.resolvedAtTick}
                </small>
              </article>
            );
          })}
        </div>
      </section>

      <button type="button" className="exception-primary-button" onClick={onNewRun}>
        <ArrowClockwise size={20} weight="bold" /> RUN A NEW QUEUE
      </button>
      <Link href="/exception-room" className="exception-secondary-button">
        <ArrowLeft size={18} weight="bold" /> BACK TO BRIEFING
      </Link>
    </section>
  );
}

function Score({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div>{icon}<b>{value}</b><small>{label.toUpperCase()}</small></div>;
}
