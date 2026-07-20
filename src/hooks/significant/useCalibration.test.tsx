import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalibration } from '@/hooks/significant/useCalibration';
import { useCampaign } from '@/hooks/useCampaign';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { defaultState, type SignificantState } from '@/lib/progress';
import { track } from '@/services/analyticsService';
import { sfx } from '@/components/juice/sound';
import { vibrate } from '@/components/juice/haptics';

vi.mock('@/hooks/useCampaign', () => ({ useCampaign: vi.fn() }));
vi.mock('@/hooks/lab/usePreferences', () => ({ usePreferences: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));
vi.mock('@/components/juice/sound', () => ({
  sfx: { click: vi.fn(), win: vi.fn(), lose: vi.fn() },
}));
vi.mock('@/components/juice/haptics', () => ({ vibrate: vi.fn() }));

const commitCalibrationDecision = vi.fn();
const continueCalibration = vi.fn();
const mockedUseCampaign = vi.mocked(useCampaign);
const mockedUsePreferences = vi.mocked(usePreferences);

function stageCampaign(state: SignificantState, visitor: 'first' | 'returning' = 'first') {
  mockedUseCampaign.mockReturnValue({
    ready: true,
    visitor,
    state,
    levels: [],
    totalStars: 0,
    allDone: false,
    commitCalibrationDecision,
    continueCalibration,
    commitLevelDecision: vi.fn(),
    clearLevelReveal: vi.fn(),
    markCampaignCompleteTracked: vi.fn(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  stageCampaign(defaultState());
  mockedUsePreferences.mockReturnValue({
    ready: true,
    preferences: { sound: true, haptics: true, motion: 'system' },
    reducedMotion: false,
    updatePreference: vi.fn(),
  });
});

describe('useCalibration', () => {
  it('settles one on-screen decision without completing the three-round sequence', async () => {
    const { result } = renderHook(() => useCalibration());
    await waitFor(() => expect(track).toHaveBeenCalledWith('calibration_started', { gameId: 'significant' }));

    expect(result.current).toMatchObject({ phase: 'deciding', stepNumber: 1, totalSteps: 3 });
    act(() => expect(result.current.decide('ship')).toBe(true));

    expect(commitCalibrationDecision).toHaveBeenCalledTimes(1);
    expect(commitCalibrationDecision).toHaveBeenCalledWith('ship', true);
    expect(continueCalibration).not.toHaveBeenCalled();
    expect(track).toHaveBeenCalledWith('decision_made', {
      gameId: 'significant', mode: 'calibration', level: 'calibration', call: 'ship',
    });
    expect(sfx.win).toHaveBeenCalledWith(true);
    expect(vibrate).toHaveBeenCalledWith(30, true);

    act(() => expect(result.current.decide('kill')).toBeNull());
    expect(commitCalibrationDecision).toHaveBeenCalledTimes(1);
  });

  it('restores a stored review without replaying decision feedback', () => {
    stageCampaign({
      ...defaultState(),
      calibrationStep: 1,
      pendingCalibrationCall: 'ship',
    });

    const { result } = renderHook(() => useCalibration());

    expect(result.current).toMatchObject({
      phase: 'revealed',
      stepNumber: 2,
      call: 'ship',
      correct: false,
      isFinalRound: false,
    });
    expect(commitCalibrationDecision).not.toHaveBeenCalled();
    expect(sfx.lose).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();

    act(() => expect(result.current.continueRound()).toBe(false));
    expect(continueCalibration).toHaveBeenCalledTimes(1);
  });

  it('finishes only after the third stored reveal', () => {
    stageCampaign({
      ...defaultState(),
      calibrationStep: 2,
      pendingCalibrationCall: 'keep',
    });

    const { result } = renderHook(() => useCalibration());

    expect(result.current).toMatchObject({
      phase: 'revealed',
      stepNumber: 3,
      correct: true,
      isFinalRound: true,
      xpEarned: 20,
      isReplay: false,
    });
    act(() => expect(result.current.continueRound()).toBe(true));
    expect(continueCalibration).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('round_continued', {
      gameId: 'significant', mode: 'calibration', nextAction: 'campaign_path',
    });
  });
});
