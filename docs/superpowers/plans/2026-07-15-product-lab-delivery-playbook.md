# Alvin's Product Lab — Delivery Playbook

- **Date:** 2026-07-15
- **Companion plan:** [Product Lab enhancement implementation plan](2026-07-15-product-lab-enhancement.md)
- **Scope:** Later implementation slices, release QA, playtesting, sequencing, and completion gates.

## Slice 5 — Informative game feel and campaign progression

**Purpose:** Make the experience feel alive while reinforcing state and mastery.

### Feedback choreography

| Moment | Visual | Audio | Haptic | Reduced-motion behavior |
|---|---|---|---|---|
| Card enters | Short deal/settle | None | None | Fade or instant |
| Decision press | 3D depression + state lock | Soft click | Light tap | Color/outline only |
| Correct reveal | Evidence highlight -> outcome -> XP transfer | Two-note resolve | One light pulse | No movement/confetti |
| Incorrect reveal | Evidence highlight + contained shake | Low resolve | Optional double pulse | Border/color change only |
| Combo grows | Badge stage and score explanation | Short accent | None | Text update |
| Level unlocks | Path connects to named next case | Reward phrase | Optional pulse | Instant connector update |
| Campaign completes | Profile-card reveal | Full motif | Optional pulse | Static celebratory art |

Use generated or licensed assets for visible illustrations; do not create placeholder SVG/div art as the final visual treatment.

### Campaign map

- Replace anonymous numbered circles with named case nodes or concise trap themes.
- Show the next skill, not the hidden answer.
- Use a clear “Continue” card above the map.
- Animate only the newly earned connection on return.
- Explain 3 stars = first try and 1 star = mastered after practice.
- Provide a mastery breakdown and replay path without forcing sequential navigation.

### Profile and rewards

- Make first-try judgment and archetype mastery the primary score.
- Keep XP as Lab-wide progress only if it unlocks visible, nonessential recognition.
- Replace insulting titles with playful, respectful mastery labels.
- Turn badges into proof of learned patterns, not attendance tokens.

### Files

- Update juice utilities to accept a shared preference object.
- Create a feedback orchestrator hook instead of scattering sound/haptic/confetti calls through rendering components.
- Replace `LevelPath` and `IQCard` with `CampaignMap` and `MasteryProfile`.
- Add tests for preference gating and one-time celebrations.

### Acceptance

- Every effect has an event and semantic purpose documented in code or the motion spec.
- No motion, sound, or haptic bypasses player preferences.
- No campaign state change is communicated by color or motion alone.
- Mid-range mobile CPU throttling shows no blocking animation or delayed decision feedback.
- A player can explain what stars, mastery, XP, combo, streak, and shields each mean.

---

## Slice 6 — Daily ritual, sharing, and session continuation

**Purpose:** Create a return loop that adds value without ending a first visit.

### Daily entry

- Introduce Daily after calibration or one campaign reveal.
- Give Daily a distinct visual stamp while preserving the same core controls.
- Explain that the case is shared for the visitor's local date.
- Show streak and shield rules in context, not as unexplained icons.

### Completed state

- Show today's decisive insight, not only correctness.
- Offer three clear next actions:
  1. Share result.
  2. Practice another case.
  3. Continue campaign.
- Keep the countdown secondary to the result.
- Provide a compassionate repair explanation if a shield was used.

### Sharing

- Use `navigator.share()` when available and `navigator.canShare()` where appropriate.
- Fall back to clipboard, then selectable text.
- Generate a branded, spoiler-safe share image or Open Graph route.
- Deep-link recipients to the Significant introduction or today's case with a safe source parameter.
- Never claim sharing succeeded until the platform promise resolves according to its semantics.

### Files

- Create `src/services/shareService.ts` with a typed result union.
- Update `useDaily`, `ShareGrid`, and the daily page.
- Create a reusable `ShareCard` and route metadata/OG image output.
- Add tests for native share, clipboard, rejection, and unavailable APIs.

### Acceptance

- Daily completion never traps a visitor in a countdown-only state.
- Native share works on supported mobile browsers; clipboard and text fallbacks remain accessible.
- Share output contains no answer spoiler or personal/local profile data.
- Broken streak and shield states explain what happened without guilt copy.
- Local midnight rollover updates the scenario without requiring a full restart.

