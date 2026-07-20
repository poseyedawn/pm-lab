'use client';

import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';
import { CountUp } from '@/components/juice/CountUp';

const CALL_LABEL: Record<Call, string> = { ship: 'Ship', kill: 'Kill', keep: 'Keep Running' };

interface RevealPanelProps {
  scenario: Scenario;
  call: Call;
  correct: boolean;
  xpEarned: number;
  crit: boolean;
  nextLabel: string;
  onNext: () => void;
}

export function RevealPanel({ scenario: s, call, correct, xpEarned, crit, nextLabel, onNext }: RevealPanelProps) {
  const chosenCall = CALL_LABEL[call];
  const betterCall = CALL_LABEL[s.truth.correctCall];
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section
      className={`significant-result min-h-[650px] rounded-[28px] ${correct ? 'significant-result-correct' : 'significant-result-review'}`}
      data-outcome={correct ? 'correct' : 'review'}
      role="status"
      aria-live="polite"
    >
      <Image
        src={correct ? '/significant/correct-medal.webp' : '/significant/review-signal.webp'}
        alt=""
        width={720}
        height={720}
        sizes="220px"
        className={`significant-result-art ${correct ? '' : 'significant-result-art-review'}`}
      />
      <p className="significant-result-kicker">{correct ? s.truth.trapName : `Review: ${s.truth.trapName}`}</p>
      <h2 ref={titleRef} tabIndex={-1} className="significant-result-title">
        {correct ? 'You found the signal.' : 'That call missed the signal.'}
      </h2>

      {correct ? (
        <p className="significant-result-copy">
          You chose <strong>{chosenCall}</strong>. That matches the evidence. {s.truth.explanation}
        </p>
      ) : (
        <>
          <div className="significant-result-comparison" aria-label={`You chose ${chosenCall}. The better call was ${betterCall}.`}>
            <div><span>Your call</span><strong>{chosenCall}</strong></div>
            <ArrowRight size={20} weight="bold" aria-hidden />
            <div><span>Better call</span><strong>{betterCall}</strong></div>
          </div>
          <div className="significant-result-explanation">
            <p>What to notice</p>
            <p>{s.truth.explanation}</p>
          </div>
        </>
      )}

      {correct && (
        <div className="significant-result-score">
          <span>+<CountUp value={xpEarned} /> XP</span>
          {crit && <span>Critical insight ×2</span>}
        </div>
      )}
      <button
        type="button"
        onClick={onNext}
        className={correct ? 'significant-sun-button' : 'significant-review-button'}
      >
        {nextLabel} <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </section>
  );
}
