import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LabLanding } from '@/components/lab/LabLanding';
import { useLabLanding } from '@/hooks/lab/useLabLanding';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import { track } from '@/services/analyticsService';

vi.mock('@/hooks/lab/useLabLanding', () => ({ useLabLanding: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const scenario = generateScenario(campaignSeed(1, 1), 'clean-win');
const mockedUseLabLanding = vi.mocked(useLabLanding);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseLabLanding.mockReturnValue({
    ready: true,
    totalXp: 0,
    completedCases: 0,
    isReturning: false,
    nextLevel: 1,
  });
});

describe('Lab landing', () => {
  it('starts a first-time visitor in calibration and preserves a preview call', () => {
    render(<LabLanding scenario={scenario} />);

    const cta = screen.getByRole('link', { name: /make your first call/i });
    expect(cta).toHaveAttribute('href', '/significant/play?level=1&calibration=1');

    fireEvent.click(screen.getByRole('button', { name: /kill/i }));
    expect(cta).toHaveAttribute('href', '/significant/play?level=1&calibration=1&call=kill');

    cta.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(cta);
    expect(track).toHaveBeenCalledWith('game_selected', { gameId: 'significant', placement: 'lab_primary' });
  });

  it('shows progress, continuation, and a fresh-start route for returning visitors', () => {
    mockedUseLabLanding.mockReturnValue({
      ready: true,
      totalXp: 350,
      completedCases: 2,
      isReturning: true,
      nextLevel: 3,
    });

    render(<LabLanding scenario={scenario} />);

    expect(screen.getByRole('link', { name: /continue level 3/i }))
      .toHaveAttribute('href', '/significant/play?level=3');
    expect(screen.queryByRole('button', { name: /kill/i })).not.toBeInTheDocument();
    expect(screen.getByText(/2 of 10 cases complete · 350 XP/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /restart calibration/i }))
      .toHaveAttribute('href', '/significant/play?level=1&calibration=1');
  });
});
