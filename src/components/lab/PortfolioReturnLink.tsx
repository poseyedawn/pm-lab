'use client';

import { usePathname } from 'next/navigation';
import { ArrowSquareOut } from '@phosphor-icons/react';
import { track } from '@/services/analyticsService';

export function PortfolioReturnLink() {
  const pathname = usePathname();
  const entrySurface = pathname.startsWith('/significant/about')
    ? 'case_study'
    : pathname.startsWith('/significant') ? 'significant' : 'lab';

  return (
    <a
      href="https://alvn.io"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Portfolio (opens in a new tab)"
      onClick={() => track('portfolio_returned', { entrySurface })}
      className="inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-brand-deep underline decoration-2 underline-offset-4"
    >
      Portfolio
      <ArrowSquareOut size={16} weight="bold" aria-hidden />
    </a>
  );
}
