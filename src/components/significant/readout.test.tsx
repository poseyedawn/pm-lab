import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { generateScenario } from '@/lib/engine/scenario';
import { ReadoutCard } from '@/components/significant/ReadoutCard';
import { DecisionButtons } from '@/components/significant/DecisionButtons';

describe('ReadoutCard', () => {
  it('shows hypothesis, metric, duration, and lift', () => {
    const s = generateScenario(42, 'clean-win');
    render(<ReadoutCard scenario={s} />);
    expect(screen.getByText(s.hypothesis)).toBeInTheDocument();
    expect(screen.getByText(s.metricName)).toBeInTheDocument();
    expect(screen.getByText(`Day ${s.daysRun} of ${s.daysPlanned}`)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /daily conversion rate, control vs variant/i })).toBeInTheDocument();
  });
  it('shows the note chip and segment table when present', () => {
    const s = generateScenario(42, 'simpson');
    render(<ReadoutCard scenario={s} />);
    expect(screen.getByText(/Power users/)).toBeInTheDocument();
  });
});

describe('DecisionButtons', () => {
  it('emits the chosen call', () => {
    const onCall = vi.fn();
    render(<DecisionButtons onCall={onCall} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ship' }));
    expect(onCall).toHaveBeenCalledWith('ship');
    fireEvent.click(screen.getByRole('button', { name: 'Keep Running' }));
    expect(onCall).toHaveBeenCalledWith('keep');
  });
});
