'use client';

import Link from 'next/link';
import { LockSimple, Star } from '@phosphor-icons/react';
import type { LevelStatus } from '@/hooks/useCampaign';

export function LevelPath({ levels }: { levels: LevelStatus[] }) {
  return (
    <section className="significant-card rounded-[var(--radius-card)] p-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-coral-deep">Campaign path</p>
          <h2 className="font-extrabold text-ink">Ten product calls</h2>
        </div>
        <p className="text-xs font-extrabold text-ink-soft">1 to 3 stars each</p>
      </div>
      <ol className="significant-progress-grid">
        {levels.map((level) => {
          const nodeClass = level.status === 'done'
            ? 'bg-win text-white'
            : level.status === 'open'
              ? 'bg-brand text-white'
              : 'bg-[#eee5ef] text-ink-soft';
          const content = (
            <span className={`significant-level-node ${nodeClass}`}>
              {level.status === 'locked' ? (
                <LockSimple size={18} weight="fill" aria-hidden />
              ) : (
                <span className="flex flex-col items-center">
                  <strong>{level.id}</strong>
                  <span className="mt-0.5 flex" aria-hidden>
                    {[1, 2, 3].map((star) => (
                      <Star key={star} size={10} weight={level.stars >= star ? 'fill' : 'regular'} />
                    ))}
                  </span>
                </span>
              )}
            </span>
          );

          return (
            <li key={level.id}>
              {level.status === 'locked' ? (
                <span role="img" aria-label={`Level ${level.id} locked`}>{content}</span>
              ) : (
                <Link href={`/significant/play?level=${level.id}`} aria-label={`Play level ${level.id}`}>{content}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
