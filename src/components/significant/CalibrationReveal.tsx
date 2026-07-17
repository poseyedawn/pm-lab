import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react';
import type { Call, Scenario } from '@/lib/engine/types';

interface CalibrationRevealProps {
  scenario: Scenario;
  call: Call;
  correct: boolean;
  earnedBaseline: boolean;
  baselineXp: number;
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
  earnedBaseline,
  baselineXp,
  onContinue,
}: CalibrationRevealProps) {
  const rightCall = CALL_LABELS[scenario.truth.correctCall];

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
      <p className="significant-result-kicker">{correct ? 'Calibration complete' : 'Calibration review'}</p>
      <h1 className="significant-result-title">
        {correct ? 'You found the signal.' : 'That call missed the signal.'}
      </h1>

      {correct ? (
        <p className="significant-result-copy">
          You called <strong>{CALL_LABELS[call]}</strong>. Correct. The whole confidence interval stays above zero.
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
            <p>The whole confidence interval stays above zero. That makes Ship the stronger call.</p>
          </div>
        </>
      )}

      {correct ? (
        <div className="significant-result-score">
          <span>Clean signal</span>
          <span>{earnedBaseline ? `+${baselineXp} baseline XP` : 'Calibration replayed'}</span>
        </div>
      ) : (
        <p className="significant-result-practice-note">
          {earnedBaseline ? `${baselineXp} practice XP added. ` : ''}The campaign is ready when you are.
        </p>
      )}
      <button
        type="button"
        onClick={onContinue}
        className={correct ? 'significant-sun-button' : 'significant-review-button'}
      >
        {correct ? 'Enter the campaign' : 'Practice in the campaign'} <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </section>
  );
}
