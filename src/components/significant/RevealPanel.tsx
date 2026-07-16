'use client';

import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react';
import type { Call, Scenario } from '@/lib/engine/types';
import { CountUp } from '@/components/juice/CountUp';

const CALL_LABEL: Record<Call, string> = { ship: 'Ship', kill: 'Kill', keep: 'Keep Running' };

interface RevealPanelProps {
  scenario: Scenario;
  call: Call;
  correct: boolean;
  xpEarned: number;
  crit: boolean;
  onNext: () => void;
}

export function RevealPanel({ scenario: s, call, correct, xpEarned, crit, onNext }: RevealPanelProps) {
  return (
    <section className="significant-result min-h-[650px] rounded-[28px]" role="status" aria-live="polite">
      <Image
        src={correct ? '/significant/correct-medal.webp' : '/significant/learning-medal.webp'}
        alt=""
        width={720}
        height={720}
        sizes="220px"
        className="significant-result-art"
      />
      <p className="significant-result-kicker">{s.truth.trapName}</p>
      <h2 className="significant-result-title">{correct ? 'You found the signal.' : 'Signal decoded.'}</h2>
      <p className="significant-result-copy">
        You said <strong>{CALL_LABEL[call]}</strong>. The right call was <strong>{CALL_LABEL[s.truth.correctCall]}</strong>.
        {' '}{s.truth.explanation}
      </p>
      <div className="significant-result-score">
        <span>+<CountUp value={xpEarned} /> XP</span>
        {crit && <span>Critical insight ×2</span>}
      </div>
      <button type="button" onClick={onNext} className="significant-sun-button">
        Next experiment <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </section>
  );
}
