import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(cleanup);
import { MetersHud } from '@/components/shipit/MetersHud';
import { HintDots } from '@/components/shipit/HintDots';

describe('MetersHud', () => {
  it('renders 4 labelled meters with accessible values and the week chip', () => {
    render(<MetersHud meters={{ users: 62, business: 18, team: 50, tech: 45 }} week={5} deltas={{}} />);
    expect(screen.getByRole('meter', { name: /users/i })).toHaveAttribute('aria-valuenow', '62');
    expect(screen.getByRole('meter', { name: /business/i })).toHaveAttribute('aria-valuenow', '18');
    expect(screen.getByText('Week 5')).toBeInTheDocument();
  });

  it('marks a critical meter (< 20) for the danger pulse', () => {
    render(<MetersHud meters={{ users: 50, business: 12, team: 50, tech: 50 }} week={2} deltas={{}} />);
    expect(screen.getByRole('meter', { name: /business/i })).toHaveAttribute('data-critical', 'true');
  });

  it('floats the applied deltas', () => {
    render(<MetersHud meters={{ users: 56, business: 50, team: 50, tech: 42 }} week={3} deltas={{ users: 6, tech: -8 }} />);
    expect(screen.getByText('+6')).toBeInTheDocument();
    expect(screen.getByText('−8')).toBeInTheDocument();
  });
});

describe('HintDots', () => {
  it('renders one dot per affected meter with an accessible description', () => {
    render(<HintDots effects={{ users: 10, tech: -5 }} />);
    expect(screen.getByLabelText('Affects Users, Tech')).toBeInTheDocument();
  });
});
