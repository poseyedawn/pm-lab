import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PortfolioReturnLink } from '@/components/lab/PortfolioReturnLink';
import { track } from '@/services/analyticsService';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PortfolioReturnLink', () => {
  it('keeps the game open while returning to the portfolio in a new tab', () => {
    render(<PortfolioReturnLink />);

    const link = screen.getByRole('link', { name: /Portfolio \(opens in a new tab\)/i });
    expect(link).toHaveAttribute('href', 'https://alvn.io');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));

    fireEvent.click(link);
    expect(track).toHaveBeenCalledWith('portfolio_returned', { entrySurface: 'lab' });
  });
});
