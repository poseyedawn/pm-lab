'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { iqTitle, type LevelStatus } from '@/hooks/useCampaign';
import { fireConfetti } from '@/components/juice/confetti';
import { PressButton } from '@/components/juice/PressButton';
import { track } from '@/lib/analytics';

export function IQCard({ levels, xp }: { levels: LevelStatus[]; xp: number }) {
  // Gating means finishing implies all levels passed eventually — so the score
  // that differentiates players is FIRST-TRY correct calls (3-star levels).
  const firstTry = levels.filter((l) => l.stars === 3).length;
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    fireConfetti({ big: true, reducedMotion });
  }, [reducedMotion]);

  const shareText = `Significant — Experimentation IQ: ${iqTitle(firstTry)} (${firstTry}/10 first try, ${xp} XP)\nCan you beat the traps? ${typeof window !== 'undefined' ? window.location.origin : ''}/significant`;

  return (
    <section className="rounded-[var(--radius-card)] bg-brand p-6 text-center text-white shadow-xl">
      <p className="text-sm font-extrabold uppercase tracking-wide opacity-80">Experimentation IQ</p>
      <h2 className="mt-2 text-3xl font-extrabold">{iqTitle(firstTry)}</h2>
      <p className="mt-1 text-lg">{firstTry}/10 on the first try · {xp} XP</p>
      <div className="mt-4 flex justify-center gap-2">
        {levels.map((l) => (
          <span key={l.id} className={`h-3 w-3 rounded-full ${l.stars === 3 ? 'bg-gold' : l.stars > 0 ? 'bg-white' : 'bg-white/30'}`} aria-hidden />
        ))}
      </div>
      <PressButton
        color="sky"
        className="mt-5 w-full bg-white !text-ink shadow-[0_4px_0_rgba(0,0,0,0.25)]"
        onClick={() => navigator.clipboard?.writeText(shareText).then(() => track('share_clicked', {})).catch(() => {})}
      >
        Copy result to share
      </PressButton>
    </section>
  );
}
