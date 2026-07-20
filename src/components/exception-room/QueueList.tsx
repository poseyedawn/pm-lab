'use client';

import { useEffect, useRef } from 'react';
import { CalendarDots, CaretRight, CheckCircle, FileText, Scales } from '@phosphor-icons/react';
import { caseTitle, dueLabel, routeReasonLabel } from '@/lib/exception-room/presentation';
import type { ScheduledExceptionCase } from '@/lib/exception-room/types';

interface QueueListProps {
  queue: readonly ScheduledExceptionCase[];
  selectedCaseId: string | null;
  tick: number;
  focusFirstSignal?: number;
  onSelect: (caseId: string) => void;
}

export function QueueList({ queue, selectedCaseId, tick, focusFirstSignal = 0, onSelect }: QueueListProps) {
  const firstCardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focusFirstSignal > 0) firstCardRef.current?.focus();
  }, [focusFirstSignal]);

  return (
    <section className="exception-queue" aria-labelledby="queue-title">
      <div className="exception-section-heading">
        <h2 id="queue-title">EXCEPTION QUEUE</h2>
        <span>{queue.length} OPEN</span>
      </div>
      <div className="exception-queue-list">
        {queue.map((candidate, index) => {
          const selected = selectedCaseId === candidate.id;
          const Icon = candidate.routeReasons.includes('missing-evidence')
            ? FileText
            : candidate.routeReasons.includes('policy-boundary')
              ? Scales
              : candidate.routeReasons.includes('random-quality-sample')
                ? CheckCircle
                : CalendarDots;
          return (
            <button
              key={candidate.id}
              ref={index === 0 ? firstCardRef : undefined}
              type="button"
              className={`exception-queue-card ${selected ? 'is-selected' : ''}`}
              onClick={() => onSelect(candidate.id)}
              aria-pressed={selected}
            >
              <span className={`exception-severity is-${candidate.consequence}`}><Icon size={20} weight="fill" /></span>
              <span className="exception-queue-number">{index + 1}</span>
              <span className="exception-queue-copy">
                <b>{caseTitle(candidate)}</b>
                <small>{routeReasonLabel(candidate.routeReasons[0])}</small>
              </span>
              <span className={`exception-due-tag is-${candidate.consequence}`}>
                <b>{candidate.consequence.toUpperCase()}</b>
                <small>{dueLabel(candidate.dueAtTick, tick)}</small>
              </span>
              <CaretRight size={18} weight="bold" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
