import { ArrowClockwise, ArrowLeft, ShieldCheck, Speedometer, Timer } from '@phosphor-icons/react';
import Link from 'next/link';
import type { ScoreBreakdown } from '@/lib/exception-room/types';

interface ShiftSummaryProps {
  score: ScoreBreakdown;
  totalXp: number;
  onNewRun: () => void;
}

export function ShiftSummary({ score, totalXp, onNewRun }: ShiftSummaryProps) {
  return (
    <section className="exception-debrief">
      <p className="exception-kicker">CAMPAIGN COMPLETE</p>
      <h1>{score.profile.toUpperCase()}</h1>
      <p className="exception-debrief-copy">Your operating profile reflects how you balanced safety, service, and finite review capacity.</p>
      <div className="exception-score-grid">
        <Score label="Safety" value={score.safety} icon={<ShieldCheck size={22} weight="fill" />} />
        <Score label="Service" value={score.service} icon={<Timer size={22} weight="fill" />} />
        <Score label="Capacity" value={score.capacity} icon={<Speedometer size={22} weight="fill" />} />
      </div>
      <div className="exception-debrief-details">
        <p><span>Safe completions</span><b>{score.safeCompletions}</b></p>
        <p><span>Service breaches</span><b>{score.serviceBreaches}</b></p>
        <p><span>Evidence inspected</span><b>{score.evidenceInspectionRate}%</b></p>
        <p><span>Lab XP</span><b>{totalXp}</b></p>
      </div>
      <button type="button" className="exception-primary-button" onClick={onNewRun}><ArrowClockwise size={20} weight="bold" /> RUN A NEW QUEUE</button>
      <Link href="/exception-room" className="exception-secondary-button"><ArrowLeft size={18} weight="bold" /> BACK TO BRIEFING</Link>
    </section>
  );
}

function Score({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div>{icon}<b>{value}</b><small>{label.toUpperCase()}</small></div>;
}
