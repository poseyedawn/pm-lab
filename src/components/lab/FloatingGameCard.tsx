'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from '@phosphor-icons/react';
import {
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { useRef } from 'react';
import { track } from '@/services/analyticsService';
import type { GameCatalogEntry } from '@/types/lab';

interface FloatingGameCardProps {
  game: GameCatalogEntry;
  index: number;
  reducedMotion: boolean;
  xp: number;
}

const FLOAT_SETTINGS = [
  { distance: 5, duration: 5.6, delay: 0, rotation: -1 },
  { distance: 4, duration: 6.2, delay: 0.8, rotation: 1.15 },
  { distance: 6, duration: 5.9, delay: 0.35, rotation: -1.05 },
] as const;

export function FloatingGameCard({
  game,
  index,
  reducedMotion,
  xp,
}: FloatingGameCardProps) {
  const didDrag = useRef(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useTransform(x, [-16, 16], [-4, 4]);
  const rotateX = useTransform(y, [-12, 12], [4, -4]);
  const float = FLOAT_SETTINGS[index] ?? FLOAT_SETTINGS[0];

  const handleDragStart = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    didDrag.current = true;
  };

  const handleDragEnd = () => {
    resetTimer.current = setTimeout(() => {
      didDrag.current = false;
    }, 320);
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (didDrag.current) {
      event.preventDefault();
      return;
    }

    track('game_selected', { gameId: game.gameId, placement: 'lab_primary' });
  };

  return (
    <motion.li
      className="lab-hub-card-float"
      animate={reducedMotion ? undefined : {
        y: [-float.distance, float.distance, -float.distance],
        scale: [1, 1.008, 1],
        rotate: [float.rotation, float.rotation + 0.3, float.rotation],
      }}
      initial={{ rotate: float.rotation }}
      transition={reducedMotion ? undefined : {
        duration: float.duration,
        delay: float.delay,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
    >
      <motion.div
        className="lab-hub-card-drag"
        tabIndex={-1}
        style={{ x, y, rotateX, rotateY }}
        drag={reducedMotion ? false : true}
        dragConstraints={{ top: -12, right: 16, bottom: 12, left: -16 }}
        dragElastic={0.12}
        dragMomentum={false}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 520, bounceDamping: 28 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileTap={reducedMotion ? undefined : { scale: 0.988 }}
      >
        <Link
          href={game.href}
          data-game-tile={game.gameId}
          className="lab-hub-card"
          onClick={handleClick}
          aria-label={`${game.name}. ${game.tagline} ${game.duration}. ${game.modeLabel}.`}
        >
          {game.art && (
            <Image
              src={game.art}
              alt=""
              fill
              sizes="(max-width: 639px) calc(100vw - 32px), 358px"
              className="lab-hub-card-art"
              priority={index === 0}
              draggable={false}
            />
          )}
          <span className="lab-hub-card-scrim" aria-hidden="true" />
          <span className="lab-hub-card-copy">
            <span className="lab-hub-card-eyebrow">Field test {game.fieldTest}</span>
            <span className="lab-hub-card-name">{game.name}</span>
            <span className="lab-hub-card-tagline">{game.tagline}</span>
            <span className="lab-hub-card-meta">
              <span>{game.duration}</span>
              <span aria-hidden="true">·</span>
              <span>{game.modeLabel}</span>
            </span>
            {xp > 0 && (
              <span className="lab-hub-card-progress">
                <Star size={13} weight="fill" aria-hidden="true" />
                {xp} XP
              </span>
            )}
          </span>
          <span className="lab-hub-card-action" aria-hidden="true">
            <Play size={23} weight="fill" />
          </span>
        </Link>
      </motion.div>
    </motion.li>
  );
}
