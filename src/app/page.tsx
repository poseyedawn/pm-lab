import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';
import { LabLanding } from '@/components/lab/LabLanding';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';

const featuredScenario = generateScenario(campaignSeed(1, 1), 'clean-win');

export default function LabHome() {
  return (
    <main>
      <AnalyticsViewTracker surface="lab" />
      <LabLanding scenario={featuredScenario} />
    </main>
  );
}
