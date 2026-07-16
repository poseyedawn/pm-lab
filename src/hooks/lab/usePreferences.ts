'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  defaultPreferences,
  loadPreferences,
  savePreferences,
  subscribeToPreferences,
} from '@/services/preferencesService';
import type { LabPreferences } from '@/types/preferences';

export function usePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only versioned storage after mount
    setPreferences(loadPreferences());
    setReady(true);
    return subscribeToPreferences(setPreferences);
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setSystemReducedMotion(media.matches);
    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const updatePreference = useCallback(<Key extends keyof LabPreferences>(
    key: Key,
    value: LabPreferences[Key],
  ) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      savePreferences(next);
      return next;
    });
  }, []);

  const reducedMotion = preferences.motion === 'reduced'
    || (preferences.motion === 'system' && systemReducedMotion);

  return { ready, preferences, reducedMotion, updatePreference };
}
