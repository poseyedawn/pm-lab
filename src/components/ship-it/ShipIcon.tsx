'use client';

import {
  Bank,
  BaseballCap,
  Briefcase,
  Buildings,
  ChartBar,
  ChartLineUp,
  Code,
  CurrencyDollar,
  GearSix,
  Headset,
  Heart,
  Megaphone,
  PaintBrush,
  Scales,
  UserCircle,
  type Icon,
} from '@phosphor-icons/react';
import type { MeterId } from '@/lib/ship-it/types';

const AVATAR_ICONS: Readonly<Record<string, Icon>> = {
  '👩‍💻': Code,
  '🤵': Briefcase,
  '📣': Megaphone,
  '🎨': PaintBrush,
  '📊': ChartBar,
  '🧑‍💼': UserCircle,
  '🎧': Headset,
  '🧢': BaseballCap,
  '⚖️': Scales,
  '🏛️': Bank,
  '🏢': Buildings,
};

const METER_ICONS = {
  users: ChartLineUp,
  business: CurrencyDollar,
  team: Heart,
  tech: GearSix,
} satisfies Record<MeterId, Icon>;

const METER_COLORS = {
  users: 'text-sky-deep',
  business: 'text-gold-text',
  team: 'text-lose-deep',
  tech: 'text-brand-deep',
} satisfies Record<MeterId, string>;

interface ShipAvatarIconProps {
  avatar: string;
  className?: string;
}

export function ShipAvatarIcon({ avatar, className = '' }: ShipAvatarIconProps) {
  const AvatarIcon = AVATAR_ICONS[avatar] ?? UserCircle;

  return (
    <AvatarIcon
      aria-hidden
      data-testid="ship-avatar-icon"
      className={className}
      size={22}
      weight="duotone"
    />
  );
}

interface ShipMeterIconProps {
  id: MeterId;
  className?: string;
  size?: number;
  tone?: 'meter' | 'inverse';
}

export function ShipMeterIcon({
  id,
  className = '',
  size = 20,
  tone = 'meter',
}: ShipMeterIconProps) {
  const MeterIcon = METER_ICONS[id];
  const colorClass = tone === 'inverse' ? 'text-white' : METER_COLORS[id];

  return (
    <MeterIcon
      aria-hidden
      data-testid={`ship-meter-icon-${id}`}
      className={`${colorClass} ${className}`.trim()}
      size={size}
      weight="duotone"
    />
  );
}
