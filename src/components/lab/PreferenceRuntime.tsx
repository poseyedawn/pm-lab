'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/hooks/lab/usePreferences';

export function PreferenceRuntime() {
  const { preferences, reducedMotion } = usePreferences();

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion
      ? 'reduced'
      : preferences.motion === 'full' ? 'full' : 'system';
  }, [preferences.motion, reducedMotion]);

  return null;
}
