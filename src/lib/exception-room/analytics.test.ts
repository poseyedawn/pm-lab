import { beforeEach, describe, expect, it, vi } from 'vitest';
import { trackException } from '@/lib/exception-room/analytics';
import { track } from '@/services/analyticsService';

vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

describe('trackException', () => {
  beforeEach(() => vi.mocked(track).mockClear());

  it('passes a typed event name and bounded properties to shared analytics', () => {
    trackException({
      name: 'exception_decision_submitted',
      mode: 'campaign',
      caseId: 'missing-approval-evidence',
      action: 'escalate',
    });
    expect(track).toHaveBeenCalledWith('exception_decision_submitted', {
      mode: 'campaign',
      caseId: 'missing-approval-evidence',
      action: 'escalate',
    });
  });
});
