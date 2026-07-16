# Slice 4 design QA

- **Source visual truth:** `/Users/Alvin/.codex/generated_images/019f6652-7ba0-73f3-946d-b60caabafd9f/exec-43a5b627-8d11-471e-8bdf-713d1d4fdbbb.png`
- **User references:** `/Users/Alvin/Downloads/original-d84070a4a1f53d8a43c68dc0f345b8c4.webp`, `/Users/Alvin/Downloads/original-0cbd0c358f53b560b98c6b3e5d5d4967.webp`, and `/Users/Alvin/Downloads/original-a0e9f3a77b3b4339b91e3234237c33a3.webp`
- **Normalized source:** `docs/qa/assets/2026-07-16-slice-4/source-option-2-390x844.png`
- **Implementation route:** `/`
- **Implementation screenshot:** `docs/qa/assets/2026-07-16-slice-4/entry-390x844.png`
- **Viewport:** 390 × 844 CSS pixels at device scale factor 1
- **State:** first visit with empty local progress
- **Runtime:** local production build in Google Chrome through the approved Playwright fallback

## QA inventory

| Claim or control | Functional check | Evidence |
|---|---|---|
| The selected pink hand-and-console direction is now the first screen | Clear storage, open `/`, and compare the whole rendered viewport against Option 2 | `comparison-entry-source-vs-implementation.png` |
| The entry is a full-screen mobile experience | Measure the frame, document width, and CTA bounds | Frame is 390 × 844 with 844px scroll height; CTA is y=741.5–799.5 |
| Desktop preserves the mobile experience | Open at 1440 × 900 and measure `.lab-frame` | `entry-desktop-locked-1440x900.png`; frame is x=525, 390 × 844 |
| Short phones remain usable | Open at 320 × 568 and measure width and scroll height | `entry-short-320x568.png`; frame and document are exactly 320 × 568 |
| Entry preferences are real controls | Toggle sound and motion, then inspect runtime state | Sound changes its accessible label; motion persists as `reduced` |
| Primary entry targets are touch-safe | Measure all visible links and buttons | Sound and motion are 44 × 44; launch CTA is 350 × 58 |
| The complete game uses one coherent visual language | Exercise entry, calibration, campaign, campaign decision/reveal, daily decision/reveal, and About | `flow-contact-sheet.png` and the individual captures |
| Settings remain available inside play | Open the campaign settings panel and inspect its bounds and controls | `campaign-settings-390x844.png` |
| Decisions and outcomes remain functional | Make a calibration call, campaign call, and daily call | Corresponding deciding and reveal captures show the actual state transitions |
| Runtime is clean | Observe console and page errors across the full route sequence | `verification.json` records an empty `consoleErrors` array |

## Full-view comparison evidence

`docs/qa/assets/2026-07-16-slice-4/comparison-entry-source-vs-implementation.png` places the approved Option 2 source and the final production-browser implementation together at the same 390 × 844 viewport.

The implementation preserves the selected composition: saturated coral world, white dimensional display title, 3D hand holding a translucent experiment console, floating candy-colored elements, a status/progress zone, three-step instruction rail, and a broad yellow launch control anchored near the bottom. The implementation replaces decorative sample copy with the real Significant product language and experiment stats.

## Flow comparison evidence

`docs/qa/assets/2026-07-16-slice-4/flow-contact-sheet.png` shows the major experience states together at 390 × 844. The internal pages use the muted blush world from the quiz references while keeping coral, cyan, green, violet, and yellow for decisions and primary actions. Correct, incorrect, and learning moments use generated dimensional medal artwork rather than emoji, placeholder boxes, or CSS drawings.

## Findings

No actionable P0, P1, or P2 findings remain.

- [P3] The production console artwork is not pixel-identical to the approved concept console.
  - **Location:** entry hero.
  - **Evidence:** the source/implementation comparison shows the same hand-held experiment-console silhouette and palette, while the production asset carries real Significant chart and decision motifs.
  - **Impact:** none on the selected direction or hierarchy.
  - **Disposition:** accepted; the production asset is purpose-built for the actual game rather than tracing illustrative mock content.
- [P3] The 320 × 568 adaptation hides the three explanatory step labels.
  - **Location:** short-height entry.
  - **Evidence:** `entry-short-320x568.png`.
  - **Impact:** the hero, status, progress, primary action, and trust cues remain visible without scrolling.
  - **Disposition:** accepted as the short-height priority order.

## Required fidelity surfaces

| Surface | Final evaluation |
|---|---|
| Fonts and typography | Bungee supplies the chunky game-title silhouette; Nunito keeps product copy rounded and readable. The title remains one line at 390px and 320px. |
| Spacing and layout rhythm | The entry follows the source's top controls, centered title, large hero, lower progress, and bottom CTA structure. Internal pages use compact headers, broad cards, and bottom-weighted decisions. |
| Colors and visual tokens | Coral is the immersive entry field; muted blush carries internal screens; cyan, green, rose, violet, and yellow remain purposeful action and state colors. |
| Image quality and asset fidelity | Four production WebP assets were generated for the exact mobile slots: entry world, internal world, correct medal, and learning medal. No substitute portrait appears. |
| Copy and content | Visible language is specific to Significant: simulated product evidence, Ship/Kill/Keep Running, calibration, campaign, daily experiment, and honest local-progress disclosures. |

## Primary interactions verified

- Sound and motion toggle from the entry and persist into the game.
- The launch CTA opens the real first-run calibration.
- A calibration decision produces the dimensional medal reveal and campaign handoff.
- Campaign path, settings, replay calibration, daily entry, and About links remain available.
- A campaign decision produces its matching reveal and next-experiment action.
- A daily decision produces its matching learning reveal.
- Keyboard focus reaches the entry controls with the authored focus treatment.
- The mobile frame remains 390px wide on a 1440px desktop viewport.
- The short 320 × 568 composition has no horizontal or vertical overflow.
- All visible entry controls meet the 44px minimum target size.
- Browser diagnostics recorded zero console or page errors.

## Comparison history

- **Pass 0 — blocked:** initial `entry-390x844.png` capture before the height correction.
  - Finding: [P1] the entry's containing route did not inherit the mobile frame height, causing the background, title, status, progress, and CTA to collapse into the upper 375px while the lower screen remained blank.
  - Fix: gave the route main and entry-containing main-content chain explicit full height, preserving the existing fixed 390 × 844 frame.
- **Pass 1 — final:** `entry-390x844.png` and `comparison-entry-source-vs-implementation.png`.
  - Post-fix evidence: the artwork fills the complete canvas, the CTA sits at y=741.5–799.5, desktop stays locked to 390px, short mobile fits without overflow, and no actionable P0/P1/P2 findings remain.

## Implementation checklist

1. [x] Replace the white landing surface with the approved full-screen coral hand-and-console direction.
2. [x] Carry the muted colorful game language into calibration, campaign, decisions, reveals, daily play, settings, and About.
3. [x] Use real generated production assets, Phosphor icons, tactile controls, and reduced-motion support.
4. [x] Keep the experience locked to a mobile-sized canvas on desktop.
5. [x] Verify the core interaction path, short mobile, desktop lock, keyboard focus, target sizes, and runtime diagnostics.
6. [x] Compare the approved source and implementation together and fix every P0/P1/P2 mismatch.

final result: passed
