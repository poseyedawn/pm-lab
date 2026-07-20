import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseReview } from '@/components/exception-room/CaseReview';
import { ResolutionReveal } from '@/components/exception-room/ResolutionReveal';
import { ShiftSummary } from '@/components/exception-room/ShiftSummary';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { scoreRun } from '@/lib/exception-room/scoring';
import { runPolicy } from '@/lib/exception-room/simulation';
import type { CaseResolution, ScheduledExceptionCase } from '@/lib/exception-room/types';

afterEach(cleanup);

function scheduled(caseId: string): ScheduledExceptionCase {
  const candidate = CAMPAIGN_CASES.find((item) => item.id === caseId);
  if (!candidate) throw new Error(`Missing fixture case ${caseId}`);
  return { ...candidate, arrivesAtTick: 0, dueAtTick: 2 };
}

describe('CaseReview', () => {
  it('requires explicit confirmation before a decision with unread required evidence', () => {
    const onSubmit = vi.fn(() => true);
    render(
      <CaseReview
        candidate={scheduled('unfamiliar-clean-layout')}
        viewedEvidenceIds={[]}
        capacityRemaining={8}
        tick={0}
        mode="campaign"
        onViewEvidence={() => {}}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /APPROVE/i }));
    expect(screen.getByRole('alertdialog', { name: /evidence review incomplete/i })).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /DECIDE WITHOUT THEM/i }));
    expect(onSubmit).toHaveBeenCalledWith({
      caseId: 'unfamiliar-clean-layout',
      action: 'approve',
      acceptEvidenceDeficit: true,
    });
  });

  it('submits directly after every required evidence item is reviewed', () => {
    const candidate = scheduled('unfamiliar-clean-layout');
    const onSubmit = vi.fn(() => true);
    render(
      <CaseReview
        candidate={candidate}
        viewedEvidenceIds={candidate.requiredEvidenceIds}
        capacityRemaining={8}
        tick={0}
        mode="campaign"
        onViewEvidence={() => {}}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /APPROVE/i }));
    expect(onSubmit).toHaveBeenCalledWith({ caseId: candidate.id, action: 'approve' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('moves keyboard focus into the correction picker', async () => {
    render(
      <CaseReview
        candidate={scheduled('effective-date-conflict')}
        viewedEvidenceIds={[]}
        capacityRemaining={8}
        tick={0}
        mode="campaign"
        onViewEvidence={() => {}}
        onSubmit={() => true}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /CORRECT/i }));
    await waitFor(() => expect(screen.getByText('CHOOSE A CORRECTION')).toHaveFocus());
  });
});

describe('ResolutionReveal', () => {
  const candidate = scheduled('effective-date-conflict');
  const baseResolution: CaseResolution = {
    caseId: candidate.id,
    action: 'correct',
    detailId: 'use-current-date',
    evidenceViewedIds: candidate.requiredEvidenceIds,
    requiredEvidenceIds: candidate.requiredEvidenceIds,
    missingRequiredEvidenceIds: [],
    acceptedEvidenceDeficit: false,
    resolvedAtTick: 0,
    capacityCost: 2,
    outcome: 'preferred',
    learningDestination: candidate.learningDestination,
  };

  it('gives preferred and acceptable decisions distinct teaching signals', () => {
    const { rerender } = render(
      <ResolutionReveal candidate={candidate} resolution={baseResolution} onContinue={() => {}} />,
    );
    expect(screen.getByRole('heading', { name: 'Best supported call' })).toBeInTheDocument();
    expect(screen.getByText('PREFERRED DECISION')).toBeInTheDocument();

    rerender(
      <ResolutionReveal
        candidate={candidate}
        resolution={{ ...baseResolution, action: 'escalate', outcome: 'acceptable', capacityCost: 3 }}
        onContinue={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Defensible tradeoff' })).toBeInTheDocument();
    expect(screen.getByText('ACCEPTABLE DECISION')).toBeInTheDocument();
  });

  it('makes an accepted evidence deficit visible in the result', () => {
    render(
      <ResolutionReveal
        candidate={candidate}
        resolution={{
          ...baseResolution,
          evidenceViewedIds: [],
          missingRequiredEvidenceIds: candidate.requiredEvidenceIds,
          acceptedEvidenceDeficit: true,
        }}
        onContinue={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Unverified decision' })).toBeInTheDocument();
    expect(screen.getByText('EVIDENCE DEFICIT RECORDED')).toBeInTheDocument();
  });
});

describe('ShiftSummary', () => {
  it('shows evidence impact and an inspectable decision trace', () => {
    const run = runPolicy(12, 'preferred');
    const score = scoreRun(run, CAMPAIGN_CASES);
    render(
      <ShiftSummary
        score={score}
        run={run}
        cases={CAMPAIGN_CASES}
        mode="campaign"
        totalXp={200}
        onNewRun={() => {}}
      />,
    );
    expect(screen.getByRole('heading', { name: 'BALANCED OPERATOR' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'DECISION TRACE' })).toBeInTheDocument();
    expect(screen.getByText('Every resolved case met its required evidence threshold.')).toBeInTheDocument();
    expect(screen.getByText('12 RESOLVED')).toBeInTheDocument();
  });
});
