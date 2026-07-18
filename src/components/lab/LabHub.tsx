'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowSquareOut,
  Star,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { FloatingGameCard } from '@/components/lab/FloatingGameCard';
import { useLabProfile } from '@/hooks/lab/useLabProfile';
import { usePreferences } from '@/hooks/lab/usePreferences';
import { LAB_GAMES } from '@/lib/gameCatalog';
import { track } from '@/services/analyticsService';

export function LabHub() {
  const { ready, profile, totalXp } = useLabProfile();
  const { reducedMotion } = usePreferences();

  const handlePortfolioClick = () => {
    track('portfolio_returned', { entrySurface: 'lab' });
  };

  return (
    <div className="lab-hub" data-lab-chrome="immersive">
      <header className="lab-hub-hero">
        <nav className="lab-hub-nav" aria-label="Lab navigation">
          <Link className="lab-hub-brand" href="/" aria-label="Alvin's Product Lab home">
            <span className="lab-hub-brand-mark" aria-hidden="true">
              <Image src="/lab/flask.webp" alt="" width={32} height={40} priority />
            </span>
            <Image
              className="lab-hub-brand-wordmark"
              src="/lab/product-lab-wordmark.svg"
              alt=""
              width={128}
              height={16}
              priority
            />
          </Link>
          <div className="lab-hub-nav-actions">
            <span className="lab-hub-total-xp" aria-label={`${ready ? totalXp : 0} experience points`}>
              <Star size={14} weight="fill" aria-hidden="true" />
              {ready ? totalXp : 0} XP
            </span>
            <a
              className="lab-hub-portfolio"
              href="https://alvn.io"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handlePortfolioClick}
              aria-label="Portfolio (opens in a new tab)"
            >
              <span>Portfolio</span>
              <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </nav>

        <div className="lab-hub-title-lockup">
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-spark lab-hub-ambient-spark-left"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [-3, 3, -3], rotate: [0, 14, 0] }}
            transition={reducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/lab/sparkle.webp" alt="" width={12} height={13} />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-ring"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [3, -4, 3], rotate: [0, -8, 0] }}
            transition={reducedMotion ? undefined : { duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/lab/ring.webp" alt="" width={27} height={28} />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-bubble lab-hub-ambient-bubble-left"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [-4, 4, -4], x: [-1, 2, -1] }}
            transition={reducedMotion ? undefined : { duration: 6.1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/lab/bubble.webp" alt="" width={22} height={23} />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-bubble lab-hub-ambient-bubble-right"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [3, -4, 3], x: [1, -2, 1] }}
            transition={reducedMotion ? undefined : { duration: 5.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/lab/bubble.webp" alt="" width={16} height={17} />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-squiggle"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [-2, 4, -2], rotate: [-4, 5, -4] }}
            transition={reducedMotion ? undefined : { duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/lab/squiggle.webp" alt="" width={22} height={13} />
          </motion.span>
          <h1 className="lab-hub-title-logo">
            <span className="sr-only">Pick a field test</span>
            <Image
              src="/lab/pick-field-test-logo.svg"
              alt=""
              width={660}
              height={225}
              priority
            />
          </h1>
          <p>Small games that make product judgment visible.</p>
        </div>
      </header>

      <nav aria-label="Games" className="lab-hub-games">
        <ol>
          {LAB_GAMES.map((game, index) => {
            const xp = profile.games[game.gameId]?.xp ?? 0;
            return (
              <FloatingGameCard
                key={game.gameId}
                game={game}
                index={index}
                reducedMotion={reducedMotion}
                xp={ready ? xp : 0}
              />
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
