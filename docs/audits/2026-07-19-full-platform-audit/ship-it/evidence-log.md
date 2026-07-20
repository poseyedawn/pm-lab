# Ship It browser evidence log

Status: all 31 checks executed against the production build at `http://127.0.0.1:3110/` on commit `d608c67`. Chromium was controlled through the user-approved Playwright fallback. Local storage, clipboard, motion media queries, vibration calls, focus, browser history, console output, and page errors were inspected where relevant.

| ID | Result | Viewport and input | Browser result | Evidence | Finding |
| --- | --- | --- | --- | --- | --- |
| SHIP-01 | Finding | 390 x 844, 430 x 932, 1200 x 900 | The goal, four meters, and failure rule are understandable. The entry does not state the expected run time. Mobile uses the available width; desktop centers a locked mobile canvas. | [390](evidence/SHIP-01-entry-390x844.png), [430](evidence/SHIP-01-entry-430x932.png), [desktop](evidence/SHIP-01-entry-desktop-1200x900.png) | `SHIP-P2-04` confirmed. The visual treatment is competent but more like a standard product screen than an immersive game world. |
| SHIP-02 | Pass | 390 x 844 touch | Free run is the dominant CTA and clearly separates itself from Daily. Prior completion state is retained. | [entry](evidence/SHIP-01-entry-390x844.png) | None. |
| SHIP-03 | Pass | 390 x 844 touch | Daily explains the shared daily challenge, shows streak state, and changes to a completed review after play. | [daily first run](evidence/SHIP-21-daily-first-run-390x844.png), [same visit](evidence/SHIP-22-daily-same-visit-review-390x844.png) | None. |
| SHIP-04 | Pass | 390 x 844 touch and browser history | About explains the decision model, implementation, persistence, and engagement limits. Return navigation is stable. | [about](evidence/SHIP-04-about-390x844.png) | The game has a credible portfolio explanation route. |
| SHIP-05 | Pass | 390 x 844 touch and keyboard | Week, product, dilemma, four meters, and both choices are visible and understandable. | [initial card](evidence/SHIP-05-initial-card-390x844.png) | Central emoji art makes the card feel less authored than the surrounding Product Lab work. |
| SHIP-06 | Finding | 390 x 844 touch | Left choice advances one card and exposes meter deltas. The delta chips overlap the top navigation and game header region. | [left choice](evidence/SHIP-06-after-left-choice-390x844.png) | Feedback is readable but its placement breaks the established chrome hierarchy. |
| SHIP-07 | Finding | 390 x 844 touch | Right choice advances one card and exposes meter deltas. The same header overlap occurs. | [right choice](evidence/SHIP-07-after-right-choice-390x844.png) | Same placement defect as SHIP-06. |
| SHIP-08 | Pass | 390 x 844 touch emulation | A short drag under the threshold cancels. A left drag over the threshold advances the same branch as the left button. | [drag left](evidence/SHIP-08-touch-drag-left-390x844.png) | Gesture threshold and cancellation are reliable. |
| SHIP-09 | Pass | 390 x 844 touch emulation | A right drag over the threshold advances the same branch as the right button. | [drag right](evidence/SHIP-09-touch-drag-right-390x844.png) | Gesture and button paths remain consistent. |
| SHIP-10 | Finding | 390 x 844 touch | Low meter state is conveyed by a pulsing bar and red outline. No textual warning or programmatic announcement explains which meter is in danger. | [warning](evidence/SHIP-10-low-meter-warning-390x844.png) | `SHIP-P2-01` confirmed. The warning relies heavily on color and motion. |
| SHIP-11 | Finding | 390 x 844 touch | Overshooting Users above 85 changes the following card, but the interface does not label the effect as backlash or explain why the threshold changed the model. | [overshoot](evidence/SHIP-11-users-overshoot-backlash-390x844.png) | The hidden rule can feel arbitrary. |
| SHIP-12 | Finding | 390 x 844 touch | The authored continuation appears, but it does not explicitly recall the earlier choice that caused it. | [arc continuation](evidence/SHIP-12-authored-arc-continuation-390x844.png) | Narrative causality is too implicit for a portfolio reviewer. |
| SHIP-13 | Finding | 390 x 844 touch and keyboard | Users failure is visually distinct and has no confetti. The failure surface appears after XP has already been awarded, focus falls to Body, Escape does nothing, and the first Tab reaches See your review. | [Users failure](evidence/SHIP-13-users-failure-390x844.png) | `SHIP-P2-02` confirmed. Failure recovery is visible but modal semantics and reward timing are weak. |
| SHIP-14 | Finding | 390 x 844 touch | Business failure is visually distinct and names the failed meter. | [Business failure](evidence/SHIP-14-business-failure-390x844.png) | Same focus and early reward defects as SHIP-13. |
| SHIP-15 | Finding | 390 x 844 touch | Team failure is visually distinct and names the failed meter. | [Team failure](evidence/SHIP-15-team-failure-390x844.png) | Same focus and early reward defects as SHIP-13. |
| SHIP-16 | Finding | 390 x 844 touch | Tech failure is visually distinct and names the failed meter. | [Tech failure](evidence/SHIP-16-tech-failure-390x844.png) | Same focus and early reward defects as SHIP-13. |
| SHIP-17 | Pass with model finding | 390 x 844 keyboard | All 18 decisions in the audited path were completed by keyboard. The run reached the final review once and persisted its reward. | [complete review](evidence/SHIP-17-18-30-integrity-risk-ceo-review-390x844.png) | Completion mechanics work. Rating credibility fails under SHIP-30. |
| SHIP-18 | Finding | 390 x 844 touch and keyboard | The quarterly review clearly exposes rating, meter totals, XP, replay, and share. A failed run also routes to a review. Success confetti heavily covers the review at first reveal. | [successful review](evidence/SHIP-17-18-30-integrity-risk-ceo-review-390x844.png), [failed review](evidence/SHIP-18-failed-quarter-review-390x844.png) | Celebration competes with the evidence a reviewer needs to read. |
| SHIP-19 | Finding | 390 x 844 touch, clipboard success and denied permission | Success copied the complete result. Permission denial shows an error but no selectable fallback. The copied Tech label is shortened to `P62`. | [permission denied](evidence/SHIP-19-share-permission-denied-390x844.png) | Share recovery is incomplete and one meter label is ambiguous. |
| SHIP-20 | Pass with visual caveat | 390 x 844 touch | Run it back resets to week 1 and all four meters to 50 while retaining prior XP and best result. The captured transition frame shows clipped upper chrome, so a follow-up visual regression check should accompany implementation. | [run it back](evidence/SHIP-20-run-it-back-390x844.png) | State reset passed. The single captured frame is not strong enough to certify the transition polish. |
| SHIP-21 | Pass | 390 x 844 touch | First Daily run completes the same core choice loop and updates streak and XP. | [first Daily](evidence/SHIP-21-daily-first-run-390x844.png) | None. |
| SHIP-22 | Pass | 390 x 844 touch | Completing Daily in the same visit retains the review and share action. | [same visit](evidence/SHIP-22-daily-same-visit-review-390x844.png) | None. |
| SHIP-23 | Pass | 390 x 844 touch and reload | Revisiting completed Daily preserves the gate, countdown, and route back to Free run. | [already complete](evidence/SHIP-23-daily-already-completed-390x844.png) | Duplicate reward was not available. |
| SHIP-24 | Finding | 390 x 844 touch and reload | Refresh after two decisions restarts week 1 instead of recovering the active quarter. | Storage and route inspection | `SHIP-P1-01` browser confirmed. |
| SHIP-25 | Finding | 390 x 844 touch and browser history | Leaving and returning through Back and Forward also loses the active run with no warning. | Browser history inspection | `SHIP-P1-01` browser confirmed. |
| SHIP-26 | Finding | 390 x 844 keyboard and simulated 200 percent zoom | Keyboard can complete a full run, but meter changes are not announced. At a 195 x 422 CSS viewport, the required action begins around y 763 while the document has no usable outer scroll. | [200 percent zoom](evidence/SHIP-26-zoom200-initial-card-195x422.png) | `SHIP-BP1-01`: zoom can block completion. |
| SHIP-27 | Finding | 390 x 844 touch, manual setting and system media query | Manual Reduced persisted, but drag still advanced the card. Operating-system reduced motion blocked drag. | Preference, transform, and route inspection | `SHIP-P1-02` browser confirmed for motion. |
| SHIP-28 | Finding | 390 x 844 complete run | Direction and magnitude appear after each choice, but no card-specific explanation connects the decision to the changed meters. | Choice sequence and review inspection | `SHIP-P2-06` browser confirmed. Players can optimize numbers without learning product causality. |
| SHIP-29 | Finding | 390 x 844 touch and keyboard | Accessibility, privacy, truthfulness, and manipulation dilemmas are presented as symmetrical portfolio trades. | [accessibility audit](evidence/SHIP-29-10-a11y-audit-390x844.png), [founder livestream](evidence/SHIP-29-5-founder-livestream-390x844.png), [dark pattern](evidence/SHIP-29-7-dark-pattern-growth-390x844.png), [GDPR list](evidence/SHIP-29-8-gdpr-list-390x844.png) | `SHIP-P1-03` browser confirmed. Hard boundaries need a separate integrity model. |
| SHIP-30 | Finding | 390 x 844 keyboard | A path containing four integrity-risk choices still earned CEO-in-waiting and 580 XP. | [integrity-risk review](evidence/SHIP-17-18-30-integrity-risk-ceo-review-390x844.png) | `SHIP-P1-05` browser confirmed. The top label is not defensible as a leadership assessment. |
| SHIP-31 | Finding | 390 x 844 and desktop | Operating-system emoji are used for product avatars and meter symbols, so central art varies by platform and feels less deliberate than the hub and Exception Room. | [initial card](evidence/SHIP-05-initial-card-390x844.png), [desktop entry](evidence/SHIP-01-entry-desktop-1200x900.png) | `SHIP-P2-05` visually confirmed on the audited platform. Cross-platform rendering remains untested. |

