import Link from 'next/link';

interface GameCardProps {
  href: string;
  title: string;
  tagline: string;
  accent: string; // tailwind bg class, e.g. 'bg-brand'
}

export function GameCard({ href, title, tagline, accent }: GameCardProps) {
  return (
    <Link href={href} className={`block rounded-[var(--radius-card)] ${accent} p-6 text-white shadow-lg transition-transform active:scale-95`}>
      <h2 className="text-xl font-extrabold">{title}</h2>
      <p className="mt-1 text-sm opacity-90">{tagline}</p>
      <p className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">Play →</p>
    </Link>
  );
}
