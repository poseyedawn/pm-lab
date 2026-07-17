import { SHIFT_CONFIGS } from '@/lib/exception-room/config';
import { dueBand } from '@/lib/exception-room/schedule';
import {
  CASE_LIMITS,
  EXCEPTION_ACTIONS,
  type ExceptionAction,
  type ExceptionCase,
} from '@/lib/exception-room/types';

export interface ContentValidationOptions {
  expectedCount?: number;
  requireCampaignDistribution?: boolean;
  requireSurfaceCuePairs?: boolean;
}

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

function groupBy<T>(values: readonly T[], keyFor: (value: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const value of values) {
    const key = keyFor(value);
    groups.set(key, [...(groups.get(key) ?? []), value]);
  }
  return groups;
}

function detailIds(candidate: ExceptionCase, action: 'correct' | 'escalate'): string[] {
  const options = action === 'correct' ? candidate.correctionOptions : candidate.escalationOptions;
  return options?.map((option) => option.id) ?? [];
}

function validateDetailOutcomes(candidate: ExceptionCase, errors: string[]): void {
  for (const action of ['correct', 'escalate'] as const) {
    const ids = detailIds(candidate, action);
    const outcomes = candidate.detailOutcomeById?.[action];
    if (ids.length === 0 && outcomes && Object.keys(outcomes).length > 0) {
      errors.push(`${candidate.id}: ${action} outcomes exist without authored options`);
      continue;
    }
    for (const id of ids) {
      if (!outcomes?.[id]) errors.push(`${candidate.id}: ${action} option ${id} has no outcome`);
    }
    for (const id of Object.keys(outcomes ?? {})) {
      if (!ids.includes(id)) errors.push(`${candidate.id}: ${action} outcome ${id} has no option`);
    }
  }
}

function validateEscalationHandoffs(candidate: ExceptionCase, errors: string[]): void {
  if (!candidate.escalationOptions || candidate.escalationOptions.length === 0) {
    errors.push(`${candidate.id}: escalation requires an authored reason and destination`);
    return;
  }
  for (const option of candidate.escalationOptions) {
    if (!option.destinationRole?.trim()) {
      errors.push(`${candidate.id}: escalation option ${option.id} requires a destination role`);
    }
  }
}

function validateDecisionOptions(candidate: ExceptionCase, errors: string[]): void {
  for (const [action, options] of [
    ['correct', candidate.correctionOptions ?? []],
    ['escalate', candidate.escalationOptions ?? []],
  ] as const) {
    const ids = options.map((option) => option.id);
    if (new Set(ids).size !== ids.length) errors.push(`${candidate.id}: ${action} option ids must be unique`);
    for (const option of options) {
      if (!kebabCase.test(option.id)) {
        errors.push(`${candidate.id}: ${action} option id ${option.id} must be kebab-case`);
      }
      if (!option.label.trim()) errors.push(`${candidate.id}: ${action} option ${option.id} requires a label`);
    }
  }
}

function validateCase(candidate: ExceptionCase, errors: string[]): void {
  if (!kebabCase.test(candidate.id)) errors.push(`${candidate.id}: case id must be kebab-case`);
  if (candidate.summary.length > CASE_LIMITS.summary) errors.push(`${candidate.id}: summary is too long`);
  if (candidate.recommendation.length > CASE_LIMITS.recommendation) {
    errors.push(`${candidate.id}: recommendation is too long`);
  }
  if (candidate.rationale.length > CASE_LIMITS.rationale) errors.push(`${candidate.id}: rationale is too long`);
  if (candidate.routeReasons.length === 0) errors.push(`${candidate.id}: route reason is required`);
  if (new Set(candidate.routeReasons).size !== candidate.routeReasons.length) {
    errors.push(`${candidate.id}: route reasons must be unique`);
  }
  if (candidate.evidence.length < CASE_LIMITS.minEvidence || candidate.evidence.length > CASE_LIMITS.maxEvidence) {
    errors.push(`${candidate.id}: evidence count must be ${CASE_LIMITS.minEvidence} through ${CASE_LIMITS.maxEvidence}`);
  }

  const evidenceIds = candidate.evidence.map((item) => item.id);
  if (new Set(evidenceIds).size !== evidenceIds.length) errors.push(`${candidate.id}: evidence ids must be unique`);
  for (const item of candidate.evidence) {
    if (!kebabCase.test(item.id)) errors.push(`${candidate.id}: evidence id ${item.id} must be kebab-case`);
    if (item.summary.length > CASE_LIMITS.evidenceSummary) {
      errors.push(`${candidate.id}: evidence ${item.id} summary is too long`);
    }
  }
  for (const requiredId of candidate.requiredEvidenceIds) {
    if (!evidenceIds.includes(requiredId)) errors.push(`${candidate.id}: required evidence ${requiredId} is missing`);
  }
  if (new Set(candidate.requiredEvidenceIds).size !== candidate.requiredEvidenceIds.length) {
    errors.push(`${candidate.id}: required evidence ids must be unique`);
  }

  if (!Number.isInteger(candidate.dueOffsetTicks) || candidate.dueOffsetTicks < 1) {
    errors.push(`${candidate.id}: due offset must be a positive integer`);
  }
  for (const action of EXCEPTION_ACTIONS) {
    const cost = candidate.actionCosts[action];
    if (!Number.isInteger(cost) || cost < 1) errors.push(`${candidate.id}: ${action} cost must be positive`);
    if (!candidate.outcomeByAction[action]) errors.push(`${candidate.id}: ${action} outcome is missing`);
  }
  if (candidate.acceptableActions.includes(candidate.preferredAction)) {
    errors.push(`${candidate.id}: preferred action cannot also be acceptable`);
  }
  if (new Set(candidate.acceptableActions).size !== candidate.acceptableActions.length) {
    errors.push(`${candidate.id}: acceptable actions must be unique`);
  }
  if (candidate.outcomeByAction[candidate.preferredAction] !== 'preferred') {
    errors.push(`${candidate.id}: preferred action must map to preferred`);
  }
  for (const action of candidate.acceptableActions) {
    if (candidate.outcomeByAction[action] !== 'acceptable') {
      errors.push(`${candidate.id}: acceptable action ${action} must map to acceptable`);
    }
  }
  for (const action of EXCEPTION_ACTIONS) {
    if (action === candidate.preferredAction || candidate.acceptableActions.includes(action)) continue;
    if (['preferred', 'acceptable'].includes(candidate.outcomeByAction[action])) {
      errors.push(`${candidate.id}: ${action} has a contradictory action outcome`);
    }
  }
  validateDetailOutcomes(candidate, errors);
  validateDecisionOptions(candidate, errors);
  validateEscalationHandoffs(candidate, errors);
}

