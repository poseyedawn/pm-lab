'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLabProfile } from '@/hooks/lab/useLabProfile';
import { significantLandingProgress } from '@/lib/significant/landing';
import { defaultState, loadState, type SignificantState } from '@/lib/progress';

export function useSignificantLanding() {
  const { ready: profileReady, totalXp } = useLabProfile();
  const [significantState, setSignificantState] = useState<SignificantState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only game progress after mount
    setSignificantState(loadState());
  }, []);

  const progress = useMemo(
    () => significantLandingProgress(significantState ?? defaultState()),
    [significantState],
  );

  return {
    ready: profileReady && significantState !== null,
    totalXp,
    ...progress,
  };
}
