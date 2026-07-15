import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DilemmaCard } from '@/components/shipit/DilemmaCard';
import { ChoiceButtons } from '@/components/shipit/ChoiceButtons';
import type { Card } from '@/lib/shipit/types';

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

const CARD: Card = {
  id: 'test-card', speaker: 'Maya, Eng Lead', avatar: '👩‍💻',
  text: 'The staging environment is down again.',
  left: { label: 'Fix it now', effects: { tech: 8, business: -4 } },
  right: { label: 'Ship anyway', effects: { business: 6, tech: -8 } },
};

describe('DilemmaCard', () => {
  it('renders speaker, avatar and dilemma text', () => {
    render(<DilemmaCard card={CARD} onChoose={() => {}} />);
    expect(screen.getByText('Maya, Eng Lead')).toBeInTheDocument();
    expect(screen.getByText(/staging environment/)).toBeInTheDocument();
  });
});

describe('ChoiceButtons', () => {
  it('fires onChoose with the right direction and shows hint dots per choice', () => {
    const calls: string[] = [];
    render(<ChoiceButtons card={CARD} onChoose={(d) => calls.push(d)} />);
    fireEvent.click(screen.getByRole('button', { name: /fix it now/i }));
    fireEvent.click(screen.getByRole('button', { name: /ship anyway/i }));
    expect(calls).toEqual(['left', 'right']);
  });

  it('disables both buttons when disabled', () => {
    render(<ChoiceButtons card={CARD} onChoose={() => {}} disabled />);
    expect(screen.getByRole('button', { name: /fix it now/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /ship anyway/i })).toBeDisabled();
  });
});
