import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCalibration } from '@/hooks/significant/useCalibration';
import { useCampaign } from '@/hooks/useCampaign';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { defaultState } from '@/lib/progress';
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

const scenario = generateScenario(campaignSeed(1, 1), 'clean-win');
const completeCalibration = vi.fn();
const mockedUseCampaign = vi.mocked(useCampaign);
const mockedUsePreferences = vi.mocked(usePreferences);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseCampaign.mockReturnValue({
    ready: true,
    visitor: 'first',
    state: defaultState(),
    levels: [],
    totalStars: 0,
    allDone: false,
    completeCalibration,
    completeLevel: vi.fn(),
    markCampaignCompleteTracked: vi.fn(),
  });
  mockedUsePreferences.mockReturnValue({
    ready: true,
    preferences: { sound: true, haptics: true, motion: 'system' },
    reducedMotion: false,
    updatePreference: vi.fn(),
  });
});

describe('useCalibration', () => {
  it('begins at zero-earned progress and settles exactly one real decision', async () => {
    const { result } = renderHook(() => useCalibration({ scenario, initialCall: null }));
    await waitFor(() => expect(track).toHaveBeenCalledWith('calibration_started', { gameId: 'significant' }));

    expect(result.current.phase).toBe('deciding');
    act(() => expect(result.current.decide('ship')).toBe(true));

    expect(result.current).toMatchObject({ phase: 'revealed', call: 'ship', correct: true });
    expect(completeCalibration).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('decision_made', {
      gameId: 'significant', mode: 'calibration', level: 'calibration', call: 'ship',
    });
    expect(sfx.win).toHaveBeenCalledWith(true);
    expect(vibrate).toHaveBeenCalledWith(30, true);

    act(() => expect(result.current.decide('kill')).toBeNull());
    expect(completeCalibration).toHaveBeenCalledTimes(1);
  });

  it('honors a call made on the landing without awarding twice or replaying feedback after navigation', async () => {
    const { result } = renderHook(() => useCalibration({ scenario, initialCall: 'kill' }));

    expect(result.current).toMatchObject({ phase: 'revealed', call: 'kill', correct: false });
    await waitFor(() => expect(completeCalibration).toHaveBeenCalledTimes(1));
    expect(track).toHaveBeenCalledWith('reveal_viewed', {
      gameId: 'significant', mode: 'calibration', correct: false, archetype: 'clean-win',
    });
    expect(sfx.lose).not.toHaveBeenCalled();
    expect(vibrate).not.toHaveBeenCalled();
  });
});
