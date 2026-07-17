import { GameShell } from '@/components/game/GameShell';
import './significant.css';

export default function SignificantLayout({ children }: { children: React.ReactNode }) {
  return <GameShell gameId="significant">{children}</GameShell>;
}
