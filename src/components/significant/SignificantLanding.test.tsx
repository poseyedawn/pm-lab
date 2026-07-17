import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SignificantLanding } from '@/components/significant/SignificantLanding';
import { useSignificantLanding } from '@/hooks/significant/useSignificantLanding';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { track } from '@/services/analyticsService';

vi.mock('@/hooks/significant/useSignificantLanding', () => ({ useSignificantLanding: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const scenario = generateScenario(campaignSeed(1, 1), 'clean-win');
const mockedUseSignificantLanding = vi.mocked(useSignificantLanding);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseSignificantLanding.mockReturnValue({
    ready: true,
    totalXp: 0,
    completedCases: 0,
    isReturning: false,
    nextLevel: 1,
  });
});

describe('Significant landing', () => {
  it('starts a first-time visitor from the full-screen field-test entry', () => {
    render(<SignificantLanding scenario={scenario} />);

    expect(screen.getByRole('heading', { name: 'Significant' })).toBeInTheDocument();
    expect(screen.getByText('Preparing your first experiment…')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: /start the field test/i });
    expect(cta).toHaveAttribute('href', '/significant/calibration');

    cta.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(cta);
    expect(track).toHaveBeenCalledWith('game_selected', { gameId: 'significant', placement: 'lab_primary' });
  });

  it('shows progress, continuation, and a fresh-start route for returning visitors', () => {
    mockedUseSignificantLanding.mockReturnValue({
      ready: true,
      totalXp: 350,
      completedCases: 2,
      isReturning: true,
      nextLevel: 3,
    });

    render(<SignificantLanding scenario={scenario} />);

    expect(screen.getByRole('link', { name: /resume level 3/i }))
      .toHaveAttribute('href', '/significant/play?level=3');
    expect(screen.getByText(/2 cases complete · 350 XP/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /replay calibration/i }))
      .toHaveAttribute('href', '/significant/calibration?replay=1');
  });
});
