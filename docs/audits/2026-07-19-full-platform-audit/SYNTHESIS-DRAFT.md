# Cross-product audit synthesis draft

Superseded by `SYNTHESIS.md`, which reconciles the completed browser pass and final implementation priorities. This file is retained as the source-only checkpoint created before interaction evidence was available.

Status: source-confirmed synthesis only. Visual, interaction, and assistive-technology verdicts remain pending.

## Executive read

Product Lab already communicates more than visual craft. The codebase contains deterministic game systems, authored product-judgment curricula, shared progress, typed analytics, runtime-validated preferences, and meaningful state transitions. An experienced PM or engineer can find evidence of deliberate systems work.

The largest credibility risks are not cosmetic. They sit inside what each game teaches and what the interface promises:

- Significant sometimes grades hidden simulation truth rather than the evidence available to the player.
- Ship It presents legal, ethical, accessibility, security, and truthfulness boundaries as ordinary meter tradeoffs.
- Exception Room says evidence review is central but allows a player to decide without required evidence, while displaying evidence in the smallest and most truncated copy.
- Active Ship It and Exception Room runs cannot be recovered after interruption.
- Shared preference controls are not honored consistently across the games.

These issues can make a polished portfolio reviewer question the underlying product model. Their severity is higher than decorative inconsistency because the collection's central promise is to make product judgment visible.

## Portfolio interpretation by surface

### Product Lab hub

What the source communicates well:

- This is a coherent collection with a shared world, profile, XP, preferences, and individual game identities.
- The hub uses approved dimensional assets and intentionally supports motion and drag without making navigation gesture-only.
- The return to the main portfolio is explicit, safe, and tracked.

What a reviewer may not understand immediately:

- Significant's hub description does not name experiment readouts or statistical judgment.
- The hub does not preview what product capability each game demonstrates.
- Large draggable cards may compete with the vertical gesture needed to discover the full collection.

Pending visual question: does the art carry enough of the missing meaning, and can a visitor reach and select every card naturally on a real phone?

### Significant

What the source communicates well:

- The first-time journey states the decision loop, expected duration, and simulated-data boundary.
- Correct and incorrect outcomes have distinct structure, assets, rewards, sounds, and language.
- Ten authored experiment patterns create a real progressive curriculum rather than a repeated quiz template.

What threatens product credibility:

- Kill and Keep Running are not defined consistently during calibration.
- Winner's Curse is graded from hidden truth rather than observable evidence.
- The answer distribution makes never shipping correct in nine of ten levels and always killing correct in five of ten.
- The experience isolates statistical readout validity without clearly bounding out guardrails, minimum worthwhile effect, reversibility, cost, and decision context.

Likely reviewer interpretation if unchanged: strong experimentation craft at first glance, followed by concern that the scoring model rewards risk avoidance more than evidence-calibrated judgment.

### Ship It

What the source communicates well:

- The card loop is immediately legible and remains operable through explicit buttons when swiping is unavailable.
- Seeded cards, conditionals, arcs, overshoot penalties, and four bounded meters form a real product-tradeoff engine.
- Completion and daily rewards include duplicate-award guards.

What threatens product credibility:

- `No correct answers` is not defensible for dark patterns, fabricated prospect promises, GDPR, authentication, accessibility, and security decisions.
- The Users meter mixes adoption with user welfare, allowing manipulative growth choices to improve the same score.
- The interface reveals affected meters but not card-specific causal reasoning.
- Top ratings depend on survival, meter balance, and arc resolution rather than integrity constraints.
- A 10,000-seed diagnostic confirmed that 1,926 runs containing classified integrity-risk choices still received Promoted or CEO-in-waiting.
- A refresh can erase an almost-complete run.
- The repeated card avatars and meter symbols are operating-system emoji, so the game's core visual identity changes across platforms.

Likely reviewer interpretation if unchanged: a compelling prioritization toy whose model can accidentally imply that harmful product practices are acceptable if the portfolio stays balanced.

### Exception Room

What the source communicates well:

- The framing is specific: human accountability for AI-supported operational decisions under finite review capacity.
- The engine separates approval, correction, escalation, evidence review, expiration, and capacity.
- UI and engine independently prevent decisions that exceed remaining capacity.
- The synthetic-data disclosure is appropriate for a public portfolio.

