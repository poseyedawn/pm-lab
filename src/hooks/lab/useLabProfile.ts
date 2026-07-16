'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  defaultLabProfile,
  loadLabProfile,
  subscribeToLabProfile,
  totalProfileXp,
} from '@/services/labProfileService';

export function useLabProfile() {
  const [profile, setProfile] = useState(defaultLabProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only versioned storage after mount
    setProfile(loadLabProfile());
    setReady(true);
    return subscribeToLabProfile(setProfile);
  }, []);

  const totalXp = useMemo(() => totalProfileXp(profile), [profile]);
  return { ready, profile, totalXp };
}