export function surfaceCueSignature(candidate: ExceptionCase): string {
  return [
    candidate.routeReasons[0],
    candidate.consequence,
    candidate.confidenceBand,
    candidate.reversibility,
    dueBand(candidate.dueOffsetTicks),
  ].join('|');
}

function validateSurfacePairs(cases: readonly ExceptionCase[], errors: string[]): void {
  const groups = groupBy(cases, surfaceCueSignature);
  for (const [signature, group] of groups) {
    const actions = new Set(group.map((candidate) => candidate.preferredAction));
    if (group.length < 2 || actions.size < 2) {
      errors.push(`surface cue ${signature} must pair at least two different preferred actions`);
    }
  }
}

function countPreferred(cases: readonly ExceptionCase[], action: ExceptionAction): number {
  return cases.filter((candidate) => candidate.preferredAction === action).length;
}

function validateCampaignDistribution(cases: readonly ExceptionCase[], errors: string[]): void {
  for (const config of SHIFT_CONFIGS) {
    const shiftCases = cases.filter((candidate) => candidate.shift === config.shift);
    if (shiftCases.length !== config.arrivalSlots.length) {
      errors.push(`shift ${config.shift} requires ${config.arrivalSlots.length} cases`);
    }
    const preferredCost = shiftCases.reduce(
      (total, candidate) => total + candidate.actionCosts[candidate.preferredAction],
      0,
    );
    if (preferredCost > config.capacity) errors.push(`shift ${config.shift} preferred path exceeds capacity`);
    const escalateAllCost = shiftCases.reduce((total, candidate) => total + candidate.actionCosts.escalate, 0);
    if (escalateAllCost <= config.capacity) errors.push(`shift ${config.shift} allows escalate-all`);
  }
  if (countPreferred(cases, 'approve') < 2) errors.push('campaign requires at least two preferred approvals');
  if (countPreferred(cases, 'correct') < 3) errors.push('campaign requires at least three preferred corrections');
  if (countPreferred(cases, 'escalate') < 3) errors.push('campaign requires at least three preferred escalations');
  if (cases.filter((candidate) => candidate.acceptableActions.length > 0).length < 2) {
    errors.push('campaign requires at least two acceptable alternatives');
  }
  if (!cases.some((candidate) => candidate.confidenceBand === 'high' && candidate.outcomeByAction.approve === 'unsafe')) {
    errors.push('campaign requires a high-confidence unsafe approval');
  }
  if (!cases.some((candidate) => candidate.confidenceBand === 'low' && candidate.preferredAction === 'approve')) {
    errors.push('campaign requires a low-confidence clean approval');
  }
  const archetypes = groupBy(cases, (candidate) => candidate.archetype);
  if (![...archetypes.values()].some((group) => group.length > 1)) {
    errors.push('campaign requires a repeated exception class');
  }
}

export function validateCaseSet(
  cases: readonly ExceptionCase[],
  options: ContentValidationOptions = {},
): string[] {
  const errors: string[] = [];
  if (options.expectedCount !== undefined && cases.length !== options.expectedCount) {
    errors.push(`expected ${options.expectedCount} cases; received ${cases.length}`);
  }
  const ids = cases.map((candidate) => candidate.id);
  if (new Set(ids).size !== ids.length) errors.push('case ids must be unique');
  for (const candidate of cases) validateCase(candidate, errors);
  if (options.requireCampaignDistribution) validateCampaignDistribution(cases, errors);
  if (options.requireSurfaceCuePairs) validateSurfacePairs(cases, errors);
  return errors;
}
