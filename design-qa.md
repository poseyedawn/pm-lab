# Slice 3 design QA

- **Source visual truth:** `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-2262ea3d-52c2-4280-99e7-9e7fd1ae3b48.png`
- **Normalized source:** `docs/qa/assets/2026-07-15-slice-3/source-option-1-390x844.png`
- **Implementation route:** `/significant/calibration`
- **Implementation screenshot:** `docs/qa/assets/2026-07-15-slice-3/implementation-calibration-deciding-390x844.png`
- **Viewport:** 390 × 844 CSS pixels at device scale factor 1
- **State:** first visit, empty Lab profile, no preselected call
- **Runtime:** local production build in Google Chrome through the approved Playwright fallback

## QA inventory

| Claim or control | Functional check | Evidence |
|---|---|---|
| Option 1 is the dedicated first-run calibration | Clear storage, enter from the Lab CTA, and inspect the dedicated route | `comparison-full-390x844.png`; URL is `/significant/calibration` |
| Calibration starts from honest zero progress | Read the shared Lab header before and after a real call | Header begins at 0 XP, then moves to 50 XP after the reveal |
| The complete decision composition fits the mobile viewport | Measure the evidence card, decision controls, coaching action, and document | 390 × 844 document is exactly 390 × 844; decisions end at y=788 and Skip coaching ends at y=840 |
| Decision cards are real controls | Activate Ship, Kill, and Keep Running in fresh sessions | All three matching reveal checks passed |
| The evidence teaches without spoiling the call | Inspect the handwritten prompt before reveal, then the highlighted CI after reveal | `comparison-coaching-and-decisions.png`; `implementation-calibration-reveal-390x844.png` |
| The baseline is earned and idempotent | Inspect Significant storage after first completion and after replay | First completion stores 50 XP with an empty campaign; replay remains at 50 XP |
| Landing decisions carry forward | Select Ship on `/`, follow the CTA, and inspect the reveal | URL retains `call=ship`; reveal says “You said Ship” |
| Cold and legacy routes respect the calibration gate | Open home, play, daily, and the old calibration query directly | All redirect and validated-call preservation checks passed |
| Campaign progress remains honest | Continue from reveal into the campaign | Case 1 remains next; banner reports 0 campaign stars |
| Mobile-first lock remains intact on desktop | Open at 1440 × 900 and measure `.lab-frame` | `implementation-calibration-desktop-locked-1440x900.png`; frame is centered at x=525 and remains 390px wide |
| Short mobile adaptation remains usable | Open at 320 × 568 and measure overflow and controls | Document is exactly 320 × 568; visible controls are at least 44px |
| Accessibility basics remain intact | Inspect names, chart summary, focus order, focus styling, and target sizes | `implementation-calibration-keyboard-focus-390x844.png`; all checks passed |
| Runtime is clean | Observe console errors, page errors, and failed requests across the full flow | `verification.json` contains an empty diagnostics array |

## Full-view comparison evidence

`docs/qa/assets/2026-07-15-slice-3/comparison-full-390x844.png` places the normalized selected source and final production-browser capture together at the same 390 × 844 viewport and deciding state.

The implementation preserves the source composition: compact Product Lab header, field-test label, one-line ship-review title, three-step calibration rail, evidence instruction, hypothesis, full-width white evidence card, dual-series chart, observed lift and confidence interval, handwritten coaching note, three edge-to-edge semantic calls, and the timed coaching action. The selected direction contains no portrait or required raster asset, so no substitute person or avatar appears.

## Focused-region comparison evidence

- `docs/qa/assets/2026-07-15-slice-3/comparison-evidence-card.png` compares the hypothesis hierarchy, chart scale, confidence bands, legend, lift/CI treatment, sample context, radius, and shadow.
- `docs/qa/assets/2026-07-15-slice-3/comparison-coaching-and-decisions.png` compares the handwritten note, arrow placement, decision-control proportions, Phosphor icons, colors, labels, and coaching action.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] The deterministic game series is not pixel-identical to the illustrative source chart.
  - **Location:** evidence card chart.
  - **Evidence:** both versions show the same two-series, confidence-band, 14-day visual model; the implementation renders the actual clean-win scenario values.
  - **Impact:** none on comprehension or fidelity of the evidence hierarchy.
  - **Disposition:** accepted. Tracing decorative source data would make the displayed statistics internally inconsistent.
