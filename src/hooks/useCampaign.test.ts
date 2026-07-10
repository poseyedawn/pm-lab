import { describe, expect, it } from 'vitest';
import { defaultState, recordCampaignResult } from '@/lib/progress';
import { iqTitle, levelStatuses } from '@/hooks/useCampaign';

describe('levelStatuses', () => {
  it('only level 1 is open initially', () => {
    const levels = levelStatuses(defaultState());
    expect(levels[0].status).toBe('open');
    expect(levels[1].status).toBe('locked');
  });
  it('passing level 1 opens level 2; failing does not', () => {
    const passed = recordCampaignResult(defaultState(), 1, true);
    expect(levelStatuses(passed)[1].status).toBe('open');
    const failed = recordCampaignResult(defaultState(), 1, false);
    expect(levelStatuses(failed)[1].status).toBe('locked');
    expect(levelStatuses(failed)[0].status).toBe('open'); // retryable
  });
});

describe('iqTitle', () => {
  it('maps correct counts to titles', () => {
    expect(iqTitle(0)).toBe('Coin Flipper');
    expect(iqTitle(8)).toBe('Growth PM');
    expect(iqTitle(10)).toBe("p-Hacker's Nightmare");
  });
});
