# Slice 5 design QA

- **Source visual truth:** user feedback in this task, the approved pastel reward reference at `/Users/Alvin/Downloads/original-0cbd0c358f53b560b98c6b3e5d5d4967.webp`, and the previous incorrect state at `docs/qa/assets/2026-07-16-slice-5/before-calibration-review-390x844.png`
- **Correction asset target:** `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-9339fc5a-29f7-4403-9ec3-c6753d7f04ca.png`
- **Implementation route:** `/significant/calibration` and `/significant/play?level=1`
- **Implementation screenshot:** `docs/qa/assets/2026-07-16-slice-5/calibration-review-390x844.png`
- **Viewport:** 390 by 844 CSS pixels at device scale factor 1
- **State:** clean-win scenario answered with Kill, which is incorrect
- **Runtime:** local production build in Google Chrome through the previously approved Playwright fallback

## Findings

No actionable P0, P1, or P2 findings remain.

The final review state is visually and verbally separate from the correct state. It has no runtime confetti, award ribbon, checkmark, reward chip, yellow celebration button, or vague success headline. The player sees the call they made, the better call, and a short explanation of what evidence mattered.

## Full-view comparison evidence

`docs/qa/assets/2026-07-16-slice-5/comparison-review-before-after.png` places the old and new incorrect calibration states together at 390 by 844.

The old state looked like a win because it used a ribboned medal, decorative confetti, a success-sounding headline, reward pills, and the same yellow action treatment as the correct state. The final state uses a calm lavender review panel, a magnifying glass and retry illustration, an explicit missed-signal headline, a call comparison, a focused explanation, and a violet practice action.

`docs/qa/assets/2026-07-16-slice-5/comparison-outcomes-correct-vs-review.png` shows the final correct and incorrect campaign states side by side. Browser measurement confirms zero canvases after incorrect calibration and campaign calls, while the correct campaign call creates one confetti canvas.

## Focused question-card comparison

`docs/qa/assets/2026-07-16-slice-5/comparison-question-before-after.png` compares the same calibration question before and after the pastel pass. The evidence card changed from pure white to `rgba(255, 240, 243, 0.96)`, matching the blush family used behind the reward artwork. Campaign evidence uses the same token. About cards use `rgba(255, 240, 243, 0.94)`.

## Required fidelity surfaces

| Surface | Final evaluation |
|---|---|
| Fonts and typography | Bungee still owns short game headlines. Nunito handles explanations and comparison labels. The incorrect headline is direct, wraps cleanly, and cannot be mistaken for praise. |
| Spacing and layout rhythm | The review panel fits inside the mobile canvas with a clear order: illustration, outcome, call comparison, explanation, practice note, action. The question-card dimensions and chart layout did not shift. |
| Colors and visual tokens | Question and content cards now use the warm blush pastel token. Incorrect feedback uses lavender and violet, which separates it from the yellow and green reward state without using a harsh punishment palette. |
| Image quality and asset fidelity | The review illustration is a purpose-built WebP with a magnifying glass, incomplete chart, and retry arrow. It contains no medal, ribbon, checkmark, star, trophy, or confetti. |
| Copy and content | Incorrect feedback names the missed call, shows the better call, and explains the evidence. Runtime text and source files contain no em dash or en dash characters. |

## Interaction and accessibility checks

- Incorrect calibration and campaign answers create zero confetti canvases.
- A correct campaign answer creates one confetti canvas.
- Incorrect feedback does not show a `+0 XP` reward chip.
- The incorrect state uses text and layout, not color alone, to communicate the outcome.
- The result container keeps `role="status"` and `aria-live="polite"`.
- The app still scrolls with touch, trackpad, mouse wheel, and keyboard.
- The 390px frame reports `scrollbar-width: none` and has no horizontal overflow.
- All inspected routes and states contain no visible em dash or en dash characters.
- Browser diagnostics recorded zero console or page errors.

## Comparison history

- **Pass 0, blocked:** `before-calibration-review-390x844.png` and the Slice 4 question capture.
  - [P1] Incorrect feedback reused award imagery, decorative confetti, reward pills, and a yellow success action.
  - [P2] Evidence cards were pure white and visually detached from the pastel game world.
  - [P2] The mobile frame exposed a side scrollbar.
  - [P2] Visible copy used em dashes and several explanations read like generated prose.
- **Pass 1, final:** `comparison-review-before-after.png`, `comparison-question-before-after.png`, and `comparison-outcomes-correct-vs-review.png`.
  - The incorrect state now uses corrective feedback, the question cards use blush pastel, scrollbars are hidden without disabling scrolling, and the full copy scan is clean.
  - No actionable P0, P1, or P2 findings remain.

## Implementation checklist

1. [x] Reserve confetti and reward chips for correct outcomes.
2. [x] Replace the ribboned learning medal with a calm correction illustration.
3. [x] Explain the chosen call, better call, and evidence after an incorrect answer.
4. [x] Move question and content cards from pure white to the blush pastel token.
5. [x] Hide mobile scrollbars while preserving all scrolling methods.
6. [x] Run the Humanizer process and remove every em dash and en dash from `src`.
7. [x] Verify the changed states together at 390 by 844.

final result: passed
