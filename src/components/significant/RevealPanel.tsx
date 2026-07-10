'use client';

import type { Call, Scenario } from '@/lib/engine/types';
import { CountUp } from '@/components/juice/CountUp';
import { PressButton } from '@/components/juice/PressButton';

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
    <section className={`rounded-[var(--radius-card)] p-6 text-white shadow-lg ${correct ? 'bg-win-deep' : 'bg-lose-deep'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">{correct ? 'Correct call!' : 'Not this time'}</h3>
        <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">{s.truth.trapName}</span>
      </div>
      <p className="mt-1 text-sm opacity-90">
        You said {CALL_LABEL[call]} · the right call was {CALL_LABEL[s.truth.correctCall]} · true lift {s.truth.trueLiftPct >= 0 ? '+' : ''}{s.truth.trueLiftPct.toFixed(1)}%
      </p>
      <p className="mt-3 leading-relaxed">{s.truth.explanation}</p>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-extrabold" aria-live="polite">
          +<CountUp value={xpEarned} /> XP{crit && <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs">CRITICAL INSIGHT ×2</span>}
        </p>
        <PressButton color="brand" onClick={onNext} className="bg-white !text-ink shadow-[0_4px_0_rgba(0,0,0,0.25)]">Next</PressButton>
      </div>
    </section>
  );
}
