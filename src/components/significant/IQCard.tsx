'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { iqTitle, type LevelStatus } from '@/hooks/useCampaign';
import { fireConfetti } from '@/components/juice/confetti';
import { ShareControl } from '@/components/significant/ShareControl';
import { usePreferences } from '@/hooks/lab/usePreferences';

export function IQCard({
  levels, xp, celebrate,
}: { levels: LevelStatus[]; xp: number; celebrate: boolean }) {
  // Gating means finishing implies all levels passed eventually — so the score
  // that differentiates players is FIRST-TRY correct calls (3-star levels).
  const firstTry = levels.filter((l) => l.stars === 3).length;
  const { reducedMotion } = usePreferences();

  useEffect(() => {
    // Confetti only on the visit that first completes the campaign — the card
    // itself still renders on every later visit.
    if (celebrate) fireConfetti({ big: true, reducedMotion });
  }, [reducedMotion, celebrate]);

  const shareText = `Significant — Experimentation IQ: ${iqTitle(firstTry)} (${firstTry}/10 first try, ${xp} XP)\nCan you beat the traps? ${typeof window !== 'undefined' ? window.location.origin : ''}/significant`;

  return (
    <section className="significant-card rounded-[var(--radius-card)] p-5 text-center">
      <Image src="/significant/correct-medal.webp" alt="" width={720} height={720} sizes="144px" className="mx-auto h-36 w-36 rounded-3xl mix-blend-multiply" />
      <p className="text-sm font-extrabold uppercase tracking-wide text-coral-deep">Experimentation IQ</p>
      <h2 className="significant-section-title mt-2 text-2xl text-ink">{iqTitle(firstTry)}</h2>
      <p className="mt-1 text-base text-ink-soft">{firstTry}/10 on the first try · {xp} XP</p>
      <div className="mt-4 flex justify-center gap-2">
        {levels.map((l) => (
          <span key={l.id} className={`h-3 w-3 rounded-full ${l.stars === 3 ? 'bg-gold' : l.stars > 0 ? 'bg-cyan' : 'bg-ink/10'}`} aria-hidden />
        ))}
      </div>
      <ShareControl
        text={shareText}
        surface="profile"
        label="Copy result to share"
        color="sky"
        className="mt-5 w-full"
      />
    </section>
  );
}
