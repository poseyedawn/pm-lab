import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearActiveExceptionRun,
  defaultExceptionRoomState,
  EXCEPTION_ACTIVE_RUN_KEY,
  loadActiveExceptionRun,
  loadExceptionRoomState,
  recordCampaignCompletion,
  recordExceptionDaily,
  recordPracticeCompletion,
  saveActiveExceptionRun,
  saveExceptionRoomState,
} from '@/lib/exception-room/state';
import { CAMPAIGN_CASES } from '@/lib/exception-room/cases';
import { selectCase, startExceptionRun, viewEvidence } from '@/lib/exception-room/engine';

beforeEach(() => {
  window.localStorage.clear();
  clearActiveExceptionRun();
});

describe('Exception Room progress', () => {
  it('round-trips progress and recovers from corrupt storage', () => {
    expect(loadExceptionRoomState()).toEqual(defaultExceptionRoomState());
    saveExceptionRoomState({ ...defaultExceptionRoomState(), xp: 200, soundOn: false });
    expect(loadExceptionRoomState()).toMatchObject({ xp: 200, soundOn: false });
    window.localStorage.setItem('pmlab:exception-room:v1', '{bad');
    expect(loadExceptionRoomState()).toEqual(defaultExceptionRoomState());
  });

  it('awards the campaign once while preserving the best profile', () => {
    let progress = recordCampaignCompletion(defaultExceptionRoomState(), 'Safety First');
    expect(progress).toMatchObject({ xp: 200, campaignComplete: true, bestProfile: 'Safety First' });
    progress = recordCampaignCompletion(progress, 'Backlog Bound');
    expect(progress).toMatchObject({ xp: 200, bestProfile: 'Safety First' });
    progress = recordCampaignCompletion(progress, 'Balanced Operator');
    expect(progress).toMatchObject({ xp: 200, bestProfile: 'Balanced Operator' });
  });

  it('marks practice complete without awarding XP', () => {
    expect(recordPracticeCompletion(defaultExceptionRoomState())).toMatchObject({
      practiceComplete: true,
      xp: 0,
      campaignComplete: false,
    });
  });

  it('round-trips an active run through deterministic replay', () => {
    const started = startExceptionRun(42, 'campaign', CAMPAIGN_CASES);
    const caseId = started.queuedCaseIds[0];
    const selected = selectCase(started, caseId);
    expect(selected.ok).toBe(true);
    if (!selected.ok) return;
    const evidenceId = CAMPAIGN_CASES.find((candidate) => candidate.id === caseId)?.evidence[0].id;
    expect(evidenceId).toBeDefined();
    if (!evidenceId) return;
    const viewed = viewEvidence(selected.state, caseId, evidenceId, CAMPAIGN_CASES);
    expect(viewed.ok).toBe(true);
    if (!viewed.ok) return;

    saveActiveExceptionRun({
      seed: 42,
      mode: 'campaign',
      run: viewed.state,
      phase: 'review',
      lastDecision: null,
    });

    expect(loadActiveExceptionRun('campaign')).toMatchObject({
      seed: 42,
      mode: 'campaign',
      run: {
        selectedCaseId: caseId,
        caseStates: { [caseId]: { evidenceViewedIds: [evidenceId] } },
      },
    });
  });

  it('clears malformed active-run state instead of recovering partial data', () => {
    window.localStorage.setItem(EXCEPTION_ACTIVE_RUN_KEY, JSON.stringify({
      version: 1,
      seed: 42,
      mode: 'campaign',
      phase: 'review',
      lastDecision: null,
      history: [{ type: 'case-opened', caseId: 'not-a-case', tick: 0 }],
    }));
    expect(loadActiveExceptionRun('campaign')).toBeNull();
    expect(window.localStorage.getItem(EXCEPTION_ACTIVE_RUN_KEY)).toBeNull();
  });

  it('keeps daily rewards idempotent and resets a broken streak', () => {
    let progress = recordExceptionDaily(defaultExceptionRoomState(), '2026-07-15', 'Safety First');
    expect(recordExceptionDaily(progress, '2026-07-15', 'Balanced Operator')).toEqual(progress);
    progress = recordExceptionDaily(progress, '2026-07-16', 'Balanced Operator');
    expect(progress).toMatchObject({ xp: 100, dailyStreak: 2 });
    progress = recordExceptionDaily(progress, '2026-07-20', 'Calibration in Progress');
    expect(progress).toMatchObject({ xp: 150, dailyStreak: 1 });
  });

  it('records Exception Room progress in the lab profile (v2)', () => {
    saveExceptionRoomState({
      ...defaultExceptionRoomState(),
      xp: 200,
      practiceComplete: true,
      campaignComplete: true,
    });
    const profile = JSON.parse(window.localStorage.getItem('pmlab:profile:v2')!) as {
      games: { 'exception-room': { xp: number; completedMilestones: string[] } };
    };
    expect(profile.games['exception-room'].xp).toBe(200);
    expect(profile.games['exception-room'].completedMilestones).toContain('campaign:complete');
    expect(profile.games['exception-room'].completedMilestones).toContain('practice:complete');
  });
});
