'use client';

const STYLES = {
  brand: 'bg-brand text-white shadow-[0_4px_0_var(--color-brand-deep)]',
  win: 'bg-win text-white shadow-[0_4px_0_var(--color-win-deep)]',
  lose: 'bg-lose text-white shadow-[0_4px_0_var(--color-lose-deep)]',
  sky: 'bg-sky text-white shadow-[0_4px_0_var(--color-sky-deep)]',
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
