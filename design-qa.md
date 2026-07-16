# Slice 2 design QA

- **Source visual truth:** `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-6b179acf-c512-485a-b985-24b1d73de97e.png`
- **Normalized source:** `docs/qa/assets/2026-07-15-slice-2/source-option-2-390x844.png`
- **Implementation route:** `/`
- **Implementation screenshot:** `docs/qa/assets/2026-07-15-slice-2/implementation-first-visit-390x844.png`
- **Viewport:** 390 × 844 CSS pixels at device scale factor 1
- **State:** first visit, empty Lab profile, no selected call
- **Runtime:** local production build in Google Chrome through the approved Playwright fallback

## QA inventory

| Claim or control | Functional check | Evidence |
|---|---|---|
| Mobile-first presentation remains locked on desktop | Open `/` at 1440 × 900 and measure `.lab-frame` | `implementation-desktop-locked-1440x900.png`; frame is centered at x=525 and remains 390px wide |
| Option 2 is the first-visit landing | Clear Lab storage and open `/` at 390 × 844 | `comparison-full-390x844.png` |
| Primary evidence and CTA are usable above the fold | Inspect bounds for the evidence card, decisions, CTA, cues, and signature | CTA ends at y=781; final viewport screenshot shows the full first-visit composition |
| Decision cards are real controls | Tap Ship, Kill, and Keep Running; verify exclusive `aria-pressed` state | All three state transitions passed; `implementation-first-visit-selected-390x844.png` |
| The first landing call becomes the calibration decision | Select Ship, follow the CTA, and verify the matching reveal | URL retained `call=ship`; reveal showed “You said Ship”; `implementation-calibration-reveal-390x844.png` |
| A first visitor can defer the decision | Follow the CTA without selecting a call | Game opened in its deciding state; `implementation-calibration-deciding-390x844.png` |
| Returning progress is respected | Stage two completed cases, reload `/`, and follow Continue | Decisions were removed, progress read 2/10 and 350 XP, CTA opened level 3; `implementation-returning-390x844.png` |
| Navigation remains functional | Exercise Product Lab, restart calibration, and Portfolio destinations | Product Lab and restart routes passed; Portfolio resolves to `https://alvn.io` in a new tab |
| Accessibility basics remain intact | Keyboard through controls and inspect names, focus, tap targets, and overflow | All visible controls are at least 44px; `implementation-keyboard-focus-390x844.png` |
| Runtime is clean | Observe page errors, console errors, and failed requests across the critical flow | `verification.json` contains an empty diagnostics array |

Exploratory checks also passed: malformed `call` input is ignored without revealing a result, and the 320 × 568 layout keeps the CTA above the fold without horizontal overflow.

## Full-view comparison evidence

`docs/qa/assets/2026-07-15-slice-2/comparison-full-390x844.png` places the normalized source and the final browser capture in one image at the same viewport and state.

The implementation preserves the source hierarchy and composition: compact Product Lab header, two-line promise, annotated evidence card, handwritten decision prompt, three semantic calls, primary CTA, trust cues, and Alvin signature. The full first-visit experience fits in the intended mobile frame. The actual hypothesis and numbers intentionally come from the game’s deterministic simulation rather than copying the illustrative mock data.

## Focused-region comparison evidence

- `docs/qa/assets/2026-07-15-slice-2/comparison-evidence-card.png` compares hypothesis hierarchy, lift/CI treatment, legend, chart, confidence bands, sample/duration context, radius, shadow, and annotation placement.
- `docs/qa/assets/2026-07-15-slice-2/comparison-decisions-and-cta.png` compares the handwritten prompt, decision-card proportions, Phosphor icons, state colors, CTA, trust cues, and signature.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] The final chart shape differs from the illustrative source because it renders the actual deterministic scenario rather than a traced visual.
  - **Location:** landing evidence card.
  - **Evidence:** both versions use two series and confidence bands; the implementation’s daily values are more angular and its labels are Day 1/7/14.
  - **Impact:** none on task comprehension; the visible statistics, legend, axes, and data provenance remain coherent.
  - **Disposition:** accepted. Replacing the real series with source-shaped decorative data would weaken product truthfulness.

## Required fidelity surfaces

