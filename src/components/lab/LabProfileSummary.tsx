'use client';

import { useLabProfile } from '@/hooks/lab/useLabProfile';
import type { GameId } from '@/types/lab';

interface LabProfileSummaryProps {
  variant: 'compact' | 'card';
  gameId?: GameId;
}

export function LabProfileSummary({ variant, gameId }: LabProfileSummaryProps) {
  const { ready, profile, totalXp } = useLabProfile();
  const selectedProgress = gameId ? profile.games[gameId] : null;

  if (variant === 'compact') {
    return (
      <p className="text-sm font-extrabold text-ink-soft" aria-live="polite" aria-busy={!ready}>
        {gameId ? selectedProgress?.xp ?? 0 : totalXp} XP
      </p>
    );
  }

  const gameCount = Object.values(profile.games).filter(Boolean).length;
  const milestoneCount = Object.values(profile.games)
    .reduce((total, progress) => total + (progress?.completedMilestones.length ?? 0), 0);

  return (
    <section className="rounded-[var(--radius-card)] bg-surface p-5 shadow-lg" aria-busy={!ready}>
      <p className="text-sm font-extrabold uppercase tracking-wide text-ink-soft">Your Lab progress</p>
      <p className="mt-2 text-2xl font-extrabold text-ink">{totalXp} XP</p>
      <p className="mt-1 text-sm text-ink-soft">
        {gameCount === 0
          ? 'Your progress will appear here after your first experiment.'
          : `${milestoneCount} milestone${milestoneCount === 1 ? '' : 's'} across ${gameCount} game${gameCount === 1 ? '' : 's'}.`}
      </p>
    </section>
  );
}
