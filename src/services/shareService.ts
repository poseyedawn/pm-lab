export type ShareFailureReason = 'unavailable' | 'permission' | 'unknown';
export type CopyTextResult = { ok: true } | { ok: false; reason: ShareFailureReason };

export function canCopyText(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function';
}
export async function copyText(text: string): Promise<CopyTextResult> {
  if (!canCopyText()) return { ok: false, reason: 'unavailable' };

  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (error) {
    if (error instanceof DOMException && ['NotAllowedError', 'SecurityError'].includes(error.name)) {
      return { ok: false, reason: 'permission' };
    }
    return { ok: false, reason: 'unknown' };
  }
}
