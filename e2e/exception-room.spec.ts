import type { Page } from '@playwright/test';
import { CAMPAIGN_CASES } from '../src/lib/exception-room/cases';
import { startExceptionRun } from '../src/lib/exception-room/engine';
import { runPolicy } from '../src/lib/exception-room/simulation';
import {
  attachViewportScreenshot,
  expect,
  expectRequiredRegionReachable,
  stageLocalStorage,
  test,
} from './fixtures/app';

async function reviewAllVisibleEvidence(page: Page): Promise<void> {
  const evidence = page.locator('.exception-evidence-item');
  const count = await evidence.count();
  for (let index = 0; index < count; index += 1) await evidence.nth(index).click();
}

test.describe('Exception Room', () => {
  test('explains practice first and does not promote unfinished Daily mode', async ({ appPage }) => {
    await appPage.goto('/exception-room');
    await expect(appPage.getByRole('link', { name: /Practice the decisions/i })).toBeVisible();
    await expect(appPage.getByText('Scored campaign')).toBeVisible();
    await expect(appPage.getByText(/Complete the three practice cases/i)).toBeVisible();
    await expect(appPage.getByText(/Daily queue/i)).toHaveCount(0);
    await expect(appPage.getByRole('link', { name: /HOW THIS GAME WAS DESIGNED/i })).toBeVisible();
  });

  test('teaches Approve, Correct, and Escalate in an unscored practice queue', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?mode=practice');
    const actions = new Set<string>();

    for (let step = 0; step < 3; step += 1) {
      await appPage.locator('.exception-queue-card').first().click();
      const guide = appPage.locator('.exception-practice-guide');
      await expect(guide).toBeVisible();
      const guideText = await guide.textContent();
      const action = ['APPROVE', 'CORRECT', 'ESCALATE'].find((candidate) => guideText?.includes(candidate));
      expect(action).toBeDefined();
      if (!action) return;
      actions.add(action);

      await reviewAllVisibleEvidence(appPage);
      await appPage.locator(`.exception-decision-button.is-${action.toLowerCase()}`).click();
      const detailPicker = appPage.locator('.exception-detail-picker');
      if (await detailPicker.isVisible()) await detailPicker.locator(':scope > button').first().click();
      await expect(appPage.getByText('PREFERRED DECISION')).toBeVisible();
      await appPage.getByRole('button', { name: /CONTINUE/i }).click();
    }

    expect(actions).toEqual(new Set(['APPROVE', 'CORRECT', 'ESCALATE']));
    await expect(appPage.getByRole('heading', { name: 'READY FOR THE QUEUE' })).toBeVisible();
    await expect(appPage.getByText(/Practice is unscored and awards no XP/i)).toBeVisible();
  });

  test('lets the operator select a case, review required evidence, and resolve it', async ({ appPage }, testInfo) => {
    await appPage.goto('/exception-room/play?preview=selected');
    await expect(appPage.getByRole('heading', { name: 'EXCEPTION QUEUE' })).toBeVisible();
    await expect(appPage.getByText('0/2 REQUIRED REVIEWED')).toBeVisible();
    await reviewAllVisibleEvidence(appPage);
    await expect(appPage.getByText('2/2 REQUIRED REVIEWED')).toBeVisible();
    await attachViewportScreenshot(appPage, 'exception-room-case-review.png', testInfo.attach.bind(testInfo));

    await appPage.getByRole('button', { name: /ESCALATE/i }).click();
    await expect(appPage.getByText('CHOOSE A DESTINATION')).toBeFocused();
    await appPage.locator('.exception-detail-picker').locator(':scope > button').first().click();
    await expect(appPage.getByText('PREFERRED DECISION')).toBeVisible();
    await expect(appPage.getByRole('heading', { name: 'Best supported call' })).toBeFocused();
    await expect(appPage.getByRole('button', { name: /CONTINUE/i })).toBeVisible();
    await appPage.getByRole('button', { name: /CONTINUE/i }).click();
    await expect(appPage.locator('.exception-queue-card').first()).toBeFocused();
    await expect(appPage.locator('.exception-run-shell > .sr-only[aria-live="polite"]')).toContainText(/cases are open/i);
  });

  test('makes an evidence-deficit decision explicit before submission', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?preview=selected');
    await appPage.getByRole('button', { name: /APPROVE/i }).click();
    const confirmation = appPage.getByRole('alertdialog', { name: /evidence review incomplete/i });
    await expect(confirmation).toBeVisible();
    await expect(confirmation.getByText(/lowers Safety and Evidence quality/i)).toBeVisible();
    await confirmation.getByRole('button', { name: /DECIDE WITHOUT THEM/i }).click();
    await expect(appPage.getByRole('heading', { name: 'Unverified decision' })).toBeVisible();
    await expect(appPage.getByText('EVIDENCE DEFICIT RECORDED')).toBeVisible();
  });

  test('offers all three decision types for a selected case', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?preview=selected');
    await expect(appPage.getByRole('button', { name: /APPROVE/i })).toBeVisible();
    await expect(appPage.getByRole('button', { name: /CORRECT/i })).toBeVisible();
    await expect(appPage.getByRole('button', { name: /ESCALATE/i })).toBeVisible();
  });

  test('reports the exact nearest deadline and count for seed 6240', async ({ appPage }) => {
    const run = startExceptionRun(6240, 'campaign', CAMPAIGN_CASES);
    await stageLocalStorage(appPage, {
      'pmlab:exception-room:active:v1': {
        version: 1,
        seed: 6240,
        mode: 'campaign',
        phase: 'review',
        lastDecision: null,
        history: run.history,
      },
    });
    await appPage.goto('/exception-room/play?mode=campaign');
    const alert = appPage.locator('.exception-due-alert');
    await expect(alert).toContainText('2 CASES');
    await expect(alert).toContainText('DUE IN 2 TICKS');
  });

  test('shows expiration and carryover consequences before ending a shift', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?preview=selected');
    await appPage.getByRole('button', { name: /END SHIFT/i }).click();
    const confirmation = appPage.getByRole('alertdialog', { name: /End this shift/i });
    await expect(confirmation).toBeVisible();
    await expect(confirmation).toContainText(/cases? expire/i);
    await expect(confirmation).toContainText(/cases? carr/i);
    await confirmation.getByRole('button', { name: /KEEP REVIEWING/i }).click();
    await expect(confirmation).toHaveCount(0);
  });

  test('names shift and capacity progressbars', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?preview=selected');
    const progressbars = appPage.getByRole('progressbar');
    await expect(progressbars).toHaveCount(2);
    const names = await progressbars.evaluateAll((elements) => elements.map((element) => (
      element.getAttribute('aria-label') ?? element.getAttribute('aria-labelledby') ?? ''
    )));
    expect(names[0]).toMatch(/shift/i);
    expect(names[1]).toMatch(/capacity/i);
  });

  test('makes the shared Sound and Haptics settings control real feedback', async ({ appPage }) => {
    await appPage.addInitScript(() => {
      const runtime = window as unknown as { __toneStarts: number; __vibrations: number };
      runtime.__toneStarts = 0;
      runtime.__vibrations = 0;
      class FakeAudioContext {
        state = 'running';
        currentTime = 0;
        destination = {};
        resume() { return Promise.resolve(); }
        createOscillator() {
          return {
            type: 'sine',
            frequency: { value: 0 },
            connect<T>(target: T) { return target; },
            start() { runtime.__toneStarts += 1; },
            stop() {},
          };
        }
        createGain() {
          return {
            gain: {
              setValueAtTime() {},
              exponentialRampToValueAtTime() {},
            },
            connect<T>(target: T) { return target; },
          };
        }
      }
      Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext });
      Object.defineProperty(navigator, 'vibrate', {
        configurable: true,
        value: () => {
          runtime.__vibrations += 1;
          return true;
        },
      });
    });
    await appPage.goto('/exception-room/play?preview=selected');
    await appPage.locator('.exception-evidence-item').first().click();
    await expect.poll(() => appPage.evaluate(() => (
      window as unknown as { __toneStarts: number }
    ).__toneStarts)).toBeGreaterThan(0);
    const tonesBeforeMute = await appPage.evaluate(() => (
      window as unknown as { __toneStarts: number }
    ).__toneStarts);

    await appPage.locator('summary[aria-label="Settings"]').click();
    await appPage.getByRole('switch', { name: 'Sound' }).click();
    await appPage.getByRole('switch', { name: 'Haptics' }).click();
    await appPage.locator('summary[aria-label="Settings"]').click();
    await appPage.locator('.exception-evidence-item').nth(1).click();
    await appPage.getByRole('button', { name: /ESCALATE/i }).click();
    await appPage.locator('.exception-detail-picker').locator(':scope > button').first().click();
    await expect(appPage.getByText('PREFERRED DECISION')).toBeVisible();

    expect(await appPage.evaluate(() => (
      window as unknown as { __toneStarts: number }
    ).__toneStarts)).toBe(tonesBeforeMute);
    expect(await appPage.evaluate(() => (
      window as unknown as { __vibrations: number }
    ).__vibrations)).toBe(0);
  });

  test('restores the selected case and reviewed evidence after refresh', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?mode=campaign');
    await appPage.locator('.exception-queue-card').first().click();
    const title = await appPage.locator('#case-review-title').textContent();
    await appPage.locator('.exception-evidence-item').first().click();
    await expect(appPage.getByText(/1\/\d REQUIRED REVIEWED/)).toBeVisible();
    await expect.poll(() => appPage.evaluate(() => Boolean(localStorage.getItem('pmlab:exception-room:active:v1')))).toBe(true);
    await appPage.reload();

    await expect(appPage.locator('#case-review-title')).toHaveText(title ?? '');
    await expect(appPage.getByText(/1\/\d REQUIRED REVIEWED/)).toBeVisible();
  });

  test('restores the resolution reveal after refresh', async ({ appPage }) => {
    await appPage.goto('/exception-room/play?mode=campaign');
    await appPage.locator('.exception-queue-card').first().click();
    await appPage.getByRole('button', { name: /APPROVE/i }).click();
    const confirmation = appPage.getByRole('alertdialog', { name: /evidence review incomplete/i });
    const proceed = confirmation.getByRole('button', { name: /DECIDE WITHOUT/i });
    await proceed.click();
    const resultHeading = await appPage.locator('#exception-resolution-title').textContent();
    await expect.poll(() => appPage.evaluate(() => (
      JSON.parse(localStorage.getItem('pmlab:exception-room:active:v1') ?? '{}') as { phase?: string }
    ).phase)).toBe('reveal');
    await appPage.reload();

    await expect(appPage.locator('#exception-resolution-title')).toHaveText(resultHeading ?? '');
    await expect(appPage.getByRole('button', { name: /CONTINUE/i })).toBeVisible();
  });

  test('cannot certify an evidence-free campaign as Balanced Operator or Safety 100', async ({ appPage }) => {
    const run = runPolicy(6240, 'random');
    const lastResolution = run.resolutions.at(-1);
    expect(lastResolution).toBeDefined();
    if (!lastResolution) return;
    await stageLocalStorage(appPage, {
      'pmlab:exception-room:active:v1': {
        version: 1,
        seed: 6240,
        mode: 'campaign',
        phase: 'debrief',
        lastDecision: {
          caseId: lastResolution.caseId,
          action: lastResolution.action,
          ...(lastResolution.detailId ? { detailId: lastResolution.detailId } : {}),
          acceptEvidenceDeficit: true,
        },
        history: run.history,
      },
    });
    await appPage.goto('/exception-room/play?mode=campaign');
    await expect(appPage.locator('.exception-debrief h1')).not.toHaveText('BALANCED OPERATOR');
    await expect(appPage.locator('.exception-score-grid > div').filter({ hasText: 'SAFETY' })).not.toContainText('100');
    await expect(appPage.getByText(/Evidence deficits lowered Safety/i)).toBeVisible();
  });

  test('keeps the complete entry reachable at the primary mobile viewport', async ({ appPage }) => {
    await appPage.goto('/exception-room');
    await expectRequiredRegionReachable(appPage, '.exception-mode-primary');
    await expectRequiredRegionReachable(appPage, '.exception-disclosure');
  });
});
