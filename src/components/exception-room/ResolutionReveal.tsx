import { ArrowRight, CheckCircle, WarningCircle, XCircle } from '@phosphor-icons/react';
import { caseTitle } from '@/lib/exception-room/presentation';
import type { CaseResolution, ExceptionCase } from '@/lib/exception-room/types';

interface ResolutionRevealProps {
  candidate: ExceptionCase;
  resolution: CaseResolution;
  onContinue: () => void;
}

export function ResolutionReveal({ candidate, resolution, onContinue }: ResolutionRevealProps) {
  const safe = resolution.outcome === 'preferred' || resolution.outcome === 'acceptable';
  const unnecessary = resolution.outcome === 'unnecessary';
  return (
    <section className={`exception-reveal is-${resolution.outcome}`}>
      <div className="exception-reveal-status">
        {safe ? <CheckCircle size={34} weight="fill" /> : unnecessary ? <WarningCircle size={34} weight="fill" /> : <XCircle size={34} weight="fill" />}
        <div><small>CASE RESOLVED</small><h2>{safe ? 'Sound judgment' : unnecessary ? 'Safe, but costly' : 'Unsafe decision'}</h2></div>
      </div>
      <p className="exception-reveal-case">{caseTitle(candidate)}</p>
      <p>{candidate.rationale}</p>
      <div className="exception-consequence-box">
        <small>WHAT THIS PROTECTED</small>
        <p>{candidate.mishandlingConsequence}</p>
      </div>
      <div className="exception-reveal-meta">
        <span>{resolution.capacityCost} capacity spent</span>
        <span>{resolution.learningDestination === 'none' ? 'No product signal' : `Signal to ${resolution.learningDestination}`}</span>
      </div>
      <button type="button" className="exception-primary-button" onClick={onContinue}>
        CONTINUE <ArrowRight size={20} weight="bold" />
      </button>
    </section>
  );
}
