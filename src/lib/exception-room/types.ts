export const EXCEPTION_ACTIONS = ['approve', 'correct', 'escalate'] as const;
export const CONSEQUENCE_TIERS = ['low', 'medium', 'high', 'critical'] as const;
export const ROUTE_REASONS = [
  'low-confidence',
  'conflicting-evidence',
  'missing-evidence',
  'policy-boundary',
  'unfamiliar-input',
  'random-quality-sample',
  'repeat-correction',
] as const;

export type ExceptionAction = (typeof EXCEPTION_ACTIONS)[number];
export type ConsequenceTier = (typeof CONSEQUENCE_TIERS)[number];
export type RouteReason = (typeof ROUTE_REASONS)[number];
export type ShiftNumber = 1 | 2 | 3;
export type RunMode = 'campaign' | 'daily' | 'practice';
export type ExceptionRunPhase = 'review' | 'reveal' | 'debrief';
export type DecisionOutcome = 'preferred' | 'acceptable' | 'unsafe' | 'unnecessary';
export type Reversibility = 'easy' | 'moderate' | 'difficult';
export type EvidenceStatus = 'supports' | 'conflicts' | 'missing' | 'context';
export type LearningDestination = 'rule' | 'evaluation-set' | 'workflow' | 'policy' | 'none';
export type CaseRuntimeStatus = 'scheduled' | 'queued' | 'resolved' | 'escalated' | 'expired';
export type ExpirationReason =
  | 'capacity-constrained'
  | 'shift-limit'
  | 'operator-ended'
  | 'run-ended-before-arrival';
export type OperatorProfile =
  | 'Balanced Operator'
  | 'Speed Over Evidence'
  | 'Escalation Heavy'
  | 'Backlog Bound'
  | 'Safety First'
  | 'Calibration in Progress';

export interface EvidenceItem {
  id: string;
  title: string;
  sourceType: 'authoritative-record' | 'submitted-document' | 'policy' | 'history';
  observedAt: number;
  status: EvidenceStatus;
  summary: string;
}

export interface DecisionDetail {
  id: string;
  label: string;
  destinationRole?: string;
}

export interface ExceptionCase {
  id: string;
  archetype: string;
  summary: string;
  recommendation: string;
  confidenceBand: 'low' | 'medium' | 'high';
  consequence: ConsequenceTier;
  reversibility: Reversibility;
  routeReasons: readonly RouteReason[];
  evidence: readonly EvidenceItem[];
  shift: ShiftNumber;
  dueOffsetTicks: number;
  carryover: boolean;
  actionCosts: Readonly<Record<ExceptionAction, number>>;
  preferredAction: ExceptionAction;
  acceptableActions: readonly ExceptionAction[];
  outcomeByAction: Readonly<Record<ExceptionAction, DecisionOutcome>>;
  detailOutcomeById?: {
    readonly correct?: Readonly<Record<string, DecisionOutcome>>;
    readonly escalate?: Readonly<Record<string, DecisionOutcome>>;
  };
  correctionOptions?: readonly DecisionDetail[];
  escalationOptions?: readonly DecisionDetail[];
  requiredEvidenceIds: readonly string[];
  rationale: string;
  mishandlingConsequence: string;
  learningDestination: LearningDestination;
  contentNotes?: readonly string[];
}

export interface ScheduledCaseTiming {
  caseId: string;
  shift: ShiftNumber;
  arrivesAtTick: number;
  dueAtTick: number;
}

export interface ScheduledExceptionCase extends ExceptionCase {
  arrivesAtTick: number;
  dueAtTick: number;
}

export interface CaseRuntimeState {
  status: CaseRuntimeStatus;
  evidenceViewedIds: readonly string[];
  warningEmitted: boolean;
  breachEmitted: boolean;
  expirationReason?: ExpirationReason;
}

export interface DecisionInput {
  caseId: string;
  action: ExceptionAction;
  detailId?: string;
  acceptEvidenceDeficit?: boolean;
}

export interface CaseResolution {
  caseId: string;
  action: ExceptionAction;
  detailId?: string;
  evidenceViewedIds: readonly string[];
  requiredEvidenceIds: readonly string[];
  missingRequiredEvidenceIds: readonly string[];
  acceptedEvidenceDeficit: boolean;
  resolvedAtTick: number;
  capacityCost: number;
  outcome: DecisionOutcome;
  learningDestination: LearningDestination;
}

export type RunEvent =
  | { type: 'case-arrived'; caseId: string; tick: number }
  | { type: 'case-opened'; caseId: string; tick: number }
  | { type: 'evidence-viewed'; caseId: string; evidenceId: string; tick: number }
  | { type: 'case-resolved'; resolution: CaseResolution }
  | { type: 'case-warning'; caseId: string; tick: number }
  | { type: 'case-breached'; caseId: string; tick: number }
  | { type: 'case-expired'; caseId: string; tick: number; reason: ExpirationReason }
  | { type: 'time-advanced'; fromTick: number; toTick: number }
  | { type: 'shift-ended'; shift: ShiftNumber; tick: number }
  | { type: 'capacity-exhausted'; shift: ShiftNumber; tick: number }
  | { type: 'shift-complete'; shift: ShiftNumber; tick: number };

export interface ExceptionRunState {
  seed: number;
  mode: RunMode;
  shift: ShiftNumber;
  tick: number;
  capacityRemaining: number;
  schedule: readonly ScheduledCaseTiming[];
  caseStates: Readonly<Record<string, CaseRuntimeState>>;
  queuedCaseIds: readonly string[];
  selectedCaseId: string | null;
  resolutions: readonly CaseResolution[];
  status: 'active' | 'complete';
  history: readonly RunEvent[];
}

export type EngineErrorCode =
  | 'run-complete'
  | 'unknown-case'
  | 'case-unavailable'
  | 'unknown-evidence'
  | 'invalid-detail'
  | 'evidence-required'
  | 'insufficient-capacity'
  | 'invalid-history';

export interface EngineError {
  code: EngineErrorCode;
  message: string;
}

export type EngineResult =
  | { ok: true; state: ExceptionRunState }
  | { ok: false; state: ExceptionRunState; error: EngineError };

export interface ScoreBreakdown {
  safety: number;
  service: number;
  capacity: number;
  safeCompletions: number;
  unsafeApprovals: number;
  correctCorrections: number;
  justifiedEscalations: number;
  unnecessaryEscalations: number;
  serviceBreaches: number;
  unresolved: number;
  capacitySpent: number;
  evidenceQuality: number;
  evidenceCompleteCases: number;
  evidenceDeficitDecisions: number;
  repeatedExceptionClasses: readonly string[];
  profile: OperatorProfile;
}

export interface ShiftConfig {
  shift: ShiftNumber;
  openingTick: number;
  maxTick: number;
  capacity: number;
  arrivalSlots: readonly number[];
}

export const CASE_LIMITS = {
  summary: 160,
  recommendation: 180,
  evidenceSummary: 180,
  rationale: 420,
  minEvidence: 2,
  maxEvidence: 4,
} as const;
