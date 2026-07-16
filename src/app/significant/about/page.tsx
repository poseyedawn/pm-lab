import Link from 'next/link';
import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';

export const metadata = { title: 'How Significant was designed' };

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-6 leading-relaxed">
      <AnalyticsViewTracker surface="case-study" />
      <h1 className="pt-4 text-2xl font-extrabold text-brand-deep">How Significant was designed</h1>

      <h2 className="text-lg font-extrabold">Why this game exists</h2>
      <p>
        The single hardest judgment call in product work is deciding what an experiment actually told you.
        Most A/B test mistakes aren&apos;t math errors — they&apos;re judgment errors: peeking early, trusting a
        huge lift on a tiny sample, ignoring a broken traffic split. Significant turns those failure modes
        into a game. Every readout is simulated from a hidden ground truth, so unlike real life, the game
        can tell you whether you were <em>actually</em> right.
      </p>

      <h2 className="text-lg font-extrabold">Key trade-offs</h2>
      <p>
        <strong>Generated, not hand-written.</strong> Scenarios come from 10 hand-designed trap archetypes with
        seeded random parameters — curated quality with infinite replay. <strong>Honest scenarios included.</strong>
        Two of the ten archetypes are clean wins and losses; if everything were a trap, the winning strategy
        would be reflexive cynicism instead of judgment. <strong>Local progress.</strong> The statistics engine,
        streaks, and progress run in your browser without an account.
      </p>

      <h2 className="text-lg font-extrabold">The engagement system (and its limits)</h2>
      <p>
        This game deliberately uses the retention psychology playbook: loss-aversion streaks with an earnable
        Streak Shield (Duolingo&apos;s Streak Freeze pattern), variable rewards (critical-insight rounds), endowed
        progress (your path starts pre-calibrated), amplified feedback on every action, and a daily puzzle with
        a shareable result. It also draws a line: no fake scarcity, no guilt copy, no notifications, sound and
        motion respect your preferences. We use Vercel&apos;s aggregate page analytics and a limited set of interaction
        events to understand where the game is useful or confusing. Those events exclude scenario text, seeds,
        clipboard contents, and your local progress profile. If you enjoyed the game,
        that was the design working — and now you know exactly which levers made it work.
      </p>

      <h2 className="text-lg font-extrabold">How it was built</h2>
      <p>
        Next.js + TypeScript on Vercel, built in collaboration with AI coding agents. The statistics are real:
        binomial simulation per arm per day, two-proportion z-tests, and an invariant test suite that verifies
        every archetype behaves like its trap across hundreds of seeds.
      </p>

      <p className="rounded-2xl bg-surface p-4 text-sm text-ink-soft">
        Privacy note: game progress stays on this device. Aggregate analytics record page and interaction categories,
        not the experiment content you saw or the text you copied.
      </p>

      <Link href="/significant" className="pb-8 text-center font-extrabold text-brand-deep underline">
        Back to the game
      </Link>
    </main>
  );
}
