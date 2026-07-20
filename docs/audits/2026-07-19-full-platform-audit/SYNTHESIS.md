# Product Lab final audit synthesis

## Executive verdict

Product Lab already proves that Alvin can design and engineer real interactive systems. The collection has seeded engines, authored content, persistent shared progress, daily modes, distinct game identities, typed analytics, and complete loops. It does not read like a weekend mockup.

It is not yet ready to be promoted as reliable evidence of product judgment.

The main blockers are not decoration. They are contradictions between what the games claim to assess and what their mechanics reward:

- Significant can grade hidden simulation truth instead of the evidence available to the player.
- Ship It can award CEO-in-waiting after multiple integrity-risk decisions.
- Exception Room can award Balanced Operator, Safety 100, Service 100, and 200 XP after the player inspects zero evidence.
- The hub, Significant, and Ship It become non-completable at simulated 200 percent zoom.
- Exception Room clips its own mobile entry because a fixed-height game is composed below multiple shared headers.

An experienced PM will notice the model contradictions. An experienced engineer will notice the state, accessibility, and viewport failures. These issues should be fixed before more rewards, games, or decorative layers are added.

## Audit coverage

| Surface | Checks | What was verified |
| --- | ---: | --- |
| Shared hub | 20 | First visit, all cards, navigation, drag, motion, settings, cross-game XP, 390, 430, desktop, keyboard, zoom |
| Significant | 33 | Entry, calibration, all ten campaign cases, correct and wrong results, Daily branches, sharing, replay, persistence, keyboard, zoom |
| Ship It | 31 | Entry, buttons, drag thresholds, warnings, overshoot, arcs, all failure meters, complete keyboard run, Daily, sharing, preferences, zoom |
| Exception Room | 40 | Entry, queue, evidence, all actions and outcome classes, deadlines, capacity, shift transitions, two full 12-case campaigns, debrief, keyboard, zoom |
| Cross-product | 34 | Routes, storage, history, build, tests, metadata, deployment, dependencies, headers, analytics, responsive behavior, accessibility boundaries |

The browser pass used the user-approved Playwright fallback against the local production build at commit `d608c67`. All cited screenshots were opened and inspected. Evidence limits are recorded in the product logs.

## What a portfolio reviewer sees

### In the first minute

The hub is the collection's strongest first impression. The full-bleed world, dimensional card art, floating motion, title lockup, and visible three-game library make the product feel intentional. All three games are immediately reachable at 390 x 844. The mobile canvas remains centered on desktop.

The weakness is portfolio translation. Ship It and Exception Room describe recognizable mechanics, while Significant's hub copy remains generic. The hub says what the collection is, but not what each game proves about Alvin's product leadership. A hiring reviewer can understand that these are games before understanding why these particular games matter.

### After one complete game

Significant feels the most complete as a conventional short game. It has onboarding, evidence cards, distinct right and wrong states, a campaign, Daily, sharing, progression, and an About route. The strongest concern is curriculum validity. The player can be marked wrong for refusing to act on evidence that does not justify certainty.

Ship It has the fastest and most intuitive core interaction. Buttons, drag, thresholds, meter movement, Daily, and repeated runs all work. Its weakest layer is the assessment model. Legal, ethical, accessibility, security, and truthfulness boundaries are presented as ordinary meter trades, then excluded from the final leadership rating.

Exception Room has the strongest positioning for AI product leadership and the most differentiated visual identity. The queue, evidence, finite capacity, correction, approval, escalation, deadlines, and shift structure form a credible serious-game concept. Its current scoring undermines that concept by rewarding correct output without requiring defensible review behavior.

## Product strengths to preserve

1. The collection is one product, not three isolated demos. Shared XP, preferences, chrome, home routes, and visual identity create continuity.
2. Each game has a real mechanic. Significant models experiment readouts, Ship It models interacting stakeholder pressures, and Exception Room models operational oversight.
3. The games are short and understandable enough for a portfolio visitor. Significant and Exception Room state duration; Ship It needs the same treatment.
4. The hub uses approved authored assets instead of generic dashboard cards or placeholder art.
5. Exception Room communicates human responsibility clearly: the model made a call, but the player owns what happens next.
6. Wrong states in Significant and Exception Room are visually distinct when isolated and do not automatically celebrate failure.
7. The TypeScript and state-machine foundation is strong. The build passes, all 242 tests pass, and the audited complete loops produced no console or page errors.
8. Existing About routes show a useful instinct toward explaining product rationale and implementation, even though the strongest game still lacks one.

## Highest-priority risks

### 1. Assessment validity

This is the biggest portfolio risk because every game implicitly claims to make judgment visible.

