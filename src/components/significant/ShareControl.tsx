'use client';

import { useEffect, useState } from 'react';
import { PressButton } from '@/components/juice/PressButton';
import { track } from '@/services/analyticsService';
import { canCopyText, copyText } from '@/services/shareService';

interface ShareControlProps {
  text: string;
  surface: 'daily' | 'profile';
  label: string;
  color: 'brand' | 'sky';
  className?: string;
}

type ShareStatus = 'idle' | 'copied' | 'failed';

export function ShareControl({ text, surface, label, color, className = '' }: ShareControlProps) {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [copyAvailable, setCopyAvailable] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability is unavailable during server rendering
    setCopyAvailable(canCopyText());
  }, []);

  useEffect(() => {
    if (status !== 'copied') return;
    const timeoutId = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  if (!copyAvailable) {
    return (
      <div className="flex flex-col gap-2">
        <textarea readOnly value={text} className="w-full rounded-2xl bg-surface p-3 text-sm" rows={2} aria-label="Share text" />
        <p className="text-xs text-ink-soft">Copy isn&apos;t available here. Select the text above instead.</p>
      </div>
    );
  }

  const handleCopy = async () => {
    track('share_attempted', { surface, method: 'clipboard' });
    const result = await copyText(text);
    if (result.ok) {
      track('share_succeeded', { surface, method: 'clipboard' });
      setStatus('copied');
      return;
    }

    track('share_failed', { surface, method: 'clipboard', reason: result.reason });
    setStatus('failed');
  };

  return (
    <div className="flex flex-col gap-2">
      <PressButton color={color} className={className} onClick={handleCopy}>
        {status === 'copied' ? 'Copied!' : label}
      </PressButton>
      {status === 'failed' && (
        <textarea
          readOnly
          value={text}
          className="w-full rounded-2xl bg-surface p-3 text-sm"
          rows={2}
          aria-label="Share text"
        />
      )}
      <p className="min-h-4 text-xs text-ink-soft" aria-live="polite">
        {status === 'copied' ? 'Result copied.' : ''}
        {status === 'failed' ? 'Copy did not work. Select the text above instead.' : ''}
      </p>
    </div>
  );
}
