import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSettings } from '@/components/game/GameSettings';
import { PreferenceRuntime } from '@/components/lab/PreferenceRuntime';
import { LAB_PREFERENCES_STORAGE_KEY } from '@/services/preferencesService';
import { track } from '@/services/analyticsService';

vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

const matchMedia = (matches: boolean): MediaQueryList => ({
  matches,
  media: '(prefers-reduced-motion: reduce)',
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: vi.fn(() => matchMedia(true)) });
});

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-motion');
});

describe('GameSettings', () => {
  it('persists independent sound and haptic switches', async () => {
    render(<GameSettings />);
    fireEvent.click(screen.getByText('Settings'));
    fireEvent.click(await screen.findByRole('switch', { name: 'Sound' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Haptics' }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(LAB_PREFERENCES_STORAGE_KEY) ?? '');
      expect(stored.preferences).toMatchObject({ sound: false, haptics: false });
    });
    expect(track).toHaveBeenCalledWith('settings_changed', { setting: 'sound', enabled: false });
    expect(track).toHaveBeenCalledWith('settings_changed', { setting: 'haptics', enabled: false });
  });

  it('lets an explicit motion choice override the system preference', async () => {
    render(<><PreferenceRuntime /><GameSettings /></>);
    fireEvent.click(screen.getByText('Settings'));

    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('reduced'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Motion' }), { target: { value: 'full' } });
    await waitFor(() => expect(document.documentElement.dataset.motion).toBe('full'));
    expect(track).toHaveBeenCalledWith('settings_changed', { setting: 'motion', value: 'full' });
  });

  it('offers a safe, non-awarding calibration replay for Significant', () => {
    render(<GameSettings gameId="significant" />);
    fireEvent.click(screen.getByText('Settings'));

    expect(screen.getByRole('link', { name: 'Replay calibration' }))
      .toHaveAttribute('href', '/significant/calibration?replay=1');
  });
});