## Browser-confirmed Ship It findings

### SHIP-BP1-01: The fixed canvas blocks required choices at 200 percent zoom

At a 195 x 422 CSS viewport, the document remains locked to the viewport while the choice actions begin around y 763. The browser exposes no outer scroll range that can bring those controls into view. The player cannot complete the core loop.

### SHIP-BP1-02: A high-risk leadership path can earn the strongest rating

The keyboard campaign included shipping an unreviewed stream, shipping a pre-check with known risk, choosing one more campaign before fixing the product, and using blockers-only communication. The final screen still awarded CEO-in-waiting and 580 XP. This converts the source-level assessment concern into a visible portfolio credibility problem.

### SHIP-BP2-01: Preference controls do not match game behavior

With Haptics set to Off, the browser vibration spy still recorded a 20 millisecond call after a choice. With the manual motion preference set to Reduced, drag still advanced the card. The operating-system reduced-motion media query did prevent drag. The same screen therefore honors one motion source but not the user's explicit in-product setting.

### SHIP-BP2-02: Failure is shown as a dialog without complete dialog behavior

The failure surface uses `role="alertdialog"`, but has no `aria-modal`, does not take focus, and does not close or recover with Escape. The focused choice is removed and focus falls to Body. The first Tab reaches See your review, which limits the severity but does not create a deliberate modal handoff.

### SHIP-BP2-03: Active quarters have no recovery boundary

Refresh after two choices and browser Back followed by Forward both returned the player to week 1. No confirmation, save indicator, or recovery message appears. A visitor can lose almost an entire quarter without understanding why.

### SHIP-BP2-04: Share failure has no usable fallback

Clipboard success is clear and accurate apart from the shortened Tech label. When permission is denied, the interface shows an error but does not provide selectable text or another share route.

## Strengths to preserve

- The binary choice loop is immediate, understandable, and fully operable by touch buttons, drag, or keyboard.
- All four failure types are visually distinct, correctly named, and free of celebratory confetti.
- Free and Daily modes, completion gates, streaks, and earned XP persist correctly after completion.
- The About page explains the product rationale and the limits of the simulation.
- The four meters make tradeoffs visible at a glance, even though the integrity model and causal teaching need redesign.
- No console errors or page errors appeared during the 31-check browser pass.

## Evidence limits

- Haptics were verified by spying on `navigator.vibrate`, not by observing a physical device motor.
- Cross-platform emoji rendering was not tested. The finding concerns the audited macOS rendering and the inherent platform dependency.
- The run-it-back transition needs a dedicated visual regression retest because its captured frame showed clipped upper chrome after the state reset passed.
