import { scoreRun } from '@/lib/exception-room/scoring';
import type { ExceptionCase, ExceptionRunState } from '@/lib/exception-room/types';

export interface DebriefCopy {
  strengths: readonly [string, string];
  improvement: string;
  repeatedSignal: string | null;
}

const readableArchetype = (value: string): string => value.replaceAll('-', ' ');

export function buildDebrief(
  state: ExceptionRunState,
  cases: readonly ExceptionCase[],
): DebriefCopy {
  const score = scoreRun(state, cases);
  const strengths: string[] = [];

  if (score.safety >= 80 && score.unsafeApprovals === 0) {
    strengths.push('You avoided harmful approvals across the queue.');
  }
  if (score.service >= 80) strengths.push('You kept consequential work inside its service window.');
  if (score.capacity >= 80) strengths.push('You matched review effort to the work each case required.');
  if (score.justifiedEscalations > 0) strengths.push('Your justified escalations reached a defined owner.');
  if (score.correctCorrections > 0) strengths.push('Your corrections used evidence to repair bounded errors.');
  while (strengths.length < 2) strengths.push('Your decision trace makes the remaining tradeoffs inspectable.');

  let improvement: string;
  if (score.unsafeApprovals > 0) {
    improvement = 'Open the conflicting or missing evidence before approving consequential work.';
  } else if (score.unresolved > cases.length / 3) {
    improvement = 'Protect capacity for high-consequence work before the queue becomes backlog-bound.';
  } else if (score.unnecessaryEscalations > 0) {
    improvement = 'Use escalation when authority or evidence is missing, not as a default safe-looking exit.';
  } else if (score.evidenceQuality < 50) {
    improvement = 'Replay and inspect the evidence behind each recommendation before relying on visible queue cues.';
  } else if (score.service < 80) {
    improvement = 'Review due state earlier so safe decisions also reach the service on time.';
  } else {
    improvement = 'Replay the same seed and compare one acceptable alternative against the preferred path.';
  }

  const repeated = score.repeatedExceptionClasses[0];
  const repeatedSignal = repeated
    ? `Repeated ${readableArchetype(repeated)} cases point to a rule, data, or workflow defect beyond individual review.`
    : null;
  return { strengths: [strengths[0], strengths[1]], improvement, repeatedSignal };
}
