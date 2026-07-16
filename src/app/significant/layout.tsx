import { GameShell } from '@/components/game/GameShell';

export default function SignificantLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="significant">{children}</GameShell>;
}
