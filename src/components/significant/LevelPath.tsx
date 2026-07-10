'use client';

import Link from 'next/link';
import type { LevelStatus } from '@/hooks/useCampaign';

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? 'fill-gold' : 'fill-ink/15'}`} aria-hidden>
    <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.8l-5.3 2.8 1-5.8L1.5 7.7l5.9-.9z" />
  </svg>
);

export function LevelPath({ levels }: { levels: LevelStatus[] }) {
  return (
    <ol className="relative mx-auto flex w-full max-w-xs flex-col gap-6 py-4">
      {levels.map((lvl, i) => {
        const offset = i % 2 === 0 ? '-translate-x-10' : 'translate-x-10';
        const node = (
          <div
            className={`flex h-20 w-20 flex-col items-center justify-center rounded-full font-extrabold text-white shadow-lg transition-transform
              ${lvl.status === 'done' ? 'bg-win' : lvl.status === 'open' ? 'animate-pulse bg-brand' : 'bg-ink/20'}`}
          >
            <span className="text-xl">{lvl.id}</span>
            <span className="flex" aria-label={`${lvl.stars} stars`}>
              <Star filled={lvl.stars >= 1} /><Star filled={lvl.stars >= 3} /><Star filled={lvl.stars >= 3} />
            </span>
          </div>
        );
        return (
          <li key={lvl.id} className={`flex justify-center ${offset}`}>
            {lvl.status === 'locked' ? (
              <div aria-label={`Level ${lvl.id} locked`}>{node}</div>
            ) : (
              <Link href={`/significant/play?level=${lvl.id}`} aria-label={`Play level ${lvl.id}`} className="active:scale-95">
                {node}
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
