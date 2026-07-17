import { AnalyticsViewTracker } from '@/components/analytics/AnalyticsViewTracker';
import { LabHub } from '@/components/lab/LabHub';

export default function LabHome() {
  return (
    <main>
      <AnalyticsViewTracker surface="lab" />
      <LabHub />
    </main>
  );
}
