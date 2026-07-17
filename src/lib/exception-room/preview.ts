import { CAMPAIGN_CASES } from '@/lib/exception-room/content/campaign';
import { endShift, selectCase, startExceptionRun } from '@/lib/exception-room/engine';
import type { ExceptionRunState } from '@/lib/exception-room/types';

export function selectedVisualPreview(seed: number): ExceptionRunState {
  const started = startExceptionRun(seed, 'campaign', CAMPAIGN_CASES);
  const shifted = endShift(started, CAMPAIGN_CASES);
  const shiftTwo = shifted.ok ? shifted.state : started;
  const queuedCaseIds = [
    'missing-approval-evidence',
    'repeated-date-drift-one',
    'boundary-needs-owner',
    'sampled-clean-match',
  ];
  const caseStates = Object.fromEntries(Object.entries(shiftTwo.caseStates).map(([caseId, runtime]) => [
    caseId,
    queuedCaseIds.includes(caseId)
      ? { ...runtime, status: 'queued' as const }
      : runtime.status === 'queued'
        ? { ...runtime, status: 'expired' as const, expirationReason: 'operator-ended' as const }
        : runtime,
  ]));
  const schedule = shiftTwo.schedule.map((timing) => queuedCaseIds.includes(timing.caseId)
    ? { ...timing, dueAtTick: Math.max(timing.dueAtTick, shiftTwo.tick + 1) }
    : timing);
  const staged = { ...shiftTwo, capacityRemaining: 6, queuedCaseIds, caseStates, schedule };
  const selected = selectCase(staged, 'missing-approval-evidence');
  return selected.ok ? selected.state : staged;
}
