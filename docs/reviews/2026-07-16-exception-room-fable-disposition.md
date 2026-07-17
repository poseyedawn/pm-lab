# Exception Room Fable Audit Disposition

**Date:** 2026-07-16  
**Audit:** `docs/reviews/2026-07-16-exception-room-fable-audit.md`  
**Mode:** Post-agent verification and targeted source-of-truth revision  
**Implementation status:** Not authorized  
**Publication status:** Not authorized

## Outcome

All two P1 findings and all nine implementation-gating P2 findings are dispositioned in the research brief, product specification, or implementation plan. The seven P3 findings are either resolved in planning or retained as explicit visual, implementation, or release gates.

This disposition does not approve application code, dependency installation, browser QA, deployment, publication, push, merge, or production changes. Fable's original audit remains unchanged.

## Finding dispositions

| Finding | Decision | Source-of-truth change | Gate status |
| --- | --- | --- | --- |
| A01 | Set Shift 3 capacity to 12. | Spec shift table; ER-106 | Closed for planning |
| A02 | Use one global tick. Permit resolution at `tick == maxTick`; advance once after resolution; move to the next opening tick on shift completion. | Spec time model; engine invariants; ER-105 and ER-106 | Closed for planning |
| A03 | Publish first-match precedence: Balanced Operator, Speed Over Evidence, Escalation Heavy, Backlog Bound, Safety First, Calibration in Progress. Baseline is the preferred-policy escalation count for the active seed. | Spec profiles; ER-202 | Closed for planning |
| A04 | Credit Safety for any harm-avoiding outcome. Charge unnecessary escalation to Service and Capacity. | Research action model; spec scoring; ER-201 | Closed for planning |
| A05 | Require a total `outcomeByAction` mapping for all three actions and every bounded correction choice. | Spec domain contract; ER-101, ER-102, ER-204 | Closed for planning |
| A06 | Pair every pre-evidence surface-cue signature with a different preferred action and test cue-only plus zero-evidence policies. | Spec content invariants; ER-204 and ER-205 | Closed for planning; content re-audit required after authoring |
| A07 | Add a typed Exception Room analytics facade over the unchanged shared wrapper. | Plan file map; ER-304 | Closed for planning |
| A08 | Author relative due offsets and deterministically map cases to per-shift arrival slots. | Spec domain and shift model; ER-103 | Closed for planning |
| A09 | Use three short guided practice micro-cases, one per action, with no score or XP. | Research run structure; spec Practice; US-02; ER-206 | Closed for planning |
| A10 | Replace `authority, time` with `priority, authority` in the thesis and claim ledger. | Portfolio article and claim ledger | Wording closed; publication remains gated |
| A11 | Pin daily date and seed at run start. Rollover affects only the next run while the active run completes. | US-09; ER-601 | Closed for planning |
| A12 | Lead with deep teal and use amber as a restrained accent. Compare exact tokens against the live Lab palette during the three-option visual gate. | Research design direction; spec visual direction; ER-002 and ER-401 | Exact tokens remain owner visual decision |
| A13 | Use the `:v1` storage-key suffix and existing safe parse plus memory fallback. Do not add unused migration machinery. | Spec persistence; ER-301 | Closed for planning |
| A14 | Grant 200 XP once for first campaign completion and 50 XP once per local-date daily completion, with explicit idempotency guards. | Spec persistence; ER-302 and ER-601 | Closed for planning |
| A15 | Explain on the about page that Capacity abstracts reviewer effort and evidence inspection is free by accessibility choice. | US-11; ER-701 | Closed for planning |
| A16 | Add a resolve-only-cheap simulation that can score high Capacity but must fail the overall gate and receive Backlog Bound. | Spec tests; ER-201 and ER-205 | Closed for planning |
| A17 | Allow approved engine and content work before visual selection; gate UI work on the selected direction. | Plan authorization boundary; release model | Closed for planning; owner approval still required |
| A18 | End a shift when no harm-avoiding authored resolution is affordable, even if an unsafe cheap action remains. Record explicit expiration reasons. | Spec time and queue model; engine invariants; ER-106 and ER-802 | Closed for planning |

## Verification still required

- Owner approval of the revised research, specification, scoring, and plan before Stage 1 or Stage 2 implementation.
- Owner selection of one visual direction before Stage 4 UI work.
- A second content-focused audit after the twelve campaign cases and three practice micro-cases exist.
- Runtime engine, scoring, storage, analytics, accessibility, and balance verification after implementation.
- External source refresh within seven days of any article publication.
- Explicit authorization before browser QA, deployment, publication, push, merge, or production changes.