- Significant's Winner's Curse case uses hidden true lift as the grading authority.
- Calibration gives Kill and Keep Running unstable definitions.
- Ship It separates survival from integrity, so unsafe choices can receive the strongest rating.
- Exception Room treats evidence inspection as optional and scores any single opened item as complete review.
- Preferred and acceptable Exception Room outcomes look identical, so the player cannot learn the intended nuance.

The fix is not softer copy. The mechanics, score, result hierarchy, and public claims must agree.

### 2. Mobile and zoom completion

The product is mobile-first, but fixed viewport assumptions are still stronger than the actual reflow model.

- Hub, Significant, and Ship It remove access to required content at simulated 200 percent zoom.
- Exception Room avoids a hard action dead end through internal scrolling, but its entry is clipped at 390 x 844 and its desktop shell is narrower than intended.
- Multiple layers of shared chrome consume playable height in the standard game routes.

The mobile canvas can remain visually locked on desktop. Content inside that canvas still needs to reflow, scroll, and preserve safe areas.

### 3. Active-run trust

- Refreshing a Significant wrong reveal can erase the miss and preserve first-try credit.
- Ship It loses an active quarter after refresh or route exit.
- Exception Room loses selection, evidence review, and active progress after refresh or route exit.

The current persistence is strongest after completion and weakest during the moments that cost the player the most time. That priority should be reversed.

### 4. Accessibility and preference consistency

- Hub drag wrappers add inert focus stops.
- Settings does not dismiss through outside click or Escape.
- Significant results, Ship It failures, and Exception Room transitions repeatedly drop focus to Body.
- Ship It meter changes and Exception Room queue changes are not fully announced.
- Ship It vibrates with Haptics off and ignores the manual Reduced preference for drag.
- Exception Room's Sound control has no observed sound to control.
- Exception Room hides the case summary and compresses evidence into tiny clamped text.

These are product-quality failures, not a separate compliance backlog. They affect whether the game can be understood and trusted.

### 5. Portfolio conversion and credibility

- Exception Room has no in-product About or case-study route even though it is the strongest hiring-market story.
- Significant and Ship It direct links inherit generic metadata and have no designed share previews.
- The public analytics statement says seeds are excluded while Exception Room records a seed.
- The unfinished Daily queue is promoted on Exception Room's entry.
- Ship It's system emoji reduce authorship and change across platforms.

## Research reconciliation

The implementation direction should continue to follow the existing [engagement research](../../research/2026-07-15-game-engagement-and-product-lab-research.md), [mobile hub research](../../research/2026-07-17-mobile-game-hub-research.md), and [Exception Room research](../../research/2026-07-16-exception-room-research.md).

The audit strengthens five research conclusions:

1. Competence must come from understandable improvement, not points alone. Current scoring sometimes rewards outcomes without validating the decision process.
2. Clear goals and immediate feedback work only when the feedback explains causality. Ship It exposes deltas but not why the choice caused them.
3. Onboarding should teach through action. Exception Room already has practice content in source but does not expose it.
4. Accessibility is game quality. The zoom, focus, motion, haptic, and evidence-legibility failures directly damage the core loops.
5. Visual authorship supports credibility, but cannot compensate for an invalid assessment model. Exception Room is the clearest proof.

The research does not support adding more streak pressure, random rewards, or pre-game ceremony before these foundations are repaired.

## Readiness by surface

| Surface | Current verdict | Promotion gate |
| --- | --- | --- |
| Shared hub | Strong visual direction, functionally close | Fix zoom, inert focus stops, settings dismissal, and game-value copy |
| Significant | Complete game loop with strong evidence presentation | Repair grading semantics, result commit, confetti lifecycle, zoom, focus, and chart description |
| Ship It | Excellent immediate interaction, weak assessment credibility | Add integrity constraints, causal feedback, active-run recovery, preference compliance, zoom, and authored visual assets |
| Exception Room | Strongest portfolio concept, highest-risk implementation gaps | Enforce evidence, repair scoring and deadlines, fix viewport composition, expose practice, add case study, and restore active runs |
| Shared platform | Strong deterministic and typed base | Add real browser and accessibility regression coverage, accurate metadata, analytics disclosure, and release gates |

## Final recommendation

Do not expand the collection yet. Run the implementation plan in this order:

1. Protect completion and reflow.
2. Repair the three assessment models.
3. Persist consequential active state.
4. Repair focus, announcements, and preferences.
5. Improve teaching and outcome explanations.
6. Strengthen portfolio translation, metadata, and About routes.
7. Polish visual feedback and replace platform-dependent art.
8. Harden performance, release automation, metadata, and browser policies.

That sequence preserves the distinctive visual work while fixing the parts that determine whether an experienced PM or engineer trusts what the games say.
