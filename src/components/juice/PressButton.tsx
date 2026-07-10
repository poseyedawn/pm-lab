'use client';

const STYLES = {
  brand: 'bg-brand-deep text-white shadow-[0_4px_0_rgba(0,0,0,0.35)]',
  win: 'bg-win-deep text-white shadow-[0_4px_0_rgba(0,0,0,0.35)]',
  lose: 'bg-lose-deep text-white shadow-[0_4px_0_rgba(0,0,0,0.35)]',
  sky: 'bg-sky-deep text-white shadow-[0_4px_0_rgba(0,0,0,0.35)]',
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
