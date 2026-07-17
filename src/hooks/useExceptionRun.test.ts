import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useExceptionRun } from '@/hooks/useExceptionRun';
import { selectedVisualPreview } from '@/lib/exception-room/preview';

describe('useExceptionRun', () => {
  it('starts with the deterministic campaign queue', () => {
    const { result } = renderHook(() => useExceptionRun({ seed: 42 }));
    expect(result.current.run.status).toBe('active');
    expect(result.current.run.shift).toBe(1);
    expect(result.current.queue).toHaveLength(3);
  });

  it('opens a case, records evidence, and reveals the submitted decision', () => {
    const initialState = selectedVisualPreview(42);
    const { result } = renderHook(() => useExceptionRun({ seed: 42, initialState }));
    expect(result.current.selectedCase?.id).toBe('missing-approval-evidence');

    act(() => result.current.inspectEvidence('missing-approval-evidence', 'approval-record'));
    expect(result.current.run.caseStates['missing-approval-evidence'].evidenceViewedIds)
      .toContain('approval-record');

    act(() => result.current.submitDecision({
      caseId: 'missing-approval-evidence',
      action: 'escalate',
      detailId: 'approval-owner',
    }));
    expect(result.current.phase).toBe('reveal');
    expect(result.current.lastResolution).toMatchObject({
      action: 'escalate',
      outcome: 'preferred',
      capacityCost: 3,
    });
  });

  it('advances from the reveal to the next review state', () => {
    const { result } = renderHook(() => useExceptionRun({
      seed: 42,
      initialState: selectedVisualPreview(42),
    }));
    act(() => result.current.submitDecision({
      caseId: 'missing-approval-evidence',
      action: 'escalate',
      detailId: 'approval-owner',
    }));
    act(() => result.current.continueRun());
    expect(result.current.phase).toBe('review');
    expect(result.current.run.resolutions).toHaveLength(1);
  });
});
