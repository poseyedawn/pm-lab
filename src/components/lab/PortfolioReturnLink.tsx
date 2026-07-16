'use client';

import { usePathname } from 'next/navigation';
import { track } from '@/services/analyticsService';

export function PortfolioReturnLink() {
  const pathname = usePathname();
  const entrySurface = pathname.startsWith('/significant/about')
    ? 'case_study'
    : pathname.startsWith('/significant') ? 'significant' : 'lab';

  return (
    <a
      href="https://alvn.io"
      onClick={() => track('portfolio_returned', { entrySurface })}
      className="text-sm font-extrabold text-ink-soft underline decoration-2 underline-offset-4"
    >
      Alvin&apos;s portfolio
    </a>
  );
}
