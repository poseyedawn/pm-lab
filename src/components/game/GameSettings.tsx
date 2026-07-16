'use client';

import type React from 'react';
import Link from 'next/link';
import { GearSix } from '@phosphor-icons/react';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { track } from '@/services/analyticsService';
import { parseMotionPreference } from '@/services/preferencesService';
import type { GameId } from '@/types/lab';

interface GameSettingsProps {
  gameId?: GameId;
}

export function GameSettings({ gameId }: GameSettingsProps) {
  const { preferences, updatePreference } = usePreferences();

  const handleSound = () => {
    const enabled = !preferences.sound;
    updatePreference('sound', enabled);
    track('settings_changed', { setting: 'sound', enabled });
  };

  const handleHaptics = () => {
    const enabled = !preferences.haptics;
    updatePreference('haptics', enabled);
    track('settings_changed', { setting: 'haptics', enabled });
  };

  const handleMotion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseMotionPreference(event.target.value);
    if (!value) return;
    updatePreference('motion', value);
    track('settings_changed', { setting: 'motion', value });
  };

  return (
    <details className="relative">
      <summary className="game-settings-trigger cursor-pointer" aria-label="Settings">
        <GearSix size={20} weight="fill" aria-hidden />
        <span className="sr-only">Settings</span>
      </summary>
      <div className="game-settings-popover absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-ink/10 bg-surface p-4 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-extrabold">Sound</span>
          <button type="button" role="switch" aria-label="Sound" aria-checked={preferences.sound} onClick={handleSound} className="settings-toggle">
            {preferences.sound ? 'On' : 'Off'}
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="text-sm font-extrabold">Haptics</span>
          <button type="button" role="switch" aria-label="Haptics" aria-checked={preferences.haptics} onClick={handleHaptics} className="settings-toggle">
            {preferences.haptics ? 'On' : 'Off'}
          </button>
        </div>
        <label className="mt-4 flex items-center justify-between gap-4 text-sm font-extrabold">
          Motion
          <select value={preferences.motion} onChange={handleMotion} className="rounded-xl border border-ink/20 bg-surface px-2 py-2 text-sm font-normal text-ink">
            <option value="system">System</option>
            <option value="reduced">Reduced</option>
            <option value="full">Full</option>
          </select>
        </label>
        {gameId === 'significant' && (
          <Link
            href="/significant/calibration?replay=1"
            className="mt-4 flex min-h-11 items-center border-t border-ink/10 pt-3 text-sm font-extrabold text-brand-deep underline decoration-2 underline-offset-4"
          >
            Replay calibration
          </Link>
        )}
      </div>
    </details>
  );
}
