'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  FileText,
  PencilSimple,
  Robot,
  Warning,
} from '@phosphor-icons/react';
import { caseTitle, routeReasonLabel } from '@/lib/exception-room/presentation';
import type {
  DecisionDetail,
  DecisionInput,
  ExceptionAction,
  ExceptionCase,
} from '@/lib/exception-room/types';

interface CaseReviewProps {
  candidate: ExceptionCase;
  viewedEvidenceIds: readonly string[];
  capacityRemaining: number;
  onViewEvidence: (evidenceId: string) => void;
  onSubmit: (decision: DecisionInput) => void;
}

export function CaseReview({
  candidate,
  viewedEvidenceIds,
  capacityRemaining,
  onViewEvidence,
  onSubmit,
}: CaseReviewProps) {
  const [pendingAction, setPendingAction] = useState<ExceptionAction | null>(null);

  const chooseAction = (action: ExceptionAction) => {
    const details = action === 'correct'
      ? candidate.correctionOptions
      : action === 'escalate'
        ? candidate.escalationOptions
        : undefined;
    if (details?.length) setPendingAction(action);
    else onSubmit({ caseId: candidate.id, action });
  };

  const details: readonly DecisionDetail[] = pendingAction === 'correct'
    ? candidate.correctionOptions ?? []
    : pendingAction === 'escalate'
      ? candidate.escalationOptions ?? []
      : [];

  return (
    <section className="exception-case-panel" aria-labelledby="case-review-title">
      <div className="exception-case-heading">
        <div>
          <span className={`exception-consequence is-${candidate.consequence}`}>{candidate.consequence.toUpperCase()} CONSEQUENCE</span>
          <h2 id="case-review-title">{caseTitle(candidate)}</h2>
        </div>
        <span className="exception-confidence">{candidate.confidenceBand.toUpperCase()} CONF.</span>
      </div>

      <p className="exception-case-summary">{candidate.summary}</p>

      <div className="exception-ai-call">
        <span><Robot size={20} weight="fill" /></span>
        <div><small>AI RECOMMENDATION</small><p>{candidate.recommendation}</p></div>
      </div>

      <div className="exception-evidence-heading">
        <h3>EVIDENCE</h3>
        <span>{viewedEvidenceIds.length}/{candidate.evidence.length} REVIEWED</span>
      </div>
      <div className="exception-evidence-list">
        {candidate.evidence.map((item) => {
          const viewed = viewedEvidenceIds.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              className={`exception-evidence-item is-${item.status} ${viewed ? 'is-viewed' : ''}`}
              onClick={() => onViewEvidence(item.id)}
            >
              <span className="exception-evidence-icon">
                {item.status === 'supports' ? <CheckCircle size={19} weight="fill" /> : item.status === 'conflicts' || item.status === 'missing' ? <Warning size={19} weight="fill" /> : <FileText size={19} weight="fill" />}
              </span>
              <span><b>{item.title}</b><small>{item.summary}</small></span>
              {viewed ? <Check size={17} weight="bold" /> : <span className="exception-review-dot" />}
            </button>
          );
        })}
      </div>

      <div className="exception-reason-line">
        <span>ROUTED FOR</span> {candidate.routeReasons.map(routeReasonLabel).join(' · ')}
      </div>

      {pendingAction ? (
        <DecisionDetailPicker
          action={pendingAction}
          details={details}
          onBack={() => setPendingAction(null)}
          onChoose={(detailId) => onSubmit({ caseId: candidate.id, action: pendingAction, detailId })}
        />
      ) : (
        <div className="exception-decision-area">
          <p className="exception-decision-prompt">YOUR DECISION</p>
          <div className="exception-decision-buttons">
            <DecisionButton
              action="approve"
              cost={candidate.actionCosts.approve}
              icon={<CheckCircle size={22} weight="fill" />}
              disabled={candidate.actionCosts.approve > capacityRemaining}
              onClick={() => chooseAction('approve')}
            />
            <DecisionButton
              action="correct"
              cost={candidate.actionCosts.correct}
              icon={<PencilSimple size={22} weight="fill" />}
              disabled={candidate.actionCosts.correct > capacityRemaining}
              onClick={() => chooseAction('correct')}
            />
            <DecisionButton
              action="escalate"
              cost={candidate.actionCosts.escalate}
              icon={<ArrowUpRight size={22} weight="bold" />}
              disabled={candidate.actionCosts.escalate > capacityRemaining}
              onClick={() => chooseAction('escalate')}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function DecisionButton({
  action,
  cost,
  icon,
  disabled,
  onClick,
}: {
  action: ExceptionAction;
  cost: number;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`exception-decision-button is-${action}`} disabled={disabled} onClick={onClick}>
      {icon}<b>{action.toUpperCase()}</b><small>{cost} CAP</small>
    </button>
  );
}

function DecisionDetailPicker({
  action,
  details,
  onBack,
  onChoose,
}: {
  action: ExceptionAction;
  details: readonly DecisionDetail[];
  onBack: () => void;
  onChoose: (detailId: string) => void;
}) {
  return (
    <div className="exception-detail-picker">
      <div className="exception-detail-heading">
        <button type="button" onClick={onBack}>BACK</button>
        <p>{action === 'correct' ? 'CHOOSE A CORRECTION' : 'CHOOSE A DESTINATION'}</p>
      </div>
      {details.map((detail) => (
        <button type="button" key={detail.id} onClick={() => onChoose(detail.id)}>
          <span><b>{detail.label}</b>{detail.destinationRole && <small>{detail.destinationRole}</small>}</span>
          <ArrowUpRight size={18} weight="bold" />
        </button>
      ))}
    </div>
  );
}