| Surface | Final evaluation |
|---|---|
| Fonts and typography | Nunito preserves the rounded product voice; Caveat provides the selected handwritten annotations and signature. Heading scale, wrapping, weight, and line height match the normalized source hierarchy. |
| Spacing and layout rhythm | Header is 53px; title begins at y=101; evidence card spans y=225–597; decisions y=609–725; CTA y=737–781. The full core composition fits at 390 × 844 and adapts at 320 × 568. |
| Colors and visual tokens | Existing ink, violet, green, rose, neutral, and surface tokens map closely to the selected palette. Contrast and focus states remain clear. |
| Image quality and asset fidelity | The selected direction contains no portrait or required raster imagery. Phosphor supplies the visible UI icons; the chart is generated from real scenario data with binomial confidence bands. No placeholder avatar, fake portrait, emoji, or decorative substitute remains. |
| Copy and content | The hero promise, field-test framing, call labels, CTA, trust cues, and signature preserve the selected direction. Hypothesis, metric, sample size, duration, and chart values intentionally reflect the real game scenario. |

## Primary interactions verified

- Ship, Kill, and Keep Running select exclusively and expose `aria-pressed`.
- A selected first-visit call is validated, carried into calibration, and opens the matching reveal.
- A visitor can continue without preselecting and decide inside the game.
- Returning visitors continue at the first incomplete level and cannot submit the first-case preview against a later scenario.
- Restart calibration returns to a deciding level-one state.
- Product Lab, Significant, Portfolio, CTA, and restart navigation were verified.
- Keyboard focus reaches all visible controls with a visible outline.
- The 390px and 320px viewports have no horizontal overflow; visible controls meet the 44px minimum.
- The desktop viewport keeps a centered 390px mobile surface instead of reflowing into a desktop layout.
- Browser diagnostics recorded zero console errors, page errors, or failed requests.

## Comparison history

- **Pass 0 — blocked:** `implementation-first-visit-390x844-pass0.png`
  - Finding: [P1] CTA began at y=955 and the trust/signature region was outside the 844px viewport.
  - Fix: reduced header, headline, promise, evidence-card, and decision-control density while preserving the source hierarchy.
- **Pass 1 — blocked:** `implementation-first-visit-390x844-pass1.png`
  - Post-fix evidence: CTA moved to y=791, but the trust cues and signature remained cropped.
  - Fix: matched the source card height more closely by correcting hypothesis wrapping, stat typography, chart height, and decision-card proportions.
- **Pass 2 — blocked:** `implementation-first-visit-390x844-pass2.png`
  - Post-fix evidence: CTA moved to y=737; [P2] the signature edge was still clipped and the 320 × 568 CTA ended at y=713.
  - Fix: introduced a deliberate short-viewport composition, retained real evidence, kept 44px controls, and tightened CTA/cue/signature rhythm.
- **Pass 3 — blocked:** `implementation-first-visit-390x844-pass3.png`
  - Post-fix evidence: both viewport-fit checks passed; focused review found [P2] the main annotation sat too low, restart calibration lacked a 44px target, and Portfolio discarded the active game tab.
  - Fix: moved the annotation beside the promise/card shoulder, enlarged restart’s target, and opened Portfolio in a safe new tab.
- **Pass 4 — passed with P3 polish:** `implementation-first-visit-390x844-pass4.png`
  - Post-fix evidence: no P0/P1/P2 findings remained. The chart still looked sparse relative to the source.
  - Polish: added real confidence bands, guide lines, and day labels without changing scenario data.
- **Pass 5 — final:** `implementation-first-visit-390x844.png`
  - Post-fix evidence: full and focused comparisons show the selected composition, real-data chart treatment, complete interaction states, and accessible viewport fit. No actionable P0/P1/P2 findings remain.

## Implementation checklist

1. [x] Render the selected first-visit composition at 390 × 844.
2. [x] Keep the mobile surface locked to 390px on desktop.
3. [x] Preserve real scenario data and connect the landing call to the reveal.
4. [x] Add returning-player continuation and restart behavior.
5. [x] Verify keyboard, tap targets, minimum viewport, malformed input, and runtime diagnostics.
6. [x] Compare source and implementation together, fix every P0/P1/P2 issue, and preserve the comparison history.

final result: passed
