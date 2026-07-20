# Product Lab Slice 4 QA inventory

Date: 2026-07-20

Scope: Exception Room assessment integrity, first-run learning, recovery, queue accuracy, accessibility, and portfolio translation.

## Product contract

1. The entry explains the model recommendation, the operator's responsibility, finite capacity, synthetic cases, and the three-step review loop.
2. First-time players can complete three unscored practice cases that demonstrate Approve, Correct, and Escalate.
3. The unfinished Daily mode is absent from the public entry.
4. Each queued case shows its exact deadline. The capacity header reports the exact nearest deadline and the number of cases sharing it.
5. Required evidence is visibly identified, fully readable, and associated with each evidence control.
6. A decision with missing required evidence requires explicit confirmation.
7. An accepted evidence deficit is stored in the resolution, shown in the reveal, lowers Safety and Evidence quality, and prevents Balanced Operator.
8. Preferred, acceptable, unnecessary, unsafe, and evidence-deficit results use distinct teaching signals.
9. End Shift explains expirations and carryover before the state changes.
10. Active selection, evidence review, run progress, reveal state, and debrief state survive refresh through deterministic replay.
11. Rapid duplicate input records one decision, one analytics event, and no false error.
12. Picker, reveal, queue return, and debrief transitions preserve keyboard context or announce the replacement state.
13. Exception Room uses the shared Sound and Haptics preferences for meaningful feedback.
14. The debrief shows Safety, Service, Capacity, Evidence quality, improvement guidance, evidence impact, and the complete decision trace.
15. Practice awards no XP. Campaign completion remains idempotent.
16. The About route explains the evidence model, authority boundary, queue pressure, scoring, and technical implementation.
17. Preview-only state is gated by `NEXT_PUBLIC_ENABLE_EXCEPTION_PREVIEW` and is not enabled by default.

## Routes and primary states

| Route | States | Required action |
| --- | --- | --- |
| `/exception-room` | first visit, practice complete, active practice, active campaign, campaign complete | Practice, resume, campaign, About |
| `/exception-room/play?mode=practice` | three guided cases, three reveals, practice summary | Inspect, decide, continue, start campaign |
| `/exception-room/play?mode=campaign` | queue, selected case, evidence, detail picker, evidence confirmation, result, shift confirmation, debrief | Complete the full review loop |
| `/exception-room/about` | product story and implementation notes | Return or start practice |

## Interaction matrix

| Surface | Interaction | Functional assertion | Visual assertion |
| --- | --- | --- | --- |
| Entry | Practice CTA | Opens practice mode | Primary path is clear |
| Entry | Campaign state | Locked before practice, available after practice, resumes active run | Status and hierarchy are clear |
| Entry | About | Opens the case study | Link remains reachable at 390 by 844 and narrow zoom |
| Practice | Queue card | Opens one guided case at a time | Guide is visible above the recommendation |
| Practice | Required evidence | Counter reaches complete | Full summaries remain readable |
| Practice | Decision | All three action families are demonstrated | Action colors remain distinct |
| Queue | Case card | Opens selected case | Title, severity, reason, and deadline remain legible |
| Header | Due summary | Timing and count match the deterministic schedule | Urgency state is not misleading |
| Evidence | Open item | Records once and persists | Required state and viewed state are distinct |
| Decision | Missing evidence | Opens confirmation before engine submission | Risk language does not look celebratory |
| Decision | Review evidence | Returns focus to first unread required item | Context remains visible |
| Decision | Proceed without evidence | Records explicit deficit | Reveal is visibly unverified |
| Correct or Escalate | Open picker | Focus moves to picker heading | Options are readable and reachable |
| Picker | Back | Focus returns to originating action | No layout jump |
| Result | Preferred | Shows strongest supported signal | Teal success treatment |
| Result | Acceptable | Shows defensible tradeoff | Distinct cyan treatment and explanation |
| Result | Unnecessary | Shows safe but costly signal | Amber caution treatment |
| Result | Unsafe | Shows unsafe signal | Red treatment and no celebration |
| Result | Evidence deficit | Shows unverified signal | Amber evidence warning dominates success cues |
| Continue | Next queue | Resolves once, advances once, focuses first queue card | Capacity and queue updates remain coherent |
| End Shift | Open confirmation | No state change before confirmation | Expiry and carryover counts are visible |
| End Shift | Confirm | Applies forecasted transition | New shift state is announced |
| Refresh | Active review | Restores selection and evidence | Same case returns without flash to a new run |
| Refresh | Reveal or debrief | Restores the exact state | Result remains coherent |
| Rapid input | Double activation | One resolution, no false error | One reveal only |
| Settings | Sound and Haptics | Feedback obeys both preferences | No extra control layer |
| Debrief | Decision trace | Every resolution appears once | Trace remains readable through internal scroll |
| Debrief | Evidence quality | Zero evidence cannot earn Safety 100 or Balanced Operator | Evidence effect has strong hierarchy |

## Viewports

- Primary mobile: 390 by 844
- Large mobile: 430 by 932
- Desktop presentation: 1200 by 900 with centered 390 pixel canvas
- Narrow reflow proxy: 195 by 422
- Motion: full and reduced
- Input: touch, mouse, and keyboard

## Fresh screenshot targets

1. Entry with practice-first hierarchy at 390 by 844
2. Selected campaign case with full evidence at 390 by 844
3. Evidence-deficit confirmation at 390 by 844
4. Preferred result at 390 by 844
5. Acceptable result at 390 by 844
6. Unverified result at 390 by 844
7. End Shift forecast at 390 by 844
8. Campaign debrief and decision trace at 390 by 844
9. About route at 390 by 844
10. Selected case at 195 by 422
11. Entry inside the centered desktop mobile canvas at 1200 by 900

Each accepted screenshot must be opened and visually inspected. Screenshots are evidence, not a substitute for interaction assertions.

## Automated gates

- Exception Room unit tests for engine, scoring, replay, state, practice, scheduling, presentation, and component contracts
- Production build
- Lint
- Exception Room Playwright suite
- Focused exploratory duplicate-input regression
- Route health
- Axe scan
- Slice 1 responsive regression suite
- Full Product Lab browser suite
- Full Product Lab unit suite
- Source and QA copy scan for em dash and en dash characters

## Expected failures outside Slice 4

The hub keyboard stop and the Significant and Ship It entry-route contrast markers remain executable expected failures until their own remediation slice. Slice 4 removes the Exception Room marker only after a fresh Axe pass.
