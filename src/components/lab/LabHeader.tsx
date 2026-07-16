import { LabMark } from '@/components/lab/LabMark';
import { LabProfileSummary } from '@/components/lab/LabProfileSummary';
import { PortfolioReturnLink } from '@/components/lab/PortfolioReturnLink';

export function LabHeader() {
  return (
    <header className="border-b border-ink/10 bg-surface/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4" aria-label="Lab navigation">
        <LabMark />
        <div className="flex items-center gap-4">
          <LabProfileSummary variant="compact" />
          <PortfolioReturnLink />
        </div>
      </nav>
    </header>
  );
}
