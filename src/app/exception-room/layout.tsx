import type { Metadata } from 'next';
import './exception-room.css';

export const metadata: Metadata = {
  title: "Exception Room | Alvin's Lab",
  description: 'A mobile operations simulation about judgment under finite review capacity.',
};

export default function ExceptionRoomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