---

## Slice 7 — Turn About into a portfolio case study

**Purpose:** Convert enjoyment into professional credibility.

### Case-study structure

1. **Hero:** Significant, the judgment it tests, Alvin's role, build period, and live CTA.
2. **Problem:** why experiment interpretation is hard and why a game is the right format.
3. **Core mechanic:** readout -> decision -> evidence reveal.
4. **System design:** scenario engine, ten archetypes, deterministic simulation.
5. **Engagement choices:** competence, progression, daily ritual, and ethical boundaries.
6. **Trade-offs:** zero backend, no accounts, local state, no leaderboard.
7. **Accessibility:** controls, motion, sound, haptics, chart alternatives, keyboard path.
8. **Architecture:** a concise diagram with source links.
9. **Evidence:** tests, performance, playtest observations, and analytics after enough traffic.
10. **What changed:** before/after screenshots and the decisions that followed the audit.
11. **AI collaboration:** what Alvin directed, what agents helped produce, and how quality was verified.
12. **Next question:** one honest product hypothesis still being tested.

### Credibility requirements

- Link research claims to sources.
- Correct privacy and analytics language.
- Separate measured outcomes from hypotheses.
- Show real screenshots and code artifacts.
- Include repository link only if Alvin wants the source public-facing.
- Provide portfolio and contact return paths.

### Files

- Refactor `src/app/significant/about/page.tsx` into a thin page.
- Add case-study components under `src/components/case-study/` if reusable.
- Add accepted screenshots and diagrams under `public/case-studies/significant/`.
- Add route-specific metadata and social preview.

### Acceptance

- A hiring manager can scan the problem, Alvin's role, core decision, trade-offs, evidence, and live CTA in under two minutes.
- All empirical claims have links or are clearly labeled hypotheses.
- The page does not claim “no data collected” while analytics is active.
- Images have useful alternative text; diagrams have equivalent text explanations.

---

## Slice 8 — Accessibility, responsive adaptation, performance, and release QA

**Purpose:** Prove product quality across real use conditions.

The audit baseline is 18 accepted production screenshots and 32 passing live checks. It also records two measured fit defects to prevent regression-by-forgetting: 5px horizontal overflow on the 390px campaign map and a 583px initial round document inside the 568px-tall 320px viewport.

### Automated gates

- `npm test`.
- `npm run lint` with zero new warnings.
- `npm run build`.
- TypeScript strict compile.
- Automated accessibility smoke tests for main route states.
- Link and metadata checks for every public route.

### Manual interaction matrix

| Surface | Required checks |
|---|---|
| Lab home | first/returning, mobile/desktop, keyboard, profile empty/started |
| Significant intro | first visit, skip, replay, continue, storage blocked |
| Campaign readout | all three calls, each archetype layout, segments/no segments, notes/no notes |
| Reveal | correct, incorrect, combo, star, preference variants, double tap |
| Campaign map | locked/open/done, focus order, unlock motion, replay |
| Daily | unplayed, correct, incorrect, rollover, streak, shield, completed |
| Share | native, clipboard, rejection, unsupported, screen reader announcement |
| Profile | incomplete, completed, share, low/high score |
| Case study | mobile reading, desktop scan, links, images, reduced motion |

### Device and preference matrix

- iPhone Safari and Android Chrome on real devices where possible.
- Chrome/Edge desktop and Safari desktop.
- 320, 375, 768, 1024, and 1440 CSS-pixel widths.
- 200% zoom and text-only zoom where supported.
- Keyboard-only and VoiceOver or equivalent screen-reader pass.
- `prefers-reduced-motion`, sound off, haptics off, high-contrast/forced-colors check.
- Private browsing and storage-denied behavior.
- 4× CPU throttle for reveal and map progression.

### Accessibility target

- WCAG 2.2 AA for the web experience.
- 44×44 CSS pixels as the preferred interactive target even where AA permits smaller.
- No essential information communicated only by color, sound, motion, haptics, or chart shape.
- Clear focus, focus order, page titles, headings, landmarks, and live-region restraint.

### Performance target

- LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at p75.
- First decision UI interactive immediately after hydration.
- No eagerly loaded confetti or noncritical illustration bundles.
- Images use explicit dimensions and responsive sources.
- Route-level code remains split; heavy share-card or case-study code is not part of the play bundle.

### Release steps

1. Deploy a preview only.
2. Complete the screenshot-backed comparison against the selected visual source.
3. Run the full interaction matrix on preview.
4. Run five cold-start moderated playtests before production:
   - two PM/product practitioners;
   - two smart non-PM visitors;
   - one recruiter, hiring manager, or client proxy.
5. Record time to first decision, explanation comprehension, next-action clarity, and unaided recall of what the Lab demonstrates.
6. Fix P0/P1 findings and rerun affected flows.
7. Request explicit approval before merging to `main` or deploying production.

---

## Playtest protocol

### Tasks

1. “You found this from a portfolio. Show me what you think it is.”
2. “Start playing without asking me what to click.”
3. “Tell me why you chose that answer.”
4. After reveal: “What did the game teach you?”
5. “What would you do next?”
6. “What does this make you think about the person who built it?”

### Observe without leading

- Time to primary CTA.
- Hesitation on Lab versus game entry.
- Whether p-value/CI vocabulary blocks action.
- Whether the player notices the decisive signal.
- Whether reveal reasoning changes the mental model.
- Whether progression and rewards are understood.
- Whether the player finds Daily or About at an appropriate time.
- Whether the player can return to the portfolio.

### Success thresholds for the first post-redesign test

- 5/5 participants identify the product as a set of product-judgment games.
- 4/5 begin calibration without assistance.
- 4/5 can explain why the revealed answer was correct.
- 4/5 know the next action after reveal.
- 4/5 name at least one concrete product skill demonstrated by the build.

These are directional usability thresholds for a small qualitative test, not statistically representative product metrics.

## Suggested PR sequence

| PR | Scope | Risk | Depends on |
|---|---|---|---|
| 1 | Truthful analytics copy, typed event model, level validation | Low | None |
| 2 | Lab shell, preferences, profile migration | Medium | PR 1 |
| 3 | Lab landing implementation from selected visual source | Medium | PR 2 + design gate |
| 4 | Significant intro and calibration | Medium | PR 2 |
| 5 | Evidence-preserving round and reveal | High | PR 4 |
| 6 | Campaign progression and informative game feel | High | PR 5 |
| 7 | Daily continuation and native sharing | Medium | PR 5 |
| 8 | Portfolio case study | Low/medium | PRs 3–7 for evidence |
| 9 | Full production hardening and QA fixes | High | All prior PRs |

Every PR should have a single product outcome, screenshot evidence for affected states, tests proportional to risk, and no production merge or deployment without explicit permission.

## Dependency policy

Expected new runtime dependencies: none by default.

- Use Framer Motion already present for choreographed motion.
- Use Canvas Confetti already present only for meaningful celebration.
- Use Web Audio and Vibration APIs already wrapped.
- Use `navigator.share()` and clipboard APIs directly.
- Use Next.js metadata/OG capabilities already in the framework.
- Add Zod only if it is not already available when implementation begins; document why storage-boundary validation justifies it and run the dependency hygiene gate.

## Open decisions requiring Alvin's approval before implementation

1. Final Lab name and descriptor.
2. Selected visual direction from the three design concepts.
3. Whether the Lab landing should show in-progress games or only shipped games.
4. Whether the repository link should be visible to portfolio visitors.
5. Whether to preserve XP, simplify it, or make mastery the only visible score.
6. Whether native sharing may include a generated image, text only, or both.
7. Whether the Lab should remain a standalone Vercel project or later inherit the main portfolio domain and navigation.

## Definition of done

- Current and redesigned flows have accepted screenshots for every important state.
- Cold and returning paths are both coherent.
- Calibration, campaign, failure, daily, sharing, profile, and case-study flows pass the manual matrix.
- All P0/P1 audit findings are fixed or explicitly accepted.
- Research claims and analytics language are accurate.
- Tests, lint, build, accessibility, performance, and real-device checks pass.
- Five-person cold-start playtest meets the directional thresholds or produces a documented follow-up slice.
- Ship It branch integration has an explicit, conflict-aware handoff.
- Alvin explicitly approves any merge to `main` and any production deployment.
