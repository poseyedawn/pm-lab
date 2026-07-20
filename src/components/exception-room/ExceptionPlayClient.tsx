'use client';

import { useEffect, useRef, useState } from 'react';
import { ExceptionRunScreen } from '@/components/exception-room/ExceptionRunScreen';
import { trackException } from '@/lib/exception-room/analytics';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';
import { selectedVisualPreview } from '@/lib/exception-room/preview';
import {
  clearActiveExceptionRun,
  loadActiveExceptionRun,
  loadExceptionRoomState,
  recordCampaignCompletion,
  recordPracticeCompletion,
  saveExceptionRoomState,
  type ActiveExceptionMode,
  type ActiveExceptionRunSnapshot,
  type ExceptionRoomState,
} from '@/lib/exception-room/state';
import type { ScoreBreakdown } from '@/lib/exception-room/types';

const randomSeed = () => Math.floor(Math.random() * 2 ** 31);

interface ExceptionPlayClientProps {
  mode: ActiveExceptionMode;
  previewSelected: boolean;
}

interface RunLaunch {
  seed: number;
  restored: ActiveExceptionRunSnapshot | null;
}

export function ExceptionPlayClient({ mode, previewSelected }: ExceptionPlayClientProps) {
  const [progress, setProgress] = useState<ExceptionRoomState | null>(null);
  const [launch, setLaunch] = useState<RunLaunch | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const restored = previewSelected ? null : loadActiveExceptionRun(mode);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate browser-only progress and resumable run once
    setProgress(loadExceptionRoomState());
    setLaunch({
      seed: previewSelected ? 20260716 : restored?.seed ?? randomSeed(),
      restored,
    });
  }, [mode, previewSelected]);

  useEffect(() => {
    if (!launch || started.current) return;
    started.current = true;
    trackException({ name: 'exception_run_started', mode, seed: launch.seed });
  }, [launch, mode]);

  if (!progress || !launch) {
    return (
      <GameEntryLoading
        gameName="Exception Room"
        description="Restoring the active case, evidence, and queue state."
        theme="exception-room"
      />
    );
  }

  const handleComplete = (score: ScoreBreakdown, completedMode: ActiveExceptionMode) => {
    setProgress((current) => {
      if (!current) return current;
      const next = completedMode === 'practice'
        ? recordPracticeCompletion(current)
        : recordCampaignCompletion(current, score.profile);
      saveExceptionRoomState(next);
      return next;
    });
  };

  const handleNewRun = () => {
    clearActiveExceptionRun();
    const nextSeed = randomSeed();
    started.current = false;
    setLaunch({ seed: nextSeed, restored: null });
  };

  return (
    <main className="exception-world">
      <ExceptionRunScreen
        key={`${mode}:${launch.seed}`}
        seed={launch.seed}
        mode={mode}
        totalXp={progress.xp}
        initialState={previewSelected ? selectedVisualPreview(launch.seed) : launch.restored?.run}
        initialPhase={launch.restored?.phase}
        initialDecision={launch.restored?.lastDecision}
        persistState={!previewSelected}
        onComplete={handleComplete}
        onNewRun={handleNewRun}
      />
    </main>
  );
}
