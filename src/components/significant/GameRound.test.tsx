import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameRound } from '@/components/significant/GameRound';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { fireConfetti } from '@/components/juice/confetti';
import { sfx } from '@/components/juice/sound';

vi.mock('@/hooks/lab/usePreferences', () => ({ usePreferences: vi.fn() }));
vi.mock('@/components/juice/confetti', () => ({ fireConfetti: vi.fn(() => vi.fn()) }));
vi.mock('@/components/juice/sound', () => ({
  sfx: { click: vi.fn(), win: vi.fn(), lose: vi.fn() },
}));
vi.mock('@/components/juice/haptics', () => ({ vibrate: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const scenario = generateScenario(campaignSeed(1, 1), 'clean-win');
const mockedUsePreferences = vi.mocked(usePreferences);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUsePreferences.mockReturnValue({
    ready: true,
    preferences: { sound: true, haptics: true, motion: 'system' },
    reducedMotion: false,
    updatePreference: vi.fn(),
  });
});

describe('GameRound feedback', () => {
  it('uses corrective feedback without confetti or reward chips after a missed call', () => {
    const onDecision = vi.fn();
    render(
      <GameRound
        scenario={scenario}
        combo={1}
        mode="campaign"
        level={1}
        onDecision={onDecision}
        onContinue={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Kill:/ }));

    expect(screen.getByRole('heading', { name: 'That call missed the signal.' })).toBeInTheDocument();
    expect(screen.getByText('Better call')).toBeInTheDocument();
    expect(screen.queryByText('+0 XP')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to campaign/i })).toBeInTheDocument();
    expect(onDecision).toHaveBeenCalledWith(expect.objectContaining({ call: 'kill', correct: false, xpEarned: 0 }));
    expect(fireConfetti).not.toHaveBeenCalled();
    expect(sfx.lose).toHaveBeenCalledWith(true);
  });

  it('keeps confetti and the XP reward exclusive to a correct call', () => {
    const onDecision = vi.fn();
    render(
      <GameRound
        scenario={scenario}
        combo={1}
        mode="campaign"
        level={1}
        onDecision={onDecision}
        onContinue={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^Ship:/ }));

    expect(screen.getByRole('heading', { name: 'You found the signal.' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/\+\d+ XP/);
    expect(fireConfetti).toHaveBeenCalledTimes(1);
    expect(onDecision).toHaveBeenCalledWith(expect.objectContaining({ call: 'ship', correct: true }));
    expect(sfx.win).toHaveBeenCalledWith(true);
  });
});
