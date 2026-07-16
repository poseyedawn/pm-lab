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
        src={correct ? '/significant/correct-medal.webp' : '/significant/learning-medal.webp'}
        alt=""
        width={720}
        height={720}
        sizes="240px"
        className="significant-result-art"
      />
      <p className="significant-result-kicker">Calibration complete</p>
      <h1 className="significant-result-title">
        {correct ? 'You found the signal.' : 'Signal decoded.'}
      </h1>
      <p className="significant-result-copy">
        You called <strong>{CALL_LABELS[call]}</strong>. {correct ? 'Correct — ' : `The right call was ${rightCall} — `}
        the whole range stays above zero.
      </p>
      <div className="significant-result-score">
        <span>{correct ? 'Clean signal' : 'New insight'}</span>
        <span>{earnedBaseline ? `+${baselineXp} baseline XP` : 'Calibration replayed'}</span>
      </div>
      <button type="button" onClick={onContinue} className="significant-sun-button">
        Enter the campaign <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </section>
  );
}
