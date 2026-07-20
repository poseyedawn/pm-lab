'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  FileText,
  PencilSimple,
  Robot,
  Warning,
} from '@phosphor-icons/react';
import { caseTitle, dueLabel, routeReasonLabel } from '@/lib/exception-room/presentation';
import type {
  DecisionDetail,
  DecisionInput,
  ExceptionAction,
  RunMode,
  ScheduledExceptionCase,
} from '@/lib/exception-room/types';

interface CaseReviewProps {
  candidate: ScheduledExceptionCase;
  viewedEvidenceIds: readonly string[];
  capacityRemaining: number;
  tick: number;
  mode: RunMode;
  onViewEvidence: (evidenceId: string) => void;
  onSubmit: (decision: DecisionInput) => boolean;
}

export function CaseReview({
  candidate,
  viewedEvidenceIds,
  capacityRemaining,
  tick,
  mode,
  onViewEvidence,
  onSubmit,
}: CaseReviewProps) {
  const [pendingAction, setPendingAction] = useState<ExceptionAction | null>(null);
  const [pendingDecision, setPendingDecision] = useState<DecisionInput | null>(null);
  const pickerHeadingRef = useRef<HTMLParagraphElement>(null);
  const deficitHeadingRef = useRef<HTMLHeadingElement>(null);
  const deficitPanelRef = useRef<HTMLDivElement>(null);
  const actionButtonRefs = useRef<Partial<Record<ExceptionAction, HTMLButtonElement | null>>>({});
  const evidenceButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (pendingAction) pickerHeadingRef.current?.focus();
  }, [pendingAction]);

  useEffect(() => {
    if (!pendingDecision) return;
    deficitPanelRef.current?.scrollIntoView?.({ block: 'center' });
    deficitHeadingRef.current?.focus({ preventScroll: true });
  }, [pendingDecision]);

  const missingRequiredEvidenceIds = candidate.requiredEvidenceIds.filter(
    (evidenceId) => !viewedEvidenceIds.includes(evidenceId),
  );

  const submitOrConfirm = (decision: DecisionInput) => {
    if (missingRequiredEvidenceIds.length > 0) {
      setPendingDecision(decision);
      return;
    }
    onSubmit(decision);
  };

  const chooseAction = (action: ExceptionAction) => {
    const details = action === 'correct'
      ? candidate.correctionOptions
      : action === 'escalate'
        ? candidate.escalationOptions
        : undefined;
    if (details?.length) setPendingAction(action);
    else submitOrConfirm({ caseId: candidate.id, action });
  };

  const details: readonly DecisionDetail[] = pendingAction === 'correct'
    ? candidate.correctionOptions ?? []
    : pendingAction === 'escalate'
      ? candidate.escalationOptions ?? []
      : [];

  const handlePickerBack = () => {
    const previousAction = pendingAction;
    setPendingAction(null);
    window.requestAnimationFrame(() => {
      if (previousAction) actionButtonRefs.current[previousAction]?.focus();
    });
  };

  const handleReviewEvidence = () => {
    const firstMissingId = missingRequiredEvidenceIds[0];
    setPendingDecision(null);
    window.requestAnimationFrame(() => evidenceButtonRefs.current[firstMissingId]?.focus());
  };

  const handleProceedWithoutEvidence = () => {
    if (!pendingDecision) return;
    onSubmit({ ...pendingDecision, acceptEvidenceDeficit: true });
  };

  const practiceAction = mode === 'practice' ? candidate.preferredAction : null;

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
      <p className="exception-case-due">{dueLabel(candidate.dueAtTick, tick)}</p>

      {practiceAction && (
        <div className="exception-practice-guide">
          <small>PRACTICE STEP</small>
          <p>Review the required evidence, then choose {practiceAction.toUpperCase()}.</p>
        </div>
      )}

      <div className="exception-ai-call">
        <span><Robot size={20} weight="fill" /></span>
        <div><small>AI RECOMMENDATION</small><p>{candidate.recommendation}</p></div>
      </div>

      <div className="exception-evidence-heading">
        <h3>REQUIRED EVIDENCE</h3>
        <span>{candidate.requiredEvidenceIds.length - missingRequiredEvidenceIds.length}/{candidate.requiredEvidenceIds.length} REQUIRED REVIEWED</span>
      </div>
      <div className="exception-evidence-list">
        {candidate.evidence.map((item) => {
          const viewed = viewedEvidenceIds.includes(item.id);
          const required = candidate.requiredEvidenceIds.includes(item.id);
          return (
            <button
              type="button"
              key={item.id}
              ref={(element) => { evidenceButtonRefs.current[item.id] = element; }}
              className={`exception-evidence-item is-${item.status} ${viewed ? 'is-viewed' : ''}`}
              onClick={() => onViewEvidence(item.id)}
              aria-pressed={viewed}
              aria-label={`${item.title}. ${required ? 'Required evidence.' : 'Supporting context.'} ${item.summary}`}
            >
              <span className="exception-evidence-icon">
                {item.status === 'supports' ? <CheckCircle size={19} weight="fill" /> : item.status === 'conflicts' || item.status === 'missing' ? <Warning size={19} weight="fill" /> : <FileText size={19} weight="fill" />}
              </span>
              <span>
                <span className="exception-evidence-title"><b>{item.title}</b>{required && <em>REQUIRED</em>}</span>
                <small>{item.summary}</small>
              </span>
              {viewed ? <Check size={17} weight="bold" /> : <span className="exception-review-dot" />}
            </button>
          );
        })}
      </div>

      <div className="exception-reason-line">
        <span>ROUTED FOR</span> {candidate.routeReasons.map(routeReasonLabel).join(' · ')}
      </div>

      {pendingDecision ? (
        <div ref={deficitPanelRef} className="exception-evidence-confirm" role="alertdialog" aria-labelledby="evidence-confirm-title" aria-describedby="evidence-confirm-copy">
          <Warning size={26} weight="fill" />
          <h3 id="evidence-confirm-title" ref={deficitHeadingRef} tabIndex={-1}>EVIDENCE REVIEW INCOMPLETE</h3>
          <p id="evidence-confirm-copy">
            {missingRequiredEvidenceIds.length} required {missingRequiredEvidenceIds.length === 1 ? 'item is' : 'items are'} still unread. Continuing records an evidence deficit and lowers Safety and Evidence quality.
          </p>
          <button type="button" className="exception-confirm-primary" onClick={handleReviewEvidence}>REVIEW EVIDENCE</button>
          <button type="button" className="exception-confirm-risk" onClick={handleProceedWithoutEvidence}>
            DECIDE WITHOUT {missingRequiredEvidenceIds.length === 1 ? 'IT' : 'THEM'}
          </button>
        </div>
      ) : pendingAction ? (
        <DecisionDetailPicker
          action={pendingAction}
          details={details}
          headingRef={pickerHeadingRef}
          onBack={handlePickerBack}
          onChoose={(detailId) => submitOrConfirm({ caseId: candidate.id, action: pendingAction, detailId })}
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
              buttonRef={(element) => { actionButtonRefs.current.approve = element; }}
              onClick={() => chooseAction('approve')}
            />
            <DecisionButton
              action="correct"
              cost={candidate.actionCosts.correct}
              icon={<PencilSimple size={22} weight="fill" />}
              disabled={candidate.actionCosts.correct > capacityRemaining}
              buttonRef={(element) => { actionButtonRefs.current.correct = element; }}
              onClick={() => chooseAction('correct')}
            />
            <DecisionButton
              action="escalate"
              cost={candidate.actionCosts.escalate}
              icon={<ArrowUpRight size={22} weight="bold" />}
              disabled={candidate.actionCosts.escalate > capacityRemaining}
              buttonRef={(element) => { actionButtonRefs.current.escalate = element; }}
              onClick={() => chooseAction('escalate')}
            />
          </div>
          <p id="exception-capacity-help" className="exception-capacity-help">Approve uses 1 capacity. Correct uses 2. Escalate uses 3.</p>
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
  buttonRef,
  onClick,
}: {
  action: ExceptionAction;
  cost: number;
  icon: React.ReactNode;
  disabled: boolean;
  buttonRef: (element: HTMLButtonElement | null) => void;
  onClick: () => void;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`exception-decision-button is-${action}`}
      disabled={disabled}
      aria-describedby={disabled ? 'exception-capacity-help' : undefined}
      onClick={onClick}
    >
      {icon}<b>{action.toUpperCase()}</b><small>{cost} CAP</small>
    </button>
  );
}

function DecisionDetailPicker({
  action,
  details,
  headingRef,
  onBack,
  onChoose,
}: {
  action: ExceptionAction;
  details: readonly DecisionDetail[];
  headingRef: React.RefObject<HTMLParagraphElement | null>;
  onBack: () => void;
  onChoose: (detailId: string) => void;
}) {
  return (
    <div className="exception-detail-picker">
      <div className="exception-detail-heading">
        <button type="button" onClick={onBack}>BACK</button>
        <p ref={headingRef} tabIndex={-1}>{action === 'correct' ? 'CHOOSE A CORRECTION' : 'CHOOSE A DESTINATION'}</p>
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
