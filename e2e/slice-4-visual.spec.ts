import path from 'node:path';
import type { Page } from '@playwright/test';
import { CAMPAIGN_CASES } from '../src/lib/exception-room/cases';
import { startExceptionRun } from '../src/lib/exception-room/engine';
import { runPolicy } from '../src/lib/exception-room/simulation';
import { expect, stageLocalStorage, test } from './fixtures/app';

const evidenceDirectory = path.resolve(process.cwd(), 'docs/qa/evidence/slice-4');

async function capture(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: path.join(evidenceDirectory, name),
    animations: 'disabled',
    fullPage: false,
  });
}

async function reviewAllVisibleEvidence(page: Page): Promise<void> {
  const evidence = page.locator('.exception-evidence-item');
  const count = await evidence.count();
  for (let index = 0; index < count; index += 1) await evidence.nth(index).click();
}

function seedWithInitialCase(caseId: string): number {
  for (let seed = 0; seed < 500; seed += 1) {
    const run = startExceptionRun(seed, 'campaign', CAMPAIGN_CASES);
    if (run.queuedCaseIds.includes(caseId)) return seed;
  }
  throw new Error(`No initial seed found for ${caseId}`);
}

test.describe('Slice 4 rendered evidence', () => {
  test('captures and verifies every material Exception Room state', async ({ appPage }) => {
    await appPage.emulateMedia({ reducedMotion: 'reduce' });
    await appPage.goto('/exception-room');
    await expect(appPage.getByRole('link', { name: /Practice the decisions/i })).toBeVisible();
    await capture(appPage, '01-entry-practice-first-390x844.png');

    await appPage.goto('/exception-room/play?preview=selected');
    await reviewAllVisibleEvidence(appPage);
    await expect(appPage.getByText('2/2 REQUIRED REVIEWED')).toBeVisible();
    await capture(appPage, '02-selected-case-evidence-390x844.png');

    await appPage.reload();
    await appPage.getByRole('button', { name: /APPROVE/i }).click();
    await expect(appPage.getByRole('alertdialog', { name: /evidence review incomplete/i })).toBeVisible();
    await capture(appPage, '03-evidence-deficit-confirmation-390x844.png');
    await appPage.getByRole('button', { name: /DECIDE WITHOUT THEM/i }).click();
    await expect(appPage.getByRole('heading', { name: 'Unverified decision' })).toBeVisible();
    await capture(appPage, '04-unverified-result-390x844.png');

    await appPage.goto('/exception-room/play?preview=selected');
    await reviewAllVisibleEvidence(appPage);
    await appPage.getByRole('button', { name: /ESCALATE/i }).click();
    await appPage.locator('.exception-detail-picker').locator(':scope > button').first().click();
    await expect(appPage.getByRole('heading', { name: 'Best supported call' })).toBeVisible();
    await capture(appPage, '05-preferred-result-390x844.png');

    const acceptableSeed = seedWithInitialCase('effective-date-conflict');
    const acceptableRun = startExceptionRun(acceptableSeed, 'campaign', CAMPAIGN_CASES);
    await stageLocalStorage(appPage, {
      'pmlab:exception-room:active:v1': {
        version: 1,
        seed: acceptableSeed,
        mode: 'campaign',
        phase: 'review',
        lastDecision: null,
        history: acceptableRun.history,
      },
    });
    await appPage.goto('/exception-room/play?mode=campaign');
    await appPage.getByRole('button', { name: /Effective date conflict/i }).click();
    await reviewAllVisibleEvidence(appPage);
    await appPage.getByRole('button', { name: /ESCALATE/i }).click();
    await appPage.locator('.exception-detail-picker').locator(':scope > button').first().click();
    await expect(appPage.getByRole('heading', { name: 'Defensible tradeoff' })).toBeVisible();
    await capture(appPage, '06-acceptable-result-390x844.png');

    await appPage.goto('/exception-room/play?preview=selected');
    await appPage.getByRole('button', { name: /END SHIFT/i }).click();
    await expect(appPage.getByRole('alertdialog', { name: /End this shift/i })).toBeVisible();
    await capture(appPage, '07-end-shift-forecast-390x844.png');

    const completedRun = runPolicy(12, 'preferred');
    const lastResolution = completedRun.resolutions.at(-1);
    if (!lastResolution) throw new Error('Completed run has no final resolution.');
    await stageLocalStorage(appPage, {
      'pmlab:exception-room:active:v1': {
        version: 1,
        seed: 12,
        mode: 'campaign',
        phase: 'debrief',
        lastDecision: {
          caseId: lastResolution.caseId,
          action: lastResolution.action,
          ...(lastResolution.detailId ? { detailId: lastResolution.detailId } : {}),
        },
        history: completedRun.history,
      },
    });
    await appPage.goto('/exception-room/play?mode=campaign');
    await expect(appPage.getByRole('heading', { name: 'BALANCED OPERATOR' })).toBeVisible();
    await capture(appPage, '08-debrief-top-390x844.png');
    await appPage.locator('#decision-trace-title').scrollIntoViewIfNeeded();
    await capture(appPage, '09-decision-trace-390x844.png');

    await appPage.goto('/exception-room/about');
    await expect(appPage.getByRole('heading', { name: /HOW EXCEPTION ROOM WAS DESIGNED/i })).toBeVisible();
    await capture(appPage, '10-about-390x844.png');

    await appPage.setViewportSize({ width: 195, height: 422 });
    await appPage.goto('/exception-room/play?preview=selected');
    await expect(appPage.locator('.exception-case-summary')).toBeVisible();
    await appPage.locator('.exception-case-summary').scrollIntoViewIfNeeded();
    await capture(appPage, '11-selected-case-195x422.png');

    await appPage.setViewportSize({ width: 1200, height: 900 });
    await appPage.goto('/exception-room');
    await expect(appPage.locator('.lab-frame')).toBeVisible();
    await capture(appPage, '12-entry-desktop-1200x900.png');
  });
});
