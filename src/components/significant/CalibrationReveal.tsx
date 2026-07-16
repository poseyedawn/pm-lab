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
  return (
    <section className="calibration-reveal mt-2 rounded-2xl bg-ink p-4 text-white shadow-lg" role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-extrabold">{correct ? 'You found the signal.' : 'Now you know the signal.'}</p>
          <p className="mt-1 text-sm leading-5 text-white/85">
            You said {CALL_LABELS[call]}. {correct ? 'Correct' : `The right call is ${CALL_LABELS[scenario.truth.correctCall]}`} — the full interval stays above zero.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-win px-2.5 py-1 text-xs font-extrabold text-ink">Clean win</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="font-extrabold text-white">
          {earnedBaseline ? `+${baselineXp} baseline XP` : 'Calibration replayed'}
        </p>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-white px-3 text-sm font-extrabold text-ink shadow-[0_3px_0_rgba(0,0,0,0.25)] active:translate-y-0.5 active:shadow-none"
        >
          Campaign <ArrowRight size={17} weight="bold" aria-hidden />
        </button>
      </div>
    </section>
  );
}
