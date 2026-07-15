# Alvin's Product Lab — Experience Audit

- **Date:** 2026-07-15
- **Product:** [alvns-productlab.vercel.app](https://alvns-productlab.vercel.app/)
- **Repository:** `poseyedawn/pm-lab`
- **Audited baseline:** production-aligned `main` at `dbd8362`
- **Audit branch:** `codex/product-lab-audit-plan`
- **Mode:** Combined product, game-feel, UX, and accessibility audit
- **Interaction inventory:** [Every source-reachable control and state](2026-07-15-product-lab-interaction-inventory.md)

## Evidence status

This document combines two evidence types and keeps them separate:

1. **Source-confirmed evidence:** every route, state, interaction, and implementation gap described below was traced through the production-aligned `main` branch.
2. **Live visual and interaction evidence:** the production URL was exercised in Google Chrome through Playwright at 320px, 390px, and 1600px widths. The run produced 18 accepted screenshots and 32 passing functional checks covering entry, keyboard navigation, sound persistence, campaign decisions, progression, invalid routing, daily outcomes, sharing, fallback behavior, and return links.

The accepted screenshots and machine-readable DOM/viewport evidence are in [`assets/2026-07-15-product-lab/`](assets/2026-07-15-product-lab/). Every numbered screenshot was opened and inspected. A combined image-rendering artifact encountered during review was checked against cropped originals and RGB pixel samples before acceptance; the source PNGs are intact.

### Repository baseline

- `npm test`: 12 files and 56 tests passed on the production-aligned source.
- `npm run lint`: completed with 0 errors and 3 existing unused-variable warnings.
- `npm run build`: not accepted as evidence from the audit worktree because Turbopack rejected the temporary out-of-root `node_modules` symlink before compiling the app. This is an audit setup limitation, not a confirmed product build failure.
- The production URL returned the routes, labels, stored-state behavior, and seeded scenarios expected from `main`. Vercel project metadata itself could not be refreshed through the current connector, so the commit-to-deployment association remains unverified even though the live runtime matched the audited source.

### Live evidence summary

| Evidence | Observed result | Product implication |
|---|---|---|
| [`01-lab-home.png`](assets/2026-07-15-product-lab/01-lab-home.png) | The cold mobile page ends its meaningful content at 404px of an 844px viewport. | Clear and tidy, but it visibly reads as a one-card placeholder rather than a destination. |
| [`02-significant-first.png`](assets/2026-07-15-product-lab/02-significant-first.png) | The first viewport contains the unsupported “Baseline calibrated” claim and levels 1–6; Daily and About require a long scroll. | The product starts with progression furniture before premise or play. |
| [`05-significant-focus.png`](assets/2026-07-15-product-lab/05-significant-focus.png) | Keyboard order is Sound, level 1, Daily, About. Links receive Chrome's default 1px auto outline, not a product-authored focus treatment. | Operable, but focus quality is inconsistent with the 4px treatment on game buttons. |
| [`06-round-default.png`](assets/2026-07-15-product-lab/06-round-default.png) | The complete round and all three calls fit at 390px, with the card carrying a strong scan hierarchy. | The core interaction is the most finished part of the product. |
| [`07-round-segments.png`](assets/2026-07-15-product-lab/07-round-segments.png) | Segment rows are visually legible, but the table has no caption or headers and the chart has no nonvisual values. | Advanced cases add useful depth while increasing accessibility debt. |
| [`08-reveal-correct.png`](assets/2026-07-15-product-lab/08-reveal-correct.png) and [`09-reveal-incorrect.png`](assets/2026-07-15-product-lab/09-reveal-incorrect.png) | Outcomes are unmistakable and humane; the evidence card is completely replaced by the answer card. | Celebration works, but the evidence-to-explanation learning loop is broken. |
| [`12-daily-correct.png`](assets/2026-07-15-product-lab/12-daily-correct.png) and [`13-daily-incorrect.png`](assets/2026-07-15-product-lab/13-daily-incorrect.png) | Copy feedback works, but the post-play surface is only 324px tall and ends with a small Back link. | A return mechanic becomes a session dead end. |
| [`15-about.png`](assets/2026-07-15-product-lab/15-about.png) | The article is 1,544px of uninterrupted prose at mobile width. | The thinking is credible, but the proof is not presented like portfolio work. |
| [`16-desktop-lab.png`](assets/2026-07-15-product-lab/16-desktop-lab.png) and [`17-desktop-round.png`](assets/2026-07-15-product-lab/17-desktop-round.png) | Both screens keep a roughly 400px column inside a 1600px canvas. | Desktop exposes the absence of composition, context, and authored atmosphere. |
| [`18-mobile-320.png`](assets/2026-07-15-product-lab/18-mobile-320.png) | No horizontal overflow; all three decisions remain visible. The document is 583px tall in a 568px viewport. | Reflow is robust, but the smallest game view requires a slight 15px scroll. |

The Significant map also produced a repeatable 5px horizontal overflow at the 390px layout viewport (`scrollWidth: 395`, `clientWidth: 390`), caused by the alternating translated level path. This is small but should be fixed because it can create lateral page movement on mobile.

## Executive verdict

The game already has a credible core: a distinctive product-management judgment mechanic, real statistical simulation, deterministic scenarios, clear answer choices, concise rounds, thoughtful failure language, seeded daily play, and an ethical intent. Those are the difficult parts to invent.

What makes it feel ordinary is the layer around that core. The Lab landing page does not create anticipation. Significant opens on a level map before it has taught the premise. The round presents expert-density information without a calibration step. The reveal removes the evidence the player needs to learn from the answer. Progress exists, but it is generic and mostly unexplained. The feedback system is present but thin compared with the approved design. The About page tells rather than demonstrates the product thinking. The result is a functioning prototype with a product-quality engine, not yet a complete product.

The recommended direction is to make the Lab feel like a **small, authored arcade for product judgment**: instant to enter, visually memorable, legible to non-PMs, rewarding to master, and explicit about the craft it demonstrates.

## Product intent and audience

The product serves two overlapping users:

| Audience | Immediate question | Success condition |
|---|---|---|
| Curious player | “Will this be fun in the next 30 seconds?” | Starts a round, understands the choice, wants another |
| Recruiter, client, or hiring manager | “What does this prove about Alvin?” | Sees product judgment, craft, technical credibility, and intentional trade-offs |
| Returning player | “Is there something worth coming back for?” | Recognizes progress, finds a fresh challenge, or improves mastery |

The current product is strongest for a PM who already understands A/B testing. It is weakest at converting a cold visitor and at making the experience legible as portfolio evidence.

## Current experience map

```text
Portfolio link
  -> Lab home (/)
      -> Significant home (/significant)
          -> Campaign round (/significant/play?level=N)
              -> Decision
                  -> Reveal
                      -> Significant home
          -> Daily (/significant/daily)
              -> Decision
                  -> Daily result + countdown + share
          -> Design write-up (/significant/about)
```

The flow has no explicit route back to the Lab from Significant, no portfolio return link, no first-run branch, and no visible Lab-wide profile despite storing Lab-wide XP.

## Full page and interaction inventory

### Step 1 — Lab home (`/`)

**General health:** Structurally sound, visually and strategically underdeveloped.

**Visible content from source**

- “Alvin's Lab” heading.
- One-line statement about small games and product craft.
- One purple Significant card with a tagline and “Play” pill.
- “More experiments brewing.”

**Interactions**

- Tap or click the Significant card to navigate to `/significant`.
- Press, keyboard activation, and focus behavior on the card link.

**What is right**

- One obvious choice creates little decision friction.
- The game is reachable in one click.
- Copy describes the subject and hints at the core judgment.
- The card is a semantic link rather than a click handler on a generic container.

**What feels ordinary**

- There is no authored visual world, gameplay preview, mascot/object, motion cue, or artifact that makes the Lab memorable.
- The page reads like a temporary project index: heading, card, “more soon.”
- The CTA says “Play,” but does not make the visitor curious about the first decision.
- There is no evidence of depth: no round length, skills tested, number of cases, daily mode, progress, or recent activity.
- There is no connection back to Alvin, the portfolio, source code, or the reason this Lab belongs in a professional body of work.
- Desktop uses the same narrow column as mobile with no additional composition, atmosphere, or supporting information.

**Accessibility observations**

- `GameCard` has no explicit product-level `focus-visible` treatment; links rely on the browser default outline.
- The white “Play” pill is decorative text inside the link; its affordance may look like a separate control even though the whole card is interactive.

### Step 2 — Significant home, first visit (`/significant`)

**General health:** Functional progression hub, weak first-run introduction.

**Visible content from source**

- “Significant” and “Ship, kill, or keep running?”
- 50 endowed XP and a “Baseline calibrated” banner.
- Sound toggle.
- Ten-node winding level path with only level 1 open.
- Daily experiment CTA.
- Link to the design write-up.

**Interactions**

- Toggle sound on or off; preference persists.
- Activate the open level.
- Observe locked levels without interaction.
- Enter the daily challenge.
- Open the design write-up.

**What is right**

- The level path makes campaign scope visible.
- Locked nodes communicate progression without hiding the remaining content.
- Sound preference is prominent and persistent.
- Endowed XP gives the page a started-not-empty state.
- Daily mode and the PM write-up are discoverable from the game hub.

**What feels ordinary or confusing**

- “Baseline calibrated” claims a completed warm-up that the player never performed. It is a progress trick without a learning moment.
- A cold visitor sees a map before understanding the premise, rules, evidence, or reward.
- Numbered circles do not reveal the theme, skill, or escalating challenge of each level.
- XP, stars, daily streaks, shields, and combo rewards exist as disconnected systems with no clear economy or purpose.
- Daily is visually prominent before the player has completed a normal round, competing with onboarding.
- The page lacks a Lab breadcrumb, back link, game identity art, and a returning-player summary.

**Accessibility observations**

- The level-link circles lack an explicit product-level focus style; keyboard traversal is functional.
- The sound toggle is small text and may not meet a comfortable touch target.
- The loading state is an empty `main` with `aria-busy`, so slow hydration can look like a blank page.
- CSS `animate-pulse` does not currently opt out under `prefers-reduced-motion`.
- The alternating translated path creates 5px of horizontal overflow in the captured 390px mobile context.

### Step 3 — Campaign readout (`/significant/play?level=1`)

**General health:** Strong domain mechanic, high first-round cognitive load.

**Visible content from source**

- Level number, combo when active, and sound toggle.
- Product and hypothesis.
- Metric and test duration.
- Control-versus-variant sparkline.
- Observed lift, confidence interval, p-value, sample size, and optional warning/segment details.
- Three large decisions: Ship, Kill, Keep Running.

**Interactions**

- Inspect the readout.
- Select one of three mutually exclusive calls.
- Use keyboard Tab and Enter/Space on decision buttons.
- Toggle sound before deciding.
- Receive immediate sound, haptic, visual, and state feedback.
- Duplicate rapid decisions are ignored after the first accepted call.

**What is right**

- The choice is crisp and domain-authentic.
- The three buttons are large, color-coded, semantic buttons with visible focus styling.
- The readout uses internally consistent simulated data rather than arbitrary trivia.
- There is no timer, preserving thoughtful judgment.
- A deterministic seed makes failures reproducible.

**What feels ordinary or difficult**

- There is no first-run coaching that tells the player what evidence matters.
- The visual hierarchy treats p-value, confidence interval, lift, timeline, samples, notes, and segments as similarly important.
- The sparkline has no annotated event, trend callout, baseline grid, or accessible data alternative.
- The card and three decision controls are visually strong and comfortably sized, but the UI has no evidence highlighting, hover/focus explanation, or progressive reveal of complexity.
- The game does not ask the player to state a reason, so mastery can collapse into pattern recognition.
- A manually edited invalid `level` query falls back to level 1's scenario while displaying and saving the invalid ID. That can create corrupted or misleading progress.

**Accessibility risks**

- The segment table lacks headers and a caption.
- The chart's accessible label names the comparison but does not expose the values or trend.
- Technical abbreviations are not defined in context.
- Haptics cannot be disabled independently.

### Step 4 — Correct reveal

**General health:** Clear outcome, incomplete learning loop.

**Visible content from source**

- Green reveal card.
- “Correct call!”
- Trap/archetype name.
- Chosen call, correct call, true lift, and explanation.
- XP count-up and possible random “Critical Insight ×2.”
- Next button.

**Interactions**

- Hear click and win tones when sound is on.
- Receive one short vibration.
- See confetti unless reduced motion is detected.
- Activate Next once; duplicate taps are guarded.

**What is right**

- The answer names the reasoning trap rather than only scoring correctness.
- Copy is concise, specific, and not patronizing.
- Outcome is communicated with text as well as color.
- Celebration is proportional and the Next button is clear.

**What feels ordinary or incomplete**

- The readout disappears, so the player cannot compare the explanation against the evidence that produced the decision.
- There is no “what you noticed” or “signal to remember next time” micro-summary.
- XP counts up, but does not visibly travel into the persistent score or unlock anything in the moment.
- The 5% random XP multiplier is unrelated to skill. It adds reward noise without increasing autonomy, competence, or understanding.
- Next returns to the map instead of sustaining flow into the next case.

### Step 5 — Incorrect reveal and retry

**General health:** Emotionally safe, weak recovery guidance.

**Visible content from source**

- Red reveal card.
- “Not this time.”
- Trap name, chosen and correct calls, true lift, explanation, zero XP, and Next.

**Interactions**

- Hear click and loss tones when sound is on.
- Receive a double vibration pattern.
- Select Next and return to the map.
- Re-enter the same open level; a new seeded scenario of the same archetype appears.

**What is right**

- Failure copy avoids shame and leaves room to learn.
- The correct answer and reasoning are explicit.
- A retry uses a different scenario, reducing memorization.
- Combo resets, making consecutive mastery meaningful.

**What feels ordinary or confusing**

- “Next” implies forward progress, but a failed level remains the active level. “Try another case” or “Practice this trap” would set the correct expectation.
- There is no visual comparison of the missed signal.
- Wrong-answer feedback lacks the planned card shake or evidence emphasis.
- Zero XP is punitive without explaining the recovery path.

### Step 6 — Campaign progression and returning home

**General health:** Correct persistence model, generic presentation.

**Interactions and states**

- Correct answer marks the level done and unlocks the next.
- First-try correctness awards three stars; later correctness awards one.
- Consecutive correct calls build a capped ×3 combo.
- XP persists in local storage and is mirrored into a Lab-wide profile.
- Refresh restores campaign progress when storage is available.

**What is right**

- First-try stars create a replayable mastery goal.
- Sequential archetypes create an implicit curriculum.
- Local-only persistence avoids account friction.
- Storage failures fall back to in-memory progress for the current session.

**What feels ordinary or hidden**

- Level completion has no map animation, path growth, named unlock, or preview of the next lesson.
- The Lab-wide profile is written but never shown.
- Stars have no legend and the unusual 0/1/3 scheme is unexplained.
- The archetype curriculum is invisible until after each answer.
- There is no direct “continue campaign” action; the player must infer the next pulsing circle.

### Step 7 — Campaign completion and Experimentation IQ

**General health:** Good collectible idea, weak proof artifact.

**Interactions and states**

- Completing all ten levels shows an IQ title based on first-try performance.
- A large confetti celebration fires once for the completion visit.
- Copy result writes a text summary to the clipboard.

**What is right**

- The title makes performance legible and shareable.
- First-try score is a more meaningful differentiator than raw XP.
- One-time celebration avoids repeated noise.

**What feels ordinary or incomplete**

- The result is a text block, not a beautiful, branded artifact worthy of sharing or adding to a portfolio conversation.
- There is no per-trap breakdown, growth narrative, or “what this says about your judgment.”
- Clipboard errors fail silently.
- The title taxonomy includes an insulting low-end label (“Coin Flipper”) and role labels that may feel more like judgment of the person than playful feedback on one run.

### Step 8 — Daily first play (`/significant/daily`)

**General health:** Strong return-hook foundation, introduced too early.

**Interactions and states**

- Daily scenario is deterministic from local date.
- Player makes the same three-way call.
- Completion records correctness, XP, streak, and possible shield use/earn.
- Daily can only be completed once per local day.

**What is right**

- Everyone receives the same challenge without a backend.
- One round is appropriately small for a daily habit.
- The streak increases on participation, not only correctness, keeping the loop humane.

**What feels ordinary or unclear**

- The daily looks almost identical to campaign play; it lacks a distinct ritual or authored daily identity.
- Shield rules are invisible before they matter.
- There is no practice route after the daily, so a visitor who arrives through a shared result can hit a dead end after one decision.
- There is no timezone explanation; date changes depend on the local clock.

### Step 9 — Daily completed state, countdown, and share

**General health:** Functional utility state, missed social and replay opportunity.

**Interactions and states**

- Shows correct/incorrect summary.
- Countdown ticks to local midnight.
- Share result copies text and briefly changes the label to “Copied!”
- Clipboard absence falls back to a read-only textarea.
- Back to campaign returns to `/significant`.

**What is right**

- The countdown gives the next return a concrete time.
- Share text avoids spoiling the correct call.
- Copy feedback uses a polite live region.
- Clipboard fallback preserves core access.

**What feels ordinary or incomplete**

- “Share result” only copies; mobile visitors do not get the native share sheet.
- There is no visual share card, compare-with-friends prompt, or challenge deep link.
- Clipboard rejection produces no user-facing error.
- The post-daily state offers no “play a practice case,” “continue campaign,” or “understand today's trap” choice beyond a small back link.

### Step 10 — How the game was designed (`/significant/about`)

**General health:** Good thinking, weak portfolio presentation.

**Visible content from source**

- Four text-heavy sections: purpose, trade-offs, engagement system, and technology.
- Back-to-game link.

**What is right**

- The page openly explains engagement choices and ethical limits.
- It names statistical and technical implementation details.
- It makes the meta-product judgment visible instead of hiding it.

**What feels ordinary or damages trust**

- The page is a wall of prose with no diagrams, scenario examples, before/after choices, test evidence, screenshots, code links, or measured outcomes.
- It is written as a retrospective claim, not a case study that demonstrates how decisions were made.
- “No data collected” conflicts with the installed Vercel Analytics and custom event tracking. Even privacy-preserving analytics is still data collection, so the absolute claim should be corrected.
- The page cites Duolingo and psychological concepts without source links or nuance.
- There is no author identity, contact path, portfolio return, repository link, or explicit statement of what Alvin owned versus what AI assisted.

## Cross-experience strengths

1. **The central decision is excellent.** Ship, Kill, or Keep Running converts a real PM ambiguity into a fast, scorable choice.
2. **The statistical engine is credible.** Scenarios are simulated, internally consistent, seeded, and backed by invariant tests.
3. **The tone respects the audience.** Explanations are precise and failures are not humiliating.
4. **The architecture fits the product.** Static delivery, no account, local persistence, and deterministic daily content keep cost and friction low.
5. **The interaction primitives are reusable.** Buttons, sound, haptics, confetti, and count-up utilities are a useful base for the next games.
6. **Ethical intent is explicit.** No fake scarcity, guilt notifications, paywalls, or personal account pressure.

## Cross-experience structural risks

### P0 — The product does not earn the first decision

The cold-start flow jumps from a sparse Lab index to a generic level path to a dense statistics card. It does not create curiosity, establish stakes, teach the decision, or give a fast competence win.

### P0 — The learning loop breaks at the reveal

Replacing the readout with the explanation prevents evidence-to-answer comparison. For a judgment game, that comparison is the primary learning reward.

### P0 — Trust copy contradicts implementation

The About page says no data is collected while `@vercel/analytics` and custom events are active. The fix is transparent, plain-language analytics disclosure, not removing useful aggregate measurement by default.

### P1 — Progression systems exist without a coherent model

XP, first-try stars, combos, a streak, shields, levels, an IQ title, and Lab-wide XP are all implemented, but the player cannot explain what most of them do or why they matter.

### P1 — “Juice” is decorative rather than informational

Button depression, sound, vibration, count-up, pulse, and confetti are present. Missing feedback is the kind that teaches: evidence highlighting, answer comparison, map unlock, combo break, progress transfer, next-skill preview, and share artifact generation.

### P1 — The Lab has no durable identity

The current page could be any side-project index. It needs an authored name, visual language, navigation, promise, collection model, and explicit relationship to the portfolio.

### P1 — Accessibility preferences are incomplete

Confetti respects reduced motion, but pulsing levels, count-ups, pressed transforms, and other motion do not. Haptics lack an opt-out. Links use a thin browser-default outline while game buttons use a stronger authored outline. The chart and segment table need richer nonvisual equivalents.

### P2 — The daily mode can stop a promising session

Once completed, the daily has no practice round or direct next case. A return hook should not terminate the session of a first-time visitor.

## Research and product-direction companion

The research synthesis, source links, positioning direction, emotional arc, and priority order are maintained in [`2026-07-15-game-engagement-and-product-lab-research.md`](../research/2026-07-15-game-engagement-and-product-lab-research.md).

## Residual evidence limits

The live audit is complete for routes, rendered states, keyboard order, clipboard success/fallback, reduced-motion media-query detection, and responsive checks at 320px, 390px, and 1600px. These narrower limits remain explicit:

- Headless capture cannot judge the subjective character or hardware intensity of sound and haptics; it verified controls, state changes, and code paths.
- Reduced motion was verified as an active browser preference and the static round was inspected. Source review, rather than a time-based visual recording, establishes that pulse, count-up, and pressed transforms still run.
- 200% browser zoom, 375px, 768px, real device safe areas, and OS-level native-window chrome were not separate capture targets.
- This pass did not establish production Core Web Vitals or bind the deployment to a Vercel commit SHA because the project connector was unavailable.

The complete check log is [`live-evidence.json`](assets/2026-07-15-product-lab/live-evidence.json), and the reproducible runner is [`live-audit-runner.mjs`](live-audit-runner.mjs).
