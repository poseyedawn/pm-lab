import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PressButton } from '@/components/juice/PressButton';
import { CountUp } from '@/components/juice/CountUp';
import { vibrate } from '@/components/juice/haptics';

describe('PressButton', () => {
  it('renders children and fires onClick', () => {
    const onClick = vi.fn();
    render(<PressButton color="win" onClick={onClick}>Ship</PressButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Ship' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('does not fire when disabled', () => {
    const onClick = vi.fn();
    render(<PressButton color="lose" onClick={onClick} disabled>Kill</PressButton>);
    fireEvent.click(screen.getByRole('button', { name: 'Kill' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('CountUp', () => {
  it('renders the final value', () => {
    render(<CountUp value={250} durationMs={0} />);
    expect(screen.getByText('250')).toBeInTheDocument();
  });
});

describe('haptics', () => {
  it('never throws without vibration support', () => {
    expect(() => vibrate(30)).not.toThrow();
  });

  it('does not vibrate when the player disabled haptics', () => {
    const navigatorVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: navigatorVibrate });
    vibrate(30, false);
    expect(navigatorVibrate).not.toHaveBeenCalled();
  });
});
