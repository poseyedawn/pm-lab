import { LabMark } from '@/components/lab/LabMark';
import { LabProfileSummary } from '@/components/lab/LabProfileSummary';
import { PortfolioReturnLink } from '@/components/lab/PortfolioReturnLink';

export function LabHeader() {
  return (
    <header className="border-b border-ink/10 bg-surface/80">
      <nav className="flex items-center justify-between gap-3 px-5 py-1 min-[360px]:px-7" aria-label="Lab navigation">
        <LabMark />
        <div className="flex items-center gap-3 min-[360px]:gap-5">
          <LabProfileSummary variant="compact" />
          <PortfolioReturnLink />
        </div>
      </nav>
    </header>
  );
}
