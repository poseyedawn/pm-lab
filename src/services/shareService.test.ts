import { afterEach, describe, expect, it, vi } from 'vitest';
import { canCopyText, copyText } from '@/services/shareService';

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function setClipboard(value: Pick<Clipboard, 'writeText'> | undefined): void {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value });
}

afterEach(() => {
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
  vi.restoreAllMocks();
});
describe('share service', () => {
  it('reports success only after clipboard resolution', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });

    expect(canCopyText()).toBe(true);
    await expect(copyText('share me')).resolves.toEqual({ ok: true });
    expect(writeText).toHaveBeenCalledWith('share me');
  });

  it('returns an unavailable reason without clipboard support', async () => {
    setClipboard(undefined);
    await expect(copyText('share me')).resolves.toEqual({ ok: false, reason: 'unavailable' });
  });

  it('coarsens clipboard permission failures', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError')) });
    await expect(copyText('share me')).resolves.toEqual({ ok: false, reason: 'permission' });
  });

  it('coarsens other failures without exposing error text', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('private browser detail')) });
    await expect(copyText('share me')).resolves.toEqual({ ok: false, reason: 'unknown' });
  });
});
