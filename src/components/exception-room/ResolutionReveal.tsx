'use client';

import { useEffect, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Scales,
  WarningCircle,
  XCircle,
} from '@phosphor-icons/react';
import { caseTitle } from '@/lib/exception-room/presentation';
import type { CaseResolution, ExceptionCase } from '@/lib/exception-room/types';

interface ResolutionRevealProps {
  candidate: ExceptionCase;
  resolution: CaseResolution;
  onContinue: () => void;
}

const OUTCOME_COPY = {
  preferred: { label: 'PREFERRED DECISION', title: 'Best supported call' },
  acceptable: { label: 'ACCEPTABLE DECISION', title: 'Defensible tradeoff' },
  unnecessary: { label: 'UNNECESSARY DECISION', title: 'Safe, but costly' },
  unsafe: { label: 'UNSAFE DECISION', title: 'Unsafe decision' },
} as const;

export function ResolutionReveal({ candidate, resolution, onContinue }: ResolutionRevealProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const copy = resolution.acceptedEvidenceDeficit
    ? { label: 'EVIDENCE DEFICIT RECORDED', title: 'Unverified decision' }
    : OUTCOME_COPY[resolution.outcome];

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const icon = resolution.acceptedEvidenceDeficit || resolution.outcome === 'unnecessary'
    ? <WarningCircle size={34} weight="fill" />
    : resolution.outcome === 'unsafe'
      ? <XCircle size={34} weight="fill" />
      : resolution.outcome === 'acceptable'
        ? <Scales size={34} weight="fill" />
        : <CheckCircle size={34} weight="fill" />;
  const reviewedRequired = resolution.requiredEvidenceIds.length
    - resolution.missingRequiredEvidenceIds.length;

  return (
    <section
      className={`exception-reveal is-${resolution.outcome} ${resolution.acceptedEvidenceDeficit ? 'has-evidence-deficit' : ''}`}
      aria-labelledby="exception-resolution-title"
    >
      <div className="exception-reveal-status">
        {icon}
        <div>
          <small>{copy.label}</small>
          <h2 id="exception-resolution-title" ref={headingRef} tabIndex={-1}>{copy.title}</h2>
        </div>
      </div>
      <p className="exception-reveal-case">{caseTitle(candidate)}</p>
      <p>{candidate.rationale}</p>
      {resolution.outcome === 'acceptable' && !resolution.acceptedEvidenceDeficit && (
        <p className="exception-outcome-note">This choice is safe, but the preferred action reaches the same protection with a stronger capacity tradeoff.</p>
      )}
      {resolution.acceptedEvidenceDeficit && (
        <div className="exception-evidence-deficit-note">
          <small>REVIEW QUALITY</small>
          <p>
            You reviewed {reviewedRequired} of {resolution.requiredEvidenceIds.length} required items. The action outcome is recorded, but it cannot count as fully supported judgment.
          </p>
        </div>
      )}
      <div className="exception-consequence-box">
        <small>WHAT THIS DECISION AFFECTED</small>
        <p>{candidate.mishandlingConsequence}</p>
      </div>
      <div className="exception-reveal-meta">
        <span>{resolution.capacityCost} capacity spent</span>
        <span>{reviewedRequired}/{resolution.requiredEvidenceIds.length} required evidence</span>
        <span>{resolution.learningDestination === 'none' ? 'No product signal' : `Signal to ${resolution.learningDestination}`}</span>
      </div>
      <button type="button" className="exception-primary-button" onClick={onContinue}>
        CONTINUE <ArrowRight size={20} weight="bold" />
      </button>
    </section>
  );
}
