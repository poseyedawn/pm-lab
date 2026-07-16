import { GameCard } from '@/components/lab/GameCard';
import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';
import { LabProfileSummary } from '@/components/lab/LabProfileSummary';

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
      <LabProfileSummary variant="card" />
      <p className="text-center text-sm text-ink-soft">More experiments brewing.</p>
    </main>
  );
}
