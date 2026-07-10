'use client';

export function ComboFlame({ combo }: { combo: number }) {
  if (combo < 2) return null;
  return (
    <span className="animate-pulse rounded-full bg-gold px-3 py-1 text-sm font-extrabold text-ink" role="img" aria-label={`Combo multiplier ${Math.min(combo, 3)}x`}>
      ×{Math.min(combo, 3)} COMBO
    </span>
  );
}
