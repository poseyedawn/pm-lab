import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LabHub } from '@/components/lab/LabHub';
import { useLabProfile } from '@/hooks/lab/useLabProfile';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { track } from '@/services/analyticsService';

vi.mock('@/hooks/lab/useLabProfile', () => ({ useLabProfile: vi.fn() }));
vi.mock('@/hooks/lab/usePreferences', () => ({ usePreferences: vi.fn() }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const mockedUseLabProfile = vi.mocked(useLabProfile);
const mockedUsePreferences = vi.mocked(usePreferences);

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
  mockedUsePreferences.mockReturnValue({
    ready: true,
    preferences: { sound: true, haptics: true, motion: 'full' },
    reducedMotion: false,
    storageWarning: false,
    updatePreference: vi.fn(),
  });
});

describe('Lab hub', () => {
  it('renders the complete game catalog in order', () => {
    const { container } = render(<LabHub />);

    const games = screen.getByRole('navigation', { name: 'Games' });
    const links = Array.from(games.querySelectorAll('a'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/significant',
      '/ship-it',
      '/exception-room',
    ]);
    expect(screen.getByLabelText('120 experience points')).toBeInTheDocument();
    expect(screen.getByText('Playable proof of product and AI judgment.')).toBeInTheDocument();
    expect(container.querySelectorAll('.lab-hub-card-action svg')).toHaveLength(3);
    expect(container.querySelectorAll('.lab-hub-ambient img')).toHaveLength(5);
    expect(container.querySelector('.lab-hub-title-logo img'))
      .toHaveAttribute('src', expect.stringContaining('/lab/pick-field-test-logo.svg'));
    expect(container.querySelector('.lab-hub-brand-wordmark'))
      .toHaveAttribute('src', expect.stringContaining('/lab/product-lab-wordmark.svg'));
    expect(screen.getByRole('link', { name: /Significant.*experiment evidence.*30 sec.*Solo case/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ship It.*integrity lines.*3 min.*12 decisions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Exception Room.*capacity runs out.*8 min.*12 cases/i })).toBeInTheDocument();
  });

  it('keeps ambient motion still when reduced motion is enabled', () => {
    mockedUsePreferences.mockReturnValue({
      ready: true,
      preferences: { sound: true, haptics: true, motion: 'reduced' },
      reducedMotion: true,
      storageWarning: false,
      updatePreference: vi.fn(),
    });

    const { container } = render(<LabHub />);

    expect(container.querySelectorAll('.lab-hub-card-float')).toHaveLength(3);
    expect(document.documentElement).not.toHaveAttribute('data-motion', 'full');
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
