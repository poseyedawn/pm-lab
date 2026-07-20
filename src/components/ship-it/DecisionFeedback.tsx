'use client';

import { METER_INFO, type DecisionFeedback as DecisionFeedbackData } from '@/lib/ship-it/types';

const integrityLabel = {
  protected: 'Integrity protected',
  'review-required': 'Review required',
  breach: 'Integrity breach',
} as const;

const integrityClass = {
  protected: 'border-win/40 bg-win/10 text-win-text',
  'review-required': 'border-gold/60 bg-gold/15 text-ink',
  breach: 'border-lose/50 bg-lose/10 text-lose-deep',
} as const;

interface DecisionFeedbackProps {
  feedback: DecisionFeedbackData;
}

export function DecisionFeedback({ feedback }: DecisionFeedbackProps) {
  const effects = Object.entries(feedback.effects);
  const integrity = feedback.guidance.integrity;

  return (
    <section
      aria-label="Decision receipt"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-ink/10 bg-surface/95 p-4 shadow"
    >
      <div className="ship-it-decision-header flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft">Last decision</p>
          <p className="font-extrabold text-ink">{feedback.choiceLabel}</p>
        </div>
        <div className="ship-it-decision-effects flex flex-wrap justify-end gap-1" aria-label="Meter changes">
          {effects.map(([meter, delta]) => {
            const info = METER_INFO[meter as keyof typeof METER_INFO];
            return (
              <span
                key={meter}
                className={`rounded-full px-2 py-1 text-xs font-extrabold ${
                  delta > 0 ? 'bg-win/15 text-win-text' : 'bg-lose/10 text-lose-deep'
                }`}
              >
                {info.label} {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
              </span>
            );
          })}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink">{feedback.guidance.why}</p>
      <p className="text-xs leading-relaxed text-ink-soft">
        <span className="font-extrabold text-ink">Model assumption:</span> {feedback.guidance.assumption}
      </p>

      {integrity && (
        <div className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${integrityClass[integrity.outcome]}`}>
          <span className="font-extrabold">{integrityLabel[integrity.outcome]}:</span> {integrity.boundary}
        </div>
      )}
    </section>
  );
}
