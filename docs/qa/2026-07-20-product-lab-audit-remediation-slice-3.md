# Product Lab audit remediation, Slice 3

**Date:** 2026-07-20

**Branch:** `codex/product-lab-audit-remediation`
**Scope:** Repair Ship It integrity policy, causal feedback, active-run recovery, failure handling, preference compliance, and narrow reflow.

## Outcome

Slice 3 is complete locally. Ship It now separates operating balance from integrity, explains the causal model behind every choice, restores active Free and Daily quarters, and prevents an integrity-risk run from receiving a top leadership rating.

No commit, push, pull request, merge, preview deployment, or production deployment was performed.

## Decision model

Ship It still asks the player to balance Customer, Business, Team, and Tech. Those four meters represent operating health. They no longer decide whether a harmful action is acceptable.

A separate integrity model covers:

- accessibility;
- customer trust;
- evidence quality;
- legal compliance;
- privacy;
- security;
- truthfulness.

Each authored integrity decision is classified as Protected, Review required, or Integrity breach. A run with a breach or unresolved review requirement receives Needs Review, even when all four operating meters are balanced. The result page presents performance, operating balance, and integrity as separate judgments.

A 10,000-seed policy diagnostic found zero top leadership ratings among integrity-affected runs. More than 9,000 generated runs exercised at least one integrity event.

## Customer meter repair

The visible Users meter is now Customer. It represents sustainable customer value, adoption, and trust.

The pre-checked contact-invite dark pattern now lowers Customer by 10. Low-quality SEO also lowers Customer. Manipulative reach can no longer be displayed as improved customer health.

## Decision feedback

Every one of the 51 cards has authored guidance for both choices. Each decision receipt contains:

- the selected action;
- exact meter changes;
- a card-specific causal explanation;
- the model assumption behind that explanation;
- the integrity outcome and boundary when one applies.

The receipt is a polite live region. Meter changes no longer float over the shared header. They stay inside the game content with the explanation they belong to.

All conditional consequences and overshoot cards also receive authored context. The player can now see which earlier choice, unresolved condition, or high meter caused the next event.

## Entry and learning contract

The entry now tells a first-time visitor that:

- a run takes about three minutes;
- a normal quarter contains 12 weekly decisions;
- open consequences can extend the run to 18 weeks;
- any operating meter reaching zero ends the run;
- balanced meters cannot erase an integrity breach.

The About page defines Customer, decision receipts, integrity boundaries, and the three-part review model.

## Active-run recovery

Free and Daily runs now persist a strict Zod-validated snapshot after every accepted decision. The snapshot preserves:

- seed and product;
- week and all four meters;
- flags and drawn cards;
- complete history and current card;
- active, failed, or complete status;
- failed meter and overshoot history;
- failure acknowledgement.

Refresh, route exit, Back, and Forward restore the exact active Free run. The current-date Daily snapshot restores in the same way.

Malformed saved-run JSON fails safely into a new valid run. Free and Daily reward keys keep terminal XP idempotent across repeated reloads.

## Preference compliance

Ship It now consumes the shared Haptics and Motion preferences.

- Haptics Off prevents choice and failure vibration calls.
- Manual Reduced motion disables card drag and optional card transitions.
- Changing both settings during an active quarter keeps the same seed, week, meters, and history.
- The new preference applies to the next interaction without restarting the run.

## Failure and reward boundary

The failed-run surface is now a complete alert dialog:

- `aria-modal` is true;
- focus enters on See your review;
- Tab remains within the dialog's one action;
- Escape accepts the failure and opens the review.

Failed-run XP remains unchanged behind the dialog. The reward is committed only after the player accepts the failure. Reload before acceptance returns to the dialog with the same XP. Reload after acceptance returns to the review without granting XP again.

Low-meter feedback names the endangered meter and its exact post-choice value. The warning audio also checks the new value instead of the stale pre-choice state.

## Review and sharing

The review heading receives focus. The card shows:

- performance rating;
- operating balance;
- integrity status;
- every unresolved integrity item;
- final Customer, Business, Team, and Tech values;
- earned and total XP;
- share and replay actions.

Celebration is limited to clean successful reviews, reduced to 32 particles, scoped to the review card, and layered behind all review evidence. Needs Review and PIP do not celebrate.

Copied result text uses complete Customer, Business, Team, and Tech labels and includes the integrity status. A selectable-text fallback for clipboard permission denial remains assigned to a later shared-surface slice.

