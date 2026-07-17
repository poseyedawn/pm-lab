import type { EvidenceItem, EvidenceStatus } from '@/lib/exception-room/types';

type EvidenceSource = EvidenceItem['sourceType'];

export function evidence(
  id: string,
  title: string,
  status: EvidenceStatus,
  summary: string,
  observedAt: number,
  sourceType: EvidenceSource = 'authoritative-record',
): EvidenceItem {
  return { id, title, sourceType, observedAt, status, summary };
}
