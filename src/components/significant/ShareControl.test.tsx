import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareControl } from '@/components/significant/ShareControl';
import { track } from '@/services/analyticsService';
import { canCopyText, copyText } from '@/services/shareService';

vi.mock('@/services/analyticsService', () => ({ track: vi.fn() }));
vi.mock('@/services/shareService', () => ({ canCopyText: vi.fn(), copyText: vi.fn() }));

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(canCopyText).mockReturnValue(true);
  vi.mocked(copyText).mockResolvedValue({ ok: true });
});

describe('ShareControl', () => {
  it('shows confirmation and success analytics after copy resolves', async () => {
    render(<ShareControl text="result" surface="daily" label="Share result" color="brand" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Share result' }));

    expect(await screen.findByText('Result copied.')).toBeInTheDocument();
    expect(track).toHaveBeenNthCalledWith(1, 'share_attempted', { surface: 'daily', method: 'clipboard' });
    expect(track).toHaveBeenNthCalledWith(2, 'share_succeeded', { surface: 'daily', method: 'clipboard' });
  });

  it('shows a useful error and categorized failure analytics', async () => {
    vi.mocked(copyText).mockResolvedValue({ ok: false, reason: 'permission' });
    render(<ShareControl text="result" surface="profile" label="Copy result" color="sky" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Copy result' }));

    expect(await screen.findByText(/Copy did not work/)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Share text' })).toHaveValue('result');
    expect(track).toHaveBeenLastCalledWith('share_failed', {
      surface: 'profile',
      method: 'clipboard',
      reason: 'permission',
    });
  });

  it('offers selectable text when clipboard copying is unavailable', async () => {
    vi.mocked(canCopyText).mockReturnValue(false);
    render(<ShareControl text="fallback result" surface="daily" label="Share result" color="brand" />);

    expect(await screen.findByRole('textbox', { name: 'Share text' })).toHaveValue('fallback result');
    expect(screen.getByText(/Select the text above instead/)).toBeInTheDocument();
  });
});
