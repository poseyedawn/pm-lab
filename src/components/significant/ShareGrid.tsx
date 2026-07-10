'use client';

import { useState } from 'react';
import { PressButton } from '@/components/juice/PressButton';

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
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {});
      }}
    >
      {copied ? 'Copied!' : 'Share result'}
    </PressButton>
  );
}