## Narrow reflow and visual inspection

At the 195 by 422 proxy for 200 percent zoom:

- outer run padding contracts;
- decision receipt headings and effects stack;
- left and right choices become two full-width rows;
- long review cards remain vertically scrollable;
- the mobile canvas has no horizontal overflow.

The visual suite captured 15 screenshots covering the entry, first card, ordinary receipt, integrity receipt, causal continuation, low-meter warning, failure dialog, clean review, and Needs Review result.

Those images were opened and inspected at:

- 195 by 422;
- 390 by 844;
- 430 by 932;
- 1200 by 900 with a centered 390-pixel mobile canvas.

The inspected images showed readable card text, stable button labels, complete integrity evidence, a distinct failure state, and no cropped horizontal content. The mobile game canvas remains centered on desktop.

## Browser coverage

The Ship It functional suite now contains 14 production-browser checks. It covers:

- entry rules and duration;
- exact decision receipts;
- button and drag parity;
- Haptics Off and manual Reduced motion;
- Free and Daily active-run recovery;
- Daily and Free reward idempotence;
- integrity-risk decisions and Customer effects;
- all four audited integrity issues in the review;
- overshoot and earlier-choice causality;
- failure focus, Escape, acknowledgement, and reward timing;
- rapid duplicate input;
- malformed active-run recovery;
- live preference changes during an active run;
- 200 percent zoom reachability.

The dedicated Slice 3 visual suite contains nine production-browser checks across the four audited viewports.

## Verification result

- TypeScript: clean.
- Lint: clean with zero errors and zero warnings.
- Unit suite: 47 files and 250 tests passed.
- Production build: all 13 listed app routes compiled and generated.
- Ship It functional browser suite: 14 of 14 passed.
- Slice 3 visual browser suite: 9 of 9 passed.
- Full browser suite: 84 checks passed under Playwright's result model.
- Browser contracts: 78 healthy checks and 6 executable expected failures.
- Browser health: no unexpected console, page, or local request failures.
- Source, browser inventory, and this QA note contain no em dash or en dash characters.
- Diff integrity: `git diff --check` passed.

## Findings closed by this slice

- `SHIP-P1-01`: active Free and Daily quarters were not recoverable.
- `SHIP-P1-02`: shared Haptics and manual Motion preferences were not honored.
- `SHIP-P1-03`: hard integrity boundaries were ordinary meter trades.
- `SHIP-P1-04`: Users mixed raw adoption with customer welfare.
- `SHIP-P1-05`: top ratings ignored integrity-risk decisions.
- `SHIP-BP1-01`: required choices were blocked at simulated 200 percent zoom.
- `SHIP-P2-01`: meter consequences were not announced.
- `SHIP-P2-02`: failure lacked complete modal focus behavior.
- `SHIP-P2-03`: low-meter audio checked stale state.
- `SHIP-P2-04`: the entry omitted expected duration.
- `SHIP-P2-06`: decision feedback omitted causal reasoning.
- `SHIP-BP2-01`: delta chips overlapped shared chrome.
- `SHIP-BP2-02`: failed-run XP appeared before review acceptance.
- `SHIP-BP2-04`: completion confetti competed with review evidence.

The corresponding Ship It preference and active-run expected-failure markers were removed only after fresh production-browser evidence passed.

## Remaining Product Lab expected failures

Six executable expected failures remain for later slices:

- serious color contrast on the three game entry routes;
- inert keyboard stops around draggable hub cards;
- Exception Room active-run reset on refresh;
- Exception Room rapid duplicate input showing a false availability error.

The three route contrast checks run separately, which brings the expected-failure total to six.

## Evidence limits

- Chromium is the only browser in this local pass.
- Haptics were verified through `navigator.vibrate` instrumentation, not a physical motor.
- Speaker output and screen-reader speech were not verified.
- Safari, iPhone hardware, and Android hardware remain outside this slice.
- The 195 by 422 viewport is a browser reflow proxy for 200 percent zoom.
- Device-local date authority for Daily play remains a cross-product architecture finding.
- Authored replacement art for Ship It's operating-system emoji remains `SHIP-P2-05`.
- Clipboard denial fallback remains `SHIP-BP2-03` for a later shared-surface slice.

## Next boundary

Slice 4 owns Exception Room's integrity model, evidence behavior, run recovery, queue announcements, and rapid-input safety.
