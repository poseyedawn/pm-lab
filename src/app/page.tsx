import { GameCard } from '@/components/lab/GameCard';
import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';

export default function LabHome() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <AnalyticsViewTracker surface="lab" />
      <header className="pt-8">
        <h1 className="text-3xl font-extrabold">Alvin&apos;s Lab</h1>
        <p className="mt-2 text-ink-soft">
          Small games about product craft — built with AI, designed like real products.
        </p>
      </header>
      <GameCard
        href="/significant"
        title="Significant"
        tagline="Would you ship it? An A/B-testing intuition game where the data knows the truth."
        accent="bg-brand"
      />
      <footer className="flex flex-col gap-2 text-center text-sm text-ink-soft">
        <p>More experiments brewing.</p>
        <p>Progress stays in your browser. We use aggregate analytics to improve the games.</p>
      </footer>
    </main>
  );
}
