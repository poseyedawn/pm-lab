'use client';

import { useEffect, useRef, useState } from 'react';
import { ExceptionRunScreen } from '@/components/exception-room/ExceptionRunScreen';
import { trackException } from '@/lib/exception-room/analytics';
import { selectedVisualPreview } from '@/lib/exception-room/preview';
import {
  loadExceptionRoomState,
  recordCampaignCompletion,
  saveExceptionRoomState,
  type ExceptionRoomState,
} from '@/lib/exception-room/state';
import type { ScoreBreakdown } from '@/lib/exception-room/types';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

export function ExceptionPlayClient({ previewSelected }: { previewSelected: boolean }) {
  const [progress, setProgress] = useState<ExceptionRoomState | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate preference and mint a client seed once
    setProgress(loadExceptionRoomState());
    setSeed(previewSelected ? 20260716 : randomSeed());
  }, [previewSelected]);

  useEffect(() => {
    if (seed === null || started.current) return;
    started.current = true;
    trackException({ name: 'exception_run_started', mode: 'campaign', seed });
  }, [seed]);

  if (!progress || seed === null) return <main className="exception-world" aria-busy="true" />;

  const handleComplete = (score: ScoreBreakdown) => {
    setProgress((current) => {
      if (!current) return current;
      const next = recordCampaignCompletion(current, score.profile);
      saveExceptionRoomState(next);
      return next;
    });
  };

  const handleNewRun = () => {
    const nextSeed = randomSeed();
    started.current = false;
    setSeed(nextSeed);
  };

  return (
    <main className="exception-world">
      <ExceptionRunScreen
        key={seed}
        seed={seed}
        soundOn={progress.soundOn}
        totalXp={progress.xp}
        initialState={previewSelected ? selectedVisualPreview(seed) : undefined}
        onComplete={handleComplete}
        onNewRun={handleNewRun}
      />
    </main>
  );
}
