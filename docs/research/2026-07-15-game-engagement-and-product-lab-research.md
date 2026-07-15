# Game Engagement and Product Lab Research Brief

- **Date:** 2026-07-15
- **Companion audit:** [Product Lab experience audit](../audits/2026-07-15-product-lab-experience-audit.md)
- **Comparator study:** [Browser game comparator study](2026-07-15-browser-game-comparator-study.md)
- **Purpose:** Translate primary research and authoritative guidance into a product direction for Alvin's Product Lab.

## Research synthesis

### 1. Durable game appeal is built on competence and autonomy, not points alone

Ryan, Rigby, and Przybylski found perceived in-game autonomy and competence associated with enjoyment, preference, and future play. That maps directly to Significant: let players choose a path or difficulty, show how their judgment improves, and make feedback teachable. XP and random bonuses should support mastery, not substitute for it.
Source: [The Motivational Pull of Video Games](https://doi.org/10.1007/s11031-006-9051-8)

### 2. Flow needs clear goals, immediate feedback, concentration, and challenge matched to skill

The GameFlow model organizes player enjoyment around concentration, challenge, skill, control, clear goals, feedback, immersion, and social interaction. Significant has a clear action and immediate outcome, but first-run challenge is not calibrated to novice skill and the explanation is separated from the evidence.
Source: [GameFlow: A Model for Evaluating Player Enjoyment in Games](https://www.valuesatplay.org/wp-content/uploads/2007/09/sweetser.pdf)

### 3. Design from the desired player feeling backward

MDA separates mechanics, runtime dynamics, and the player's emotional experience. The current spec lists many mechanics, but the implementation plan should state the desired emotions per moment: curiosity on entry, agency at the call, tension before reveal, insight after reveal, pride on progression, and authorship on sharing.
Source: [MDA: A Formal Approach to Game Design and Game Research](https://www.cs.northwestern.edu/~hunicke/MDA.pdf)

### 4. First-run onboarding should get to play quickly and teach through action

Apple's game-onboarding guidance recommends avoiding unnecessary splash/menu delay, teaching one essential step at a time, giving the player an active role, and presenting daily systems after onboarding. The right response is not a longer marketing splash; it is a rich entry screen whose primary action begins a guided calibration case immediately.
Source: [Apple — Onboarding for Games](https://developer.apple.com/app-store/onboarding-for-games/)

### 5. Streaks work, but broken streaks can also drive abandonment

Research finds intact logged streaks increase subsequent engagement because the streak becomes a goal, while repair can reduce the negative effect of a break. Duolingo has reported retention lifts from lowering the daily action required to extend a streak. Significant's shield is directionally sound, but it should be explained, repairable, and secondary to the intrinsically satisfying daily judgment.
Sources: [Silverman and Barasch — On or Off Track](https://doi.org/10.1093/jcr/ucac029), [Duolingo — Improving the Streak](https://blog.duolingo.com/improving-the-streak/)

### 6. Endowed progress is most credible when it represents a real accomplishment

The endowed-progress effect can increase persistence, but “Baseline calibrated” currently grants progress without any player action or explanation. Turn the endowment into a 20–30 second calibration case the player actually completes.
Source: [Nunes and Drèze — The Endowed Progress Effect](https://doi.org/10.1086/500480)

### 7. Professional visual quality and visible authorship affect portfolio credibility

Stanford's web-credibility work found visitors quickly judge credibility from visual design and recommends showing the real people and expertise behind a site. The Lab should connect its playful surface to Alvin's authorship, decisions, and evidence without turning the first screen into a résumé.
Source: [Stanford Guidelines for Web Credibility](https://credibility.stanford.edu/guidelines/index.html)

### 8. Accessibility is part of game quality, not a later compliance pass

WCAG 2.2 adds minimum target-size and focus requirements and covers disabling interaction-triggered motion. Game-specific guidance also recommends interactive tutorials, clear objectives, large touch controls, and independent motion/haptic/audio options.
Sources: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/)

### 9. Fast response is part of perceived game feel

Core Web Vitals target LCP at 2.5 seconds or less, INP at 200 ms or less, and CLS at 0.1 or less at the 75th percentile. For this product, interaction feedback should begin in the next frame even when a richer reveal animation follows.
Source: [web.dev — Web Vitals](https://web.dev/articles/vitals)

### 10. Measurement needs an explicit funnel

Vercel Web Analytics can record page views and custom events, but custom events do not contribute to bounce rate. The product needs its own activation and retention definitions rather than treating traffic or bounce as success.
Source: [Vercel Web Analytics](https://vercel.com/docs/analytics)

### 11. Richer marketing assets are hypotheses, not automatic improvements

Apple recommends gameplay-focused previews and screenshots, but its own product-page optimization example shows a control without an app-preview video outperforming the video treatment. The Lab should show real gameplay above the fold, then test whether motion, still imagery, or an interactive preview converts more visitors into a first decision.
Sources: [Apple — App Previews](https://developer.apple.com/app-store/app-previews/), [Apple — Product Page Optimization](https://developer.apple.com/app-store/product-page-optimization/)

### 12. Avoid unsupported “dopamine” explanations

The current design spec calls a random XP bonus “variable-ratio dopamine.” The cited motivation research supports autonomy, competence, relatedness, clear goals, and feedback; it does not justify a claim that a 5% random multiplier creates durable appreciation. Treat the bonus as a testable mechanic, remove it if it does not improve comprehension or continuation, and explain engagement in behavioral terms rather than neurotransmitter shorthand.
Sources: [The Motivational Pull of Video Games](https://doi.org/10.1007/s11031-006-9051-8), [GameFlow](https://www.valuesatplay.org/wp-content/uploads/2007/09/sweetser.pdf)

## Recommended product direction

### Positioning

Use **Alvin's Product Lab** as the clear parent identity, with an optional expressive descriptor such as “An arcade for product judgment.” Avoid naming that makes the games feel like disconnected experiments. The Lab should promise:

- Real product dilemmas.
- One meaningful decision in under a minute.
- No signup.
- A visible skill or judgment outcome.
- A case study showing how the experience was designed.

### First-screen principle

The first screen should not be a passive splash and should not open on the campaign map. It should combine:

- A distinctive Lab mark or illustration.
- A concrete promise: “Can you spot a misleading experiment before it ships?”
- A gameplay artifact visible before scrolling.
- A primary CTA that begins the calibration decision immediately.
- Compact trust cues: “30 seconds · no signup · real simulated data.”
- A quiet connection to Alvin's portfolio and authorship.

### Desired emotional arc

| Moment | Desired feeling | Product response |
|---|---|---|
| Landing | Curiosity | Show a dilemma, not a generic game card |
| First action | Agency | Let the visitor make a call immediately |
| First reveal | Insight | Keep evidence visible and explain the decisive signal |
| First return to map | Momentum | Animate the earned unlock and name the next skill |
| Failure | Productive tension | Offer a focused retry with the missed clue highlighted |
| Completion | Pride | Produce a credible, beautiful judgment profile |
| Daily return | Ritual | Give one fresh case and a forgiving streak model |
| About/case study | Respect | Show decisions, evidence, architecture, and outcomes |

## Priority order

1. Build a real first-run calibration flow and keep the evidence visible through the reveal.
2. Rework the Lab landing and Significant entry around curiosity, authorship, and immediate play.
3. Make progression coherent: cases, mastery, map unlock, Lab profile, and clear next action.
4. Replace generic juice with informative feedback and complete motion/haptic/audio preferences.
5. Upgrade daily completion, native sharing, and practice continuation.
6. Turn the About page into a source-backed portfolio case study and correct the analytics claim.
7. Instrument the full funnel and validate with playtests before expanding rewards or adding more games.
