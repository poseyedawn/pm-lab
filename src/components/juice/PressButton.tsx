'use client';

const STYLES = {
  brand: 'bg-brand-deep text-white shadow-[0_4px_0_#401875]',
  win: 'bg-win-deep text-white shadow-[0_4px_0_#0d682f]',
  lose: 'bg-coral text-white shadow-[0_4px_0_#aa2248]',
  sky: 'bg-cyan text-ink shadow-[0_4px_0_#208c92]',
} as const;

interface PressButtonProps {
  color: keyof typeof STYLES;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export function PressButton({ color, onClick, disabled, ariaLabel, className = '', children }: PressButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`btn-3d px-4 py-3 text-base disabled:opacity-40 disabled:shadow-none ${STYLES[color]} ${className}`}
    >
      {children}
    </button>
  );
}
