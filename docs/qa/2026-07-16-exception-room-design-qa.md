# Exception Room design QA

## Review target

- Selected visual: `/Users/Alvin/.codex/generated_images/019f6d9f-7e42-7b92-a578-6cf973ab3dd6/exec-0da4f082-7a05-42ae-9aa3-c15da37b8a18.png`
- Supporting moodboards: `/Users/Alvin/Downloads/5d85ae96f1753d72c043aa0fc6510b97.jpg` and `/Users/Alvin/Downloads/7db9da0442571b71c5b838fc79b9d68f.webp`
- Implementation screenshot: `docs/qa/exception-room-selected-390x844.png`
- Side-by-side comparison: `docs/qa/exception-room-reference-comparison.png`
- Viewport: 390 by 844 CSS pixels
- State: campaign, shift 2 of 3, 6 of 10 capacity, four open cases, Approval record missing selected, action controls visible

## Comparison

The implementation preserves the selected visual's matte black operations shell, condensed split-color title, purple shift progress, segmented cyan capacity meter, amber due alert, numbered four-case queue, bordered selected state, AI recommendation block, evidence treatment, and teal, blue, and magenta action hierarchy. The full decision surface and End Shift control fit inside the target canvas without page or horizontal overflow.

Differences are intentional and tied to the working simulation. Queue consequence labels reflect the authored case data. Evidence rows retain their actual summaries and review state instead of using decorative status-only content. Standard interface symbols use Phosphor icons. All visible primary controls are functional and the outcome screen reports the engine's real resolution and learning destination.

## Interaction and quality checks

- Opened the missing approval evidence and verified the reviewed count changed from 0 of 2 to 1 of 2.
- Opened Escalate, selected Approval owner, and verified the preferred Sound judgment resolution.
- Continued the run, ended shifts 2 and 3, and verified the Backlog Bound debrief.
- Corrected the debrief XP total so campaign XP is not counted twice.
- Verified the final browser console had no warnings or errors.
- Verified unit tests, lint, production build, and whitespace checks. Lint retains four pre-existing warnings outside this change.

## Iteration history

1. `docs/qa/exception-room-selected-390x844-v1.png`: initial integration. Blocking mismatch because the action controls fell below the viewport and the queue/header structure diverged from the selected visual.
2. `docs/qa/exception-room-selected-390x844-v2.png`: corrected density, title, progress, capacity layout, queue order, icons, numbering, and action visibility. Follow-up correction was needed for the due label and debrief XP total.
3. `docs/qa/exception-room-selected-390x844.png`: final selected state. Due alert reads Next tick, all actions remain visible, and the full interaction path passes.

final result: passed
