import type { ExceptionCase, RouteReason } from '@/lib/exception-room/types';

const TITLES: Readonly<Record<string, string>> = {
  'effective-date-conflict': 'Effective date conflict',
  'unfamiliar-clean-layout': 'Unfamiliar clean layout',
  'missing-approval-evidence': 'Approval record missing',
  'sampled-clean-match': 'Clean quality sample',
  'low-confidence-unit-error': 'Unit mismatch',
  'repeated-date-drift-one': 'One-day date drift',
  'boundary-needs-owner': 'Policy boundary',
  'boundary-cleared-by-policy': 'Authority confirmed',
  'sampled-field-mismatch': 'Sample field mismatch',
  'conflict-needs-specialist': 'Conflicting sources',
  'missing-citation-correctable': 'Citation missing',
  'repeated-date-drift-two': 'Repeated date drift',
};

const REASON_LABELS: Readonly<Record<RouteReason, string>> = {
  'low-confidence': 'Low confidence',
  'conflicting-evidence': 'Conflicting evidence',
  'missing-evidence': 'Missing evidence',
  'policy-boundary': 'Policy boundary',
  'unfamiliar-input': 'Unfamiliar input',
  'random-quality-sample': 'Quality sample',
  'repeat-correction': 'Repeat exception',
};

export const caseTitle = (candidate: ExceptionCase): string => TITLES[candidate.id] ?? candidate.id;
export const routeReasonLabel = (reason: RouteReason): string => REASON_LABELS[reason];

export const dueLabel = (dueAtTick: number, tick: number): string => {
  const remaining = dueAtTick - tick;
  if (remaining <= 0) return 'Due now';
  if (remaining === 1) return 'Due next tick';
  return `Due in ${remaining} ticks`;
};
