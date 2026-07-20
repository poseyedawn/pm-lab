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
          Product teams still have to decide what an experiment supports. Significant turns early peeking,
          tiny samples, and broken traffic splits into short practice cases. The game scores the evidence shown
          before the call. Hidden simulator values never turn an unsupported choice into the right answer.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">Key trade-offs</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Ten seeded scenario types cover clean results and common experiment failures. Ship means the visible
          evidence supports release. Kill means it supports stopping the tested version. Keep Running means more
          valid evidence can still change the decision and continued exposure is acceptable. Progress stays in
          your browser without an account.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-extrabold">The engagement system and its limits</h2>
        <p className="mt-2 text-sm text-ink-soft">
          The game uses streaks, variable rewards, and a daily puzzle. It does not use fake scarcity, guilt copy,
          or notifications. Sound and motion follow your preferences. Analytics record coarse interaction events.
          Exception Room start events include a random run seed for reproducibility. We do not send scenario text,
          clipboard contents, or your local progress profile.
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
