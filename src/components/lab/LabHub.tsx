'use client';

import Link from 'next/link';
import {
  ArrowSquareOut,
  Circle,
  CircleNotch,
  Flask,
  Sparkle,
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
              <Flask size={25} weight="fill" />
            </span>
            <span>Product Lab</span>
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
            className="lab-hub-ambient lab-hub-ambient-spark"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [-3, 3, -3], rotate: [0, 14, 0] }}
            transition={reducedMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkle size={19} weight="fill" />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-ring"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [3, -4, 3], rotate: [0, -8, 0] }}
            transition={reducedMotion ? undefined : { duration: 5.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CircleNotch size={32} weight="bold" />
          </motion.span>
          <motion.span
            className="lab-hub-ambient lab-hub-ambient-bubble"
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [-4, 4, -4], x: [-1, 2, -1] }}
            transition={reducedMotion ? undefined : { duration: 6.1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Circle size={21} weight="fill" />
          </motion.span>
          <p className="lab-hub-kicker">Pocket arcade</p>
          <h1>Pick a field test</h1>
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
