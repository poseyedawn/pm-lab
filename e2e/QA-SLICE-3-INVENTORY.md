# Slice 3 Ship It QA inventory

## User-visible claims

- The entry states the expected time, normal quarter length, extension rule, failure condition, and integrity rule before play.
- Customer means sustainable customer value, adoption, and trust. A dark pattern cannot improve that meter.
- Every decision produces one receipt with the chosen action, exact meter changes, causal reasoning, and the model assumption.
- Consent, accessibility, security, privacy, truthful claims, and legal compliance use a separate integrity signal.
- A balanced run with an integrity breach or unresolved review requirement cannot earn Promoted or CEO-in-waiting.
- Overshoot cards name the meter state that caused the backlash.
- Conditional cards name the earlier decision that caused the consequence.
- A failed run adds no XP until the player accepts the failure and opens the review.
- Active Free and Daily runs survive refresh with the same seed, week, meters, history, current card, and last decision receipt.
- A restored terminal run cannot grant XP twice.
- Haptics Off prevents every Ship It vibration call.
- Manual Reduced motion disables card drag and removes optional transition motion.
- Low-meter feedback names the endangered meter and uses the post-choice value.
- Review focus moves to the performance rating, shows operating balance and integrity separately, and keeps celebration behind the evidence.
- Share text uses complete Customer, Business, Team, and Tech labels.

## Controls and state changes

| Control or behavior | Initial state | Changed state | Required check |
| --- | --- | --- | --- |
| Free run CTA | Entry | Week 1 | Entry copy remains visible before play and the run starts once. |
| Left and right choices | Active card | Next card or result | One history entry, one week advance, one receipt, and one persistence write. |
| Card drag | Full motion | Matching left or right choice | Gesture and button remain equivalent. Reduced motion blocks drag. |
| Haptics setting | On or Off | Choice, low meter, failure | Vibration occurs only when enabled. |
| Decision receipt | No prior choice | Prior choice recorded | Exact effects, reasoning, assumption, and integrity status are readable and announced. |
| Overshoot draw | Meter below 85 | Meter at least 85 | Backlash banner names the overshot meter and current consequence. |
| Conditional draw | No causal flag | Earlier choice flag set | Banner names the earlier choice or state. |
| Failure action | Meter reaches zero | Review accepted | Focus starts on See your review. XP changes only after activation. |
| Review | Terminal run | Reload | Same rating, balance, integrity issues, meters, XP, and share text return. No duplicate reward. |
| Run it back | Saved review | New seed | Week and meters reset. Prior XP and best rating remain. |
| Daily run | Unplayed date | Active or completed date | Active progress restores. Completion remains idempotent for the date. |

## Functional checks

1. Read the entry at 390 by 844 and confirm the time, weeks, extension, zero-meter failure, and integrity rule.
2. Make an ordinary choice. Confirm the displayed receipt matches the selected card effects and authored guidance.
3. Refresh on week 2. Confirm seed, product, week, meters, current card, history, and receipt match the pre-refresh state.
4. Choose the dark-pattern option from a staged deterministic run. Confirm Customer falls, the receipt says Integrity breach, and the consent boundary is visible.
5. Stage a balanced completed run with the four audited risk choices. Confirm the rating is Needs Review, Promoted and CEO-in-waiting are absent, and all four issues appear in review data.
6. Stage an overshoot state. Confirm the next overshoot card names the meter threshold and backlash.
7. Stage an authored continuation. Confirm the banner names the earlier choice that caused it.
8. Push each meter below 20. Confirm the status message names the meter and exact post-choice value.
9. Reach a failure with known starting XP. Confirm XP stays unchanged behind the failure dialog, focus moves to See your review, Escape reaches review, and XP is awarded once after acceptance.
10. Reload an active Daily run and confirm its exact state returns. Finish it, reload, and confirm no second reward is possible.
11. Set Haptics Off, instrument `navigator.vibrate`, make a choice, and reach a failure. Confirm no calls are recorded.
12. Set manual motion to Reduced. Confirm pointer drag cannot advance the card while both choice buttons remain usable.
13. Complete a clean run. Confirm review focus, separate performance, balance, and integrity blocks, scoped celebration, full share labels, and stable reward after repeated reloads.

## Visual checks

Inspect the entry, first card, ordinary receipt, integrity breach receipt, causal continuation, low-meter warning, failure dialog, clean review, and Needs Review result at:

- 195 by 422;
- 390 by 844;
- 430 by 932;
- 1200 by 900 with the game centered in the 390-pixel mobile canvas.

For each state, check text wrapping, button reachability, receipt hierarchy, meter legibility, focus indicators, clipping, horizontal overflow, and whether the mobile game world remains visually complete.

## Exploratory checks

1. Click both choices in the same animation frame, then reload immediately. Exactly one choice and one reward path may survive.
2. Choose an integrity-risk action, navigate Back to the entry, then Forward to play. The same run and integrity receipt must return.
3. Reload before and after accepting a failed review. The failure acknowledgement and reward boundary must stay coherent.
4. Corrupt the active-run object with valid JSON. The route must recover to a new valid run without a page error.
5. Switch Haptics and Motion while an active run exists, then choose again. The new preference must apply without resetting the quarter.

## Expected-failure evolution

- Remove `SHIP-PREF-01` only after the production browser records zero vibration calls with Haptics Off across choice and failure paths.
- Remove `SHIP-STATE-01` only after production refresh and history navigation restore an exact active run and repeated result reloads do not duplicate XP.
- Preserve unrelated expected failures for the hub, entry-route contrast, and Exception Room.

## Evidence limits

- Chromium and the project-owned Playwright fallback provide browser evidence for this slice.
- Haptics are verified through `navigator.vibrate` instrumentation, not a physical motor.
- Speaker output, screen-reader speech, Safari, iPhone hardware, and Android hardware remain outside this local pass.
- Browser screenshots must be opened and inspected. Numeric fit checks alone are not visual signoff.
- This slice does not authorize a commit, push, pull request, merge, deployment, or publication.
