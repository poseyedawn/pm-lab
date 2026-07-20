'use client';

import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react';
import { useEffect, useRef } from 'react';
import type { Call, Scenario } from '@/lib/engine/types';

interface CalibrationRevealProps {
  scenario: Scenario;
  call: Call;
  correct: boolean;
  reason: string;
  stepNumber: number;
  totalSteps: number;
  isFinalRound: boolean;
  xpEarned: number;
  isReplay: boolean;
  onContinue: () => void;
}

const CALL_LABELS = {
  ship: 'Ship',
  kill: 'Kill',
  keep: 'Keep Running',
} satisfies Record<Call, string>;

export function CalibrationReveal({
  scenario,
  call,
  correct,
  reason,
  stepNumber,
  totalSteps,
  isFinalRound,
  xpEarned,
  isReplay,
  onContinue,
}: CalibrationRevealProps) {
  const rightCall = CALL_LABELS[scenario.truth.correctCall];
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <section role="status" aria-live="polite" className="flex w-full flex-col items-center">
      <Image
        src={correct ? '/significant/correct-medal.webp' : '/significant/review-signal.webp'}
        alt=""
        width={720}
        height={720}
        sizes="240px"
        className={`significant-result-art ${correct ? '' : 'significant-result-art-review'}`}
      />
      <p className="significant-result-kicker">
        {correct ? 'Calibration' : 'Review'} {stepNumber} of {totalSteps}
      </p>
      <h1 ref={titleRef} tabIndex={-1} className="significant-result-title">
        {correct ? 'You found the signal.' : 'That call missed the signal.'}
      </h1>

      {correct ? (
        <p className="significant-result-copy">
          You called <strong>{CALL_LABELS[call]}</strong>. {reason}
        </p>
      ) : (
        <>
          <div className="significant-result-comparison" aria-label={`You chose ${CALL_LABELS[call]}. The better call was ${rightCall}.`}>
            <div><span>Your call</span><strong>{CALL_LABELS[call]}</strong></div>
            <ArrowRight size={20} weight="bold" aria-hidden />
            <div><span>Better call</span><strong>{rightCall}</strong></div>
          </div>
          <div className="significant-result-explanation">
            <p>What to notice</p>
            <p>{reason}</p>
          </div>
        </>
      )}

      {correct ? (
        <div className="significant-result-score">
          <span>{isFinalRound ? 'Three rounds complete' : 'Definition locked'}</span>
          <span>
            {isReplay
              ? 'Calibration replayed'
              : `+${xpEarned} calibration XP`}
          </span>
        </div>
      ) : (
        <p className="significant-result-practice-note">
          {isFinalRound ? 'Review the definition, then enter the campaign.' : 'Review the definition, then try the next signal.'}
        </p>
      )}
      <button
        type="button"
        onClick={onContinue}
        className={correct ? 'significant-sun-button' : 'significant-review-button'}
      >
        {isFinalRound ? 'Enter the campaign' : 'Next calibration round'} <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </section>
  );
}
