import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LabHub } from '@/components/lab/LabHub';
import { useLabProfile } from '@/hooks/lab/useLabProfile';
import { track } from '@/services/analyticsService';

vi.mock('@/hooks/lab/useLabProfile', () => ({ useLabProfile: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const mockedUseLabProfile = vi.mocked(useLabProfile);

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseLabProfile.mockReturnValue({
    ready: true,
    profile: {
      version: 2,
      games: {
        'ship-it': {
          gameId: 'ship-it',
          xp: 120,
          completedMilestones: [],
          lastPlayedAt: '2026-07-17T00:00:00.000Z',
        },
      },
    },
    totalXp: 120,
  });
});

describe('Lab hub', () => {
  it('renders the complete game catalog in order', () => {
    render(<LabHub />);

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/significant',
      '/ship-it',
      '/exception-room',
    ]);
    expect(screen.getByText('120 XP')).toBeInTheDocument();
  });

  it('tracks the selected catalog game', () => {
    render(<LabHub />);

    const shipIt = screen.getByRole('link', { name: /ship it/i });
    shipIt.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(shipIt);

    expect(track).toHaveBeenCalledWith('game_selected', {
      gameId: 'ship-it',
      placement: 'lab_primary',
    });
  });
});
