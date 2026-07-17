import { track } from '@/services/analyticsService';
import type { AnalyticsEventProperties } from '@/types/analytics';
import type { ExceptionAction, RunMode } from '@/lib/exception-room/types';

export type ExceptionAnalyticsEvent =
  | { name: 'exception_run_started'; mode: RunMode; seed: number }
  | { name: 'exception_case_opened'; mode: RunMode; shift: number; caseId: string }
  | { name: 'exception_evidence_viewed'; mode: RunMode; caseId: string; evidenceId: string }
  | { name: 'exception_decision_submitted'; mode: RunMode; caseId: string; action: ExceptionAction }
  | { name: 'exception_shift_ended'; mode: RunMode; shift: number; remaining: number }
  | { name: 'exception_run_completed'; mode: RunMode; profile: string; safety: number; service: number; capacity: number };

type ExceptionEventName = ExceptionAnalyticsEvent['name'];

export function trackException(event: ExceptionAnalyticsEvent): void {
  const { name, ...properties } = event;
  track(name, properties as AnalyticsEventProperties<ExceptionEventName>);
}
