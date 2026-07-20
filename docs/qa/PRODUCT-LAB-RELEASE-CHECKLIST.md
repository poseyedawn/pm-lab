# Product Lab release checklist

This checklist turns a locally verified remediation branch into a traceable Vercel release. Preview creation and production promotion require separate approval.

## 1. Freeze the source boundary

- [ ] Record the repository path.
- [ ] Record the branch from `git branch --show-current`.
- [ ] Record the exact commit from `git rev-parse HEAD`.
- [ ] Confirm `git status --short` contains no accidental or unexplained files.
- [ ] Review the complete diff and the list of audit findings closed by it.
- [ ] Confirm no secret, local environment file, browser trace, or test result bundle is included.

Release record:

| Field | Verified value |
| --- | --- |
| Repository |  |
| Branch |  |
| Commit SHA |  |
| Reviewer |  |
| Approval timestamp |  |

## 2. Run the local quality gate

- [x] `npm test -- --run`
- [x] `npm run lint`
- [x] `npm run build`
- [x] Production Chromium suite with the local Exception Room preview flag
- [x] Serious and critical Axe gate on the hub and all three entries
- [x] `git diff --check`
- [x] Authored copy scan for em dash and en dash
- [x] Rendered review at 390 by 844, 430 by 932, 1200 by 900, and 195 by 422 where affected
- [x] Same-frame comparison against the approved hub reference

Local evidence is recorded in the dated Slice 1 through Slice 6 QA reports. These checks must be rerun after any later source change.

## 3. Verify critical assets

Before preview creation, record SHA-256 hashes and byte sizes for:

- `public/lab/pick-field-test-logo.svg`
- `public/lab/product-lab-wordmark.svg`
- `public/lab/significant-depth-card.webp`
- `public/lab/ship-it-depth-card.webp`
- `public/lab/exception-room-depth-card.webp`
- `public/lab/hub-world.webp`
- each game-specific social preview image

After the preview builds, request each public asset and confirm its response bytes match the expected file.

## 4. Create an authorized preview

- [ ] Confirm Alvin has explicitly authorized a preview deployment.
- [ ] Confirm the intended Vercel team and project before creating anything.
- [ ] Confirm the preview is built from the exact recorded commit.
- [ ] Record the deployment-specific URL, not only a moving branch alias.
- [ ] Inspect the deployment metadata and build logs.
- [ ] Confirm any deployment protection still allows the approved reviewers and automated checks to reach the preview.

Preview record:

| Field | Verified value |
| --- | --- |
| Vercel team |  |
| Vercel project |  |
| Deployment ID |  |
| Deployment URL |  |
| Git branch |  |
| Git commit |  |
| Build status |  |
| Protection state |  |

Vercel documents `vercel list --status READY`, `vercel inspect <deployment-url>`, `vercel inspect <deployment-url> --logs`, `vercel curl`, `vercel httpstat`, and deployment log review as preview verification tools. See [Vercel's promotion and verification guide](https://vercel.com/docs/deployments/promote-preview-to-production).

## 5. Run the preview product gate

- [ ] Run the complete Playwright suite against the deployment-specific preview URL.
- [ ] Verify no console errors, page errors, rejected requests, or missing assets.
- [ ] Complete a fresh and returning path for every game.
- [ ] Verify refresh, Back, Forward, duplicate input, and reward idempotency on consequential states.
- [ ] Verify Settings, Sound, Haptics, system motion, and manual motion.
- [ ] Verify keyboard focus, dialogs, announcements, and the 200 percent zoom proxy.
- [ ] Verify direct game metadata, canonical URLs, social images, manifest, robots, sitemap, and response headers.
- [ ] Capture accepted screenshots at the four required viewport boundaries.
- [ ] Compare the hub, one representative state per game, and each result type against the accepted local evidence.

## 6. Run the performance gate

Measure the deployment-specific preview under mobile throttling. Test the hub and one representative entry and play route per game.

| Metric | Budget | Result |
| --- | ---: | --- |
| Largest Contentful Paint | 2.5 s or less |  |
| Interaction to Next Paint, field data | 200 ms or less |  |
| Total Blocking Time, lab proxy for INP | 200 ms or less |  |
| Cumulative Layout Shift | 0.1 or less |  |
| Broken asset requests | 0 |  |
| Unhandled browser errors | 0 |  |

The LCP, INP, and CLS budgets follow the recommended Core Web Vitals thresholds at the 75th percentile. Lab tools cannot measure INP without real interaction, so record Total Blocking Time as the lab proxy and keep INP as a field-data requirement. See [Web Vitals](https://web.dev/articles/vitals), [LCP](https://web.dev/articles/lcp), [INP](https://web.dev/articles/optimize-inp), and [CLS](https://web.dev/articles/optimize-cls).

Also record:

- transferred bytes by asset type;
- the LCP element and resource URL;
- long main-thread tasks;
- layout-shift sources;
- whether repeat navigation benefits from cache;
- any exception, its user impact, owner, and follow-up date.

## 7. Review dependency and security state

- [ ] Run `npm audit --omit=dev` on the release commit.
- [ ] Confirm there are no unreviewed high or critical advisories.
- [ ] Record every remaining moderate advisory and its exposure path.
- [ ] Confirm response policies still permit only required app and analytics behavior.
- [ ] Verify no preview-only flag or deterministic seed path is enabled in the public environment.

Current reviewed constraint: Next.js 16.2.10 carries a nested PostCSS version flagged by [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93). The advisory concerns stringifying malicious CSS for placement inside a style element. Product Lab does not accept or transform user CSS. A Next.js maintainer also states that the vendored build-time usage does not expose Next.js applications through this path in [vercel/next.js issue 93234](https://github.com/vercel/next.js/issues/93234). npm's forced repair proposes an invalid Next 9 downgrade, so the release should track the stable Next version that includes the patched vendor dependency instead of applying that downgrade.

## 8. Owner review before production

- [ ] Alvin reviews the deployment-specific preview.
- [ ] Alvin confirms the approved visual direction is intact.
- [ ] Alvin confirms game rules, outcomes, portfolio claims, and analytics disclosure.
- [ ] Alvin explicitly approves production promotion.

Preview approval does not authorize production. Silence, `proceed`, local QA approval, and a successful build are not production authorization.

## 9. Verify production after approved promotion

- [ ] Record the production deployment ID, commit, and domains.
- [ ] Confirm the production alias points to the approved deployment.
- [ ] Run route, metadata, header, asset, and smoke interaction checks on the public domain.
- [ ] Inspect production error logs after traffic reaches the release.
- [ ] Compare the public 390 by 844 hub and each game entry against the accepted preview.
- [ ] Confirm analytics receives only the documented coarse events.
- [ ] Confirm the previous production deployment can be restored if a severe regression appears.

Production record:

| Field | Verified value |
| --- | --- |
| Production deployment ID |  |
| Production commit |  |
| Production domains |  |
| Promotion approver |  |
| Promotion timestamp |  |
| Post-release verifier |  |
| Rollback target |  |
