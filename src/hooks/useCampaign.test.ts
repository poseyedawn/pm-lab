import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CALIBRATION_CORRECT_XP, defaultState, recordCampaignResult, saveState } from '@/lib/progress';
import { iqTitle, levelStatuses, useCampaign } from '@/hooks/useCampaign';

afterEach(() => window.localStorage.clear());

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

describe('useCampaign calibration', () => {
  it('awards XP for each correct calibration call without replay farming', async () => {
    saveState(defaultState());
    const { result } = renderHook(() => useCampaign());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.visitor).toBe('first');
    expect(result.current.state).toMatchObject({ warmupDone: false, xp: 0 });

    act(() => result.current.commitCalibrationDecision('ship', true));
    expect(result.current.state).toMatchObject({ calibrationStep: 0, pendingCalibrationCall: 'ship' });
    expect(result.current.state?.xp).toBe(CALIBRATION_CORRECT_XP);
    act(() => result.current.continueCalibration());
    expect(result.current.state).toMatchObject({ calibrationStep: 1, pendingCalibrationCall: null });

    act(() => result.current.commitCalibrationDecision('kill', true));
    act(() => result.current.continueCalibration());
    expect(result.current.state).toMatchObject({ calibrationStep: 2, pendingCalibrationCall: null });

    act(() => result.current.commitCalibrationDecision('keep', true));
    expect(result.current.state?.warmupDone).toBe(false);
    act(() => result.current.continueCalibration());
    await waitFor(() => expect(result.current.state?.xp).toBe(CALIBRATION_CORRECT_XP * 3));
    expect(result.current.state?.warmupDone).toBe(true);

    act(() => result.current.continueCalibration());
    expect(result.current.state?.xp).toBe(CALIBRATION_CORRECT_XP * 3);
  });
});
