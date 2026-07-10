'use client';

import { useState } from 'react';
import { PressButton } from '@/components/juice/PressButton';
import { track } from '@/lib/analytics';

export function ShareGrid({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = typeof navigator !== 'undefined' && !!navigator.clipboard;

  if (!canCopy) {
    return <textarea readOnly value={text} className="w-full rounded-2xl bg-surface p-3 text-sm" rows={2} aria-label="Share text" />;
  }
  return (
    <PressButton
      color="brand"
      className="w-full"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          track('share_clicked', {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
    >
      <span aria-live="polite">{copied ? 'Copied!' : 'Share result'}</span>
    </PressButton>
  );
}
