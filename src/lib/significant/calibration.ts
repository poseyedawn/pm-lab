import { campaignSeed, generateScenario } from '@/lib/engine/scenario';
import type { Call, Scenario } from '@/lib/engine/types';

export interface CalibrationRoundDefinition {
  id: 1 | 2 | 3;
  correctCall: Call;
  prompt: string;
  reason: string;
  scenario: Scenario;
}

export const CALIBRATION_ROUNDS = [
  {
    id: 1,
    correctCall: 'ship',
    prompt: 'Does this result support a release?',
    reason: 'The full-duration test shows a stable gain, and the confidence interval stays above zero. The evidence supports release.',
    scenario: generateScenario(campaignSeed(1, 1), 'clean-win'),
  },
  {
    id: 2,
    correctCall: 'kill',
    prompt: 'Does the evidence support stopping this version?',
    reason: 'The full-duration test shows harm, and the confidence interval stays below zero. The evidence supports stopping this version.',
    scenario: generateScenario(campaignSeed(2, 1), 'clean-loss'),
  },
  {
    id: 3,
    correctCall: 'keep',
    prompt: 'Can more valid evidence still change the call?',
    reason: 'The confidence interval includes both harm and a useful gain. More valid data can still change the decision, so the test should keep running.',
    scenario: generateScenario(campaignSeed(6, 1), 'underpowered'),
  },
] as const satisfies readonly CalibrationRoundDefinition[];

export const CALIBRATION_TOTAL = CALIBRATION_ROUNDS.length;
