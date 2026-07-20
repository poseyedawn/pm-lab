import { endShift, resolveCase, selectCase, startExceptionRun, viewEvidence } from '@/lib/exception-room/engine';
import type {
  EngineResult,
  ExceptionCase,
  ExceptionRunState,
  RunEvent,
  RunMode,
} from '@/lib/exception-room/types';

function inputEvent(
  state: ExceptionRunState,
  event: RunEvent,
  cases: readonly ExceptionCase[],
): EngineResult {
  if (event.type === 'case-opened') return selectCase(state, event.caseId);
  if (event.type === 'evidence-viewed') return viewEvidence(state, event.caseId, event.evidenceId, cases);
  if (event.type === 'shift-ended') return endShift(state, cases);
  if (event.type === 'case-resolved') {
    return resolveCase(state, {
      caseId: event.resolution.caseId,
      action: event.resolution.action,
      ...(event.resolution.detailId ? { detailId: event.resolution.detailId } : {}),
      ...(event.resolution.acceptedEvidenceDeficit ? { acceptEvidenceDeficit: true } : {}),
    }, cases);
  }
  return { ok: true, state };
}

export function replayRun(
  seed: number,
  mode: RunMode,
  history: readonly RunEvent[],
  cases: readonly ExceptionCase[],
): EngineResult {
  let replayed = startExceptionRun(seed, mode, cases);
  for (const event of history) {
    const result = inputEvent(replayed, event, cases);
    if (!result.ok) {
      return {
        ok: false,
        state: replayed,
        error: { code: 'invalid-history', message: result.error.message },
      };
    }
    replayed = result.state;
  }
  if (JSON.stringify(replayed.history) !== JSON.stringify(history)) {
    return {
      ok: false,
      state: replayed,
      error: { code: 'invalid-history', message: 'History does not match deterministic replay output.' },
    };
  }
  return { ok: true, state: replayed };
}
