'use client';

import { PersonSimpleRun, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { track } from '@/services/analyticsService';

export function SignificantEntryControls() {
  const { preferences, reducedMotion, updatePreference } = usePreferences();

  const handleSound = () => {
    const enabled = !preferences.sound;
    updatePreference('sound', enabled);
    track('settings_changed', { setting: 'sound', enabled });
  };

  const handleMotion = () => {
    const value = reducedMotion ? 'full' : 'reduced';
    updatePreference('motion', value);
    track('settings_changed', { setting: 'motion', value });
  };

  const SoundIcon = preferences.sound ? SpeakerHigh : SpeakerSlash;

  return (
    <div className="significant-entry-controls">
      <button
        type="button"
        className="significant-entry-control"
        aria-label={preferences.sound ? 'Turn sound off' : 'Turn sound on'}
        aria-pressed={preferences.sound}
        onClick={handleSound}
      >
        <SoundIcon size={24} weight="fill" aria-hidden />
      </button>
      <button
        type="button"
        className="significant-entry-control"
        aria-label={reducedMotion ? 'Use full motion' : 'Reduce motion'}
        aria-pressed={reducedMotion}
        onClick={handleMotion}
      >
        <PersonSimpleRun size={24} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
