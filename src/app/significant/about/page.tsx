import Link from 'next/link';
import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';

export const metadata = { title: 'How Significant was designed' };

export default function AboutPage() {
  return (
    <main className="significant-about mx-auto flex max-w-md flex-col gap-4 leading-relaxed">
      <AnalyticsViewTracker surface="case-study" />
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral-deep">Behind the field test</p>
        <h1 className="significant-section-title mt-1 text-2xl text-ink">How Significant was designed</h1>
      </header>

      <section>
        <h2 className="text-lg font-extrabold">Why this game exists</h2>
        <p className="mt-2 text-sm text-ink-soft">
          The hardest judgment call in product work is deciding what an experiment actually told you.
          Significant turns early peeking, tiny samples, and broken traffic splits into a game. Every readout
          is simulated from a hidden ground truth, so the game can tell you whether you were actually right.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">Key trade-offs</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Scenarios come from ten hand-designed trap archetypes with seeded random parameters. Two archetypes
          are clean wins and losses so the winning strategy stays thoughtful judgment—not reflexive cynicism.
          Progress lives locally in your browser without an account.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">The engagement system—and its limits</h2>
        <p className="mt-2 text-sm text-ink-soft">
          The game uses streaks, variable rewards, amplified feedback, and a daily puzzle. It also draws a line:
          no fake scarcity, no guilt copy, and no notifications. Sound and motion respect your preferences, and
          aggregate analytics exclude scenario text, seeds, clipboard contents, and your local progress profile.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">How it was built</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Next.js and TypeScript on Vercel, built with AI coding agents. The statistics are real: binomial simulation
          per arm per day, two-proportion z-tests, and invariant tests across hundreds of seeds.
        </p>
      </section>

      <Link href="/significant" className="significant-sun-button px-4">Back to the game</Link>
    </main>
  );
}
