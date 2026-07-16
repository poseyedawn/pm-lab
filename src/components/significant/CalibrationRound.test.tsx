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
const continueToCampaign = vi.fn();

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseCalibration.mockReturnValue({
    ready: true,
    coaching: true,
    setCoaching,
    phase: 'deciding',
    call: null,
    correct: null,
    earnedBaseline: false,
    baselineXp: 50,
    decide,
    continueToCampaign,
  });
});

describe('CalibrationRound', () => {
  it('recreates the selected evidence-first call surface with real controls', () => {
    render(<CalibrationRound scenario={scenario} initialCall={null} onContinue={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /you.re the pm in ship review/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Calibration step 1 of 3')).toBeInTheDocument();
    expect(screen.getByText(scenario.hypothesis)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /daily conversion rate, control vs variant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ship: launch it/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kill: not enough evidence/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep running: more data/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Skip coaching' }));
    expect(setCoaching).toHaveBeenCalledWith(false);
  });

  it('keeps the decisive evidence visible through the earned reveal', () => {
    const onContinue = vi.fn();
    mockedUseCalibration.mockReturnValue({
      ready: true,
      coaching: true,
      setCoaching,
      phase: 'revealed',
      call: 'ship',
      correct: true,
      earnedBaseline: true,
      baselineXp: 50,
      decide,
      continueToCampaign,
    });

    render(<CalibrationRound scenario={scenario} initialCall="ship" onContinue={onContinue} />);

    expect(screen.getByText(/whole confidence interval stays above zero/i)).toBeInTheDocument();
    expect(screen.getByText('+50 baseline XP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /campaign/i }));
    expect(continueToCampaign).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('turns a missed calibration call into specific practice feedback', () => {
    mockedUseCalibration.mockReturnValue({
      ready: true,
      coaching: true,
      setCoaching,
      phase: 'revealed',
      call: 'kill',
      correct: false,
      earnedBaseline: true,
      baselineXp: 50,
      decide,
      continueToCampaign,
    });

    render(<CalibrationRound scenario={scenario} initialCall="kill" onContinue={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'That call missed the signal.' })).toBeInTheDocument();
    expect(screen.getByText('Your call')).toBeInTheDocument();
    expect(screen.getByText('Better call')).toBeInTheDocument();
    expect(screen.getByText(/whole confidence interval stays above zero/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /practice in the campaign/i })).toBeInTheDocument();
  });
});
