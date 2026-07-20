import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalibrationRound } from '@/components/significant/CalibrationRound';
import { useCalibration } from '@/hooks/significant/useCalibration';
import { campaignSeed, generateScenario } from '@/lib/engine/scenario';

vi.mock('@/hooks/significant/useCalibration', () => ({ useCalibration: vi.fn() }));

const scenario = generateScenario(campaignSeed(1, 1), 'clean-win');
const mockedUseCalibration = vi.mocked(useCalibration);
const decide = vi.fn();
const setCoaching = vi.fn();
const continueRound = vi.fn();
const reason = 'The full-duration test is trustworthy, and the confidence interval stays above zero. The evidence supports release.';

const decidingRound: ReturnType<typeof useCalibration> = {
  ready: true,
  coaching: true,
  setCoaching,
  phase: 'deciding',
  call: null,
  correct: null,
  scenario,
  prompt: 'Does this result support a release?',
  reason,
  stepNumber: 1,
  totalSteps: 3,
  isFinalRound: false,
  xpEarned: 0,
  isReplay: false,
  decide,
  continueRound,
};

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseCalibration.mockReturnValue(decidingRound);
});

describe('CalibrationRound', () => {
  it('teaches the stable three-call policy on round one', () => {
    render(<CalibrationRound onContinue={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /does this result support a release/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Calibration step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText(scenario.hypothesis)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: new RegExp(`daily ${scenario.metricName}`, 'i') })).toHaveAccessibleName(/sample:/i);
    expect(screen.getByRole('button', { name: /ship: evidence supports release/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kill: evidence supports stopping/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep running: more valid evidence/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Skip coaching' }));
    expect(setCoaching).toHaveBeenCalledWith(false);
  });

  it('finishes the sequence only when the third reveal continues', () => {
    const onContinue = vi.fn();
    continueRound.mockReturnValue(true);
    mockedUseCalibration.mockReturnValue({
      ...decidingRound,
      phase: 'revealed',
      call: 'keep',
      correct: true,
      stepNumber: 3,
      isFinalRound: true,
      xpEarned: 20,
    });

    render(<CalibrationRound onContinue={onContinue} />);

    expect(screen.getByRole('status')).toHaveTextContent(reason);
    expect(screen.getByText('+20 calibration XP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /enter the campaign/i }));
    expect(continueRound).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('turns a missed call into specific review before the next round', () => {
    continueRound.mockReturnValue(false);
    mockedUseCalibration.mockReturnValue({
      ...decidingRound,
      phase: 'revealed',
      call: 'kill',
      correct: false,
    });

    render(<CalibrationRound onContinue={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'That call missed the signal.' })).toBeInTheDocument();
    expect(screen.getByText('Your call')).toBeInTheDocument();
    expect(screen.getByText('Better call')).toBeInTheDocument();
    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next calibration round/i })).toBeInTheDocument();
    expect(screen.queryByText(/XP/)).not.toBeInTheDocument();
  });
});