What threatens product credibility:

- Three authored tutorial cases are not connected to the product.
- Required evidence is content metadata only and is not enforced.
- Any one opened evidence item can inflate the final inspection rate.
- Balanced Operator can be awarded with no evidence review. A 10,000-seed diagnostic found nine evidence-free outcomes, including Safety 100, Service 100, and Capacity 96 on seed 6,240.
- Deadlines can be described inaccurately, and case rows omit the true due tick.
- The case summary is hidden while evidence summaries are 8 pixels and one-line clamped.
- Daily mode is visibly marked as coming soon.
- The campaign and its 8-minute commitment are not recoverable.

Likely reviewer interpretation if unchanged: the most relevant game for AI product leadership, but also the game most likely to expose a gap between the stated human-oversight model and the mechanics actually enforced.

## Engineering interpretation

### Signals of strong engineering judgment

- Deterministic seeded engines support repeatable content and testability.
- Shared profile and preference records use strict Zod validation and migration paths.
- Analytics events are typed, allowlisted, coarsened where appropriate, and fail closed.
- Multiple reward and completion paths defend against repeated input or effect re-entry.
- Build, TypeScript, and 242 automated tests pass at the audited commit.
- Strict TypeScript is enabled, and no production `any` annotations or TypeScript suppression comments were found.
- Critical production hub assets match the audited checkout byte for byte.

### Signals that need deeper scrutiny

- Significant and Ship It accept valid JSON with invalid saved-state shapes.
- Ship It bypasses manual haptic and motion preferences.
- Shared settings ignore failed persistence.
- Game routes send an empty busy main until client hydration and post-mount storage reads finish.
- Standard game routes compose root, game, and route-level chrome inside a fixed mobile frame.
- The public analytics statement conflicts with Exception Room seed tracking.
- No end-to-end browser suite or automated accessibility suite covers the integration boundaries where most confirmed risks live.
- Significant and Ship It inherit generic metadata, and no designed social-preview surface is present.
- Significant and Ship It daily identity, countdowns, streaks, and reward eligibility trust the device-local date.

## Acceptance-criteria status

| Criterion | Current evidence | Status |
| --- | --- | --- |
| First-time visitor understands Product Lab and each game | Source copy reviewed; art and real comprehension untested | Pending browser evidence |
| Goal, rules, stakes, and expected time appear before choice | Significant and Exception Room mostly source-confirmed; Ship It lacks duration | Partially met |
| Every route, control, branch, result, recovery, and persistence path exercised | 158 checks inventoried; no fresh click-through | Not yet met |
| Correct and incorrect outcomes differ without color alone | Significant source-confirmed; other outcome branches await visual review | Pending browser evidence |
| 390 x 844 mobile experience is complete and immersive | Source exposes chrome and nested-viewport risks | Pending browser evidence |
| Keyboard, focus, motion, targets, labels, order, and announcements checked | Several source risks found; direct behavior untested | Not yet met |
| Refresh, history, malformed state, replay, duplicate input, and persistence checked | Unit and source coverage partial; real browser behavior untested | Not yet met |
| Every finding has fresh screenshot, tested step, console observation, or source check | Source findings and runtime checks qualify; visual findings have no screenshots | Partially met |
| Findings separated by product, engineering, accessibility, and opportunity | Per-surface files and checkpoint exist | Met for source phase |
| Final output can support a later implementation plan | Source synthesis exists; visual severity and reproduction still incomplete | Partially met |

## Final audit cannot yet answer

1. Whether a first-time reviewer understands each game from the rendered entry experience.
2. Whether the approved hub art and full silhouettes are visibly intact at all required viewports.
3. Whether card drag blocks scrolling in practice.
4. Whether result tone, motion, sound, haptics, focus, and announcements match their semantic meaning.
5. Whether long content, text resizing, and nested scroll regions keep every action reachable.
6. Whether browser console, network, analytics, and performance behavior remain clean through full runs.

Those questions require the fresh browser evidence defined in `BROWSER-EVIDENCE-RUNBOOK.md`.
