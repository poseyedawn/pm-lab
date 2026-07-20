'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChartBar, Clock } from '@phosphor-icons/react';
import { useSignificantLanding } from '@/hooks/significant/useSignificantLanding';
import { significantLandingHref } from '@/lib/significant/landing';
import type { Scenario } from '@/lib/engine/types';
import { track } from '@/services/analyticsService';

interface SignificantLandingProps {
  scenario: Scenario;
}

export function SignificantLanding({ scenario }: SignificantLandingProps) {
  const { ready, totalXp, completedCases, isReturning, nextLevel } = useSignificantLanding();
  const href = significantLandingHref({ completedCases, isReturning, nextLevel });
  const totalUsers = scenario.totals.nA + scenario.totals.nB;
  const ctaLabel = ready && isReturning ? `Resume level ${nextLevel}` : 'Start the field test';

  const handleStart = () => {
    track('game_selected', { gameId: 'significant', placement: 'lab_primary' });
  };

  return (
    <section className="significant-entry" aria-labelledby="significant-entry-title">
      <Image
        src="/significant/entry-world.webp"
        alt=""
        fill
        priority
        sizes="390px"
        className="significant-entry-art"
      />

      <div className="significant-entry-content">
        <header className="significant-entry-heading">
          <p className="significant-entry-eyebrow">Product Lab <span aria-hidden>{'//'}</span> Field Test 01</p>
          <h1 id="significant-entry-title" className="significant-entry-title">Significant</h1>
          <p className="significant-entry-tagline">Trust your product instinct.</p>
        </header>

        <p className="sr-only">
          Preview experiment: {scenario.hypothesis}. {totalUsers.toLocaleString()} simulated users over {scenario.daysRun} days.
        </p>

        <div className="significant-entry-launch">
          <p className="significant-entry-status">
            {ready && isReturning ? `${completedCases} cases complete · ${totalXp} XP` : 'Preparing your first experiment…'}
          </p>
          <div className="significant-entry-progress" aria-hidden>
            <span className="is-active" />
            <span />
            <span />
          </div>
          <ol className="significant-entry-steps" aria-label="How the field test works">
            <li><strong>1</strong><span>Inspect<br />the data</span></li>
            <li><strong>2</strong><span>Trust your<br />instinct</span></li>
            <li><strong>3</strong><span>Make an<br />impact</span></li>
          </ol>

          <Link href={href} onClick={handleStart} className="significant-entry-cta">
            <span>{ctaLabel}</span>
            <ArrowRight size={22} weight="bold" aria-hidden />
          </Link>

          <p className="significant-entry-meta">
            <span><ChartBar size={16} weight="bold" aria-hidden /> Real simulated data</span>
            <span><Clock size={16} weight="bold" aria-hidden /> About 30 seconds</span>
          </p>

          {ready && isReturning && (
            <Link href="/significant/calibration?replay=1" className="significant-entry-replay">
              Replay calibration
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