- [P3] The source annotation states the correct answer before the player chooses; the implementation keeps the same handwritten treatment but asks the player to test whether the interval clears zero.
  - **Location:** coaching note between evidence and decisions.
  - **Impact:** preserves the calibration challenge instead of spoiling it.
  - **Disposition:** accepted as a necessary interaction-level copy correction.

## Required fidelity surfaces

| Surface | Final evaluation |
|---|---|
| Fonts and typography | Existing Nunito and Caveat preserve the rounded product voice and selected handwritten treatment. The title remains on one line at 390px, matching the source hierarchy. |
| Spacing and layout rhythm | Header is 53px; evidence spans y=315–604; decisions span y=704–788; the 44px coaching action ends at y=840. The full composition fits without horizontal or vertical overflow. |
| Colors and visual tokens | Existing ink, violet, green, rose, neutral, and surface tokens closely match the selected palette while retaining accessible contrast and visible focus. |
| Image quality and asset fidelity | The selected direction requires no portrait. Phosphor supplies the visible interface icons, and the chart renders real deterministic data with binomial confidence bands instead of a placeholder image. |
| Copy and content | Field-test framing, calibration rail, hypothesis, call labels, and timing cue preserve the source. The note is intentionally non-spoiling, and the reveal explains the decisive signal. |

## Primary interactions verified

- A cold landing begins at 0 XP and opens a normal deciding calibration when no call was selected.
- Ship, Kill, and Keep Running each produce the matching reveal.
- A validated landing call is carried into the dedicated route and resolves once.
- Malformed call input is ignored safely and leaves all three decisions available.
- The evidence remains visible during feedback, and the decisive confidence interval receives a visible highlight.
- First completion grants 50 baseline XP without awarding campaign stars or completing Case 1.
- Campaign handoff exposes Case 1 as the next action and reports zero collected campaign stars.
- Settings exposes Replay calibration; replay gives feedback but cannot award another baseline.
- Skip coaching removes the optional teaching layer, and Show coaching restores it.
- Cold Significant home, campaign play, and daily entry all redirect to calibration.
- The legacy calibration query canonicalizes to the dedicated route and preserves a valid call.
- Keyboard focus reaches every primary action with a visible outline.
- 390px and 320px viewports have no horizontal overflow; visible controls meet the 44px minimum.
- A 1440px desktop viewport keeps a centered 390px mobile surface.
- Browser diagnostics recorded zero console errors, page errors, or failed requests.

## Comparison history

- **Pass 0 — blocked:** `implementation-calibration-deciding-390x844-pass0.png`
  - Finding: [P1] the source title wrapped, the evidence card and handwritten note were too compressed, and the global footer pushed the composition below the viewport.
  - Fix: hid the generic footer during focused calibration, matched the one-line title, and rebuilt the card/note rhythm from measured source proportions.
- **Pass 1 — blocked:** `implementation-calibration-deciding-390x844-pass1.png`
  - Post-fix evidence: title and control width matched, but the evidence card remained short and the reveal overflowed.
  - Fix: moved sample context into the observed-lift column, expanded real chart treatment, and shortened the reveal copy without removing evidence.
- **Pass 2 — blocked:** `implementation-calibration-deciding-390x844-pass2.png`
  - Post-fix evidence: both deciding and reveal states fit, but the chart letterboxed inside the card and the coaching/decision region sat too high.
  - Fix: restored the chart’s natural aspect ratio, narrowed the handwritten note, and aligned the controls to the source’s lower edge.
- **Pass 3 — blocked:** `implementation-calibration-deciding-390x844-pass3.png`
  - Post-fix evidence: source alignment was strong, but production measurement found 12px of 390px overflow and 48px at 320 × 568.
  - Fix: reduced only internal card spacing, removed redundant bottom padding, and simplified optional coaching on short-height screens while preserving the core evidence and decisions.
- **Pass 4 — final:** `implementation-calibration-deciding-390x844.png`
  - Post-fix evidence: source and implementation align across the full and focused comparisons; 46/46 rendered checks pass with zero diagnostics and no actionable P0/P1/P2 findings.

## Implementation checklist

1. [x] Render mobile Option 1 as a dedicated first-run calibration at 390 × 844.
2. [x] Start first visitors at 0 XP and award the 50 XP baseline only after a real call.
3. [x] Preserve actual campaign state, real scenario data, and a truthful Case 1 handoff.
4. [x] Add skip, replay, validated-call, malformed-call, and legacy-route behavior.
5. [x] Verify keyboard, target sizes, 320px adaptation, desktop lock, and runtime diagnostics.
6. [x] Compare source and implementation together, fix every P0/P1/P2 issue, and preserve comparison history.

final result: passed
