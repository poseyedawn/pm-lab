# Browser Game Comparator Study

- **Date:** 2026-07-15
- **Product under review:** Alvin's Product Lab / Significant
- **Purpose:** Compare durable interaction patterns from successful decision, daily, benchmark, and browser-native games against the current build.

## Comparator selection

These products are not visual references to copy. Each isolates a system Significant needs to solve:

| Product | Pattern studied | Why it matters to Significant |
|---|---|---|
| Human Benchmark | Immediate task entry and score legibility | Significant must convert a cold visitor quickly |
| Infinite Craft | Direct manipulation and discovery | The game should create curiosity through the artifact itself |
| Reigns | Simple decisions with visible, compounding consequences | Significant's choice should feel consequential, not quiz-like |
| New York Times Games | Collection, daily ritual, profile, stats, settings | The Lab needs to feel like a coherent suite |
| Duolingo | Forgiving streak construction and repair | Daily return should motivate without punishing |

## 1. Human Benchmark

The official Reaction Time Test opens with an imperative, one-sentence instruction and an anywhere-on-screen start action: wait for green, then click. It postpones statistics and explanatory material until after the interaction. Results can be compared against collected data and optionally saved to history.

Source: [Human Benchmark — Reaction Time Test](https://humanbenchmark.com/tests/reactiontime)

### Pattern worth borrowing

- Verb-first entry.
- One immediately understood action.
- Result expressed in a familiar benchmark.
- Explanations and history are available without blocking the test.

### Significant gap

Significant opens on a campaign map and then a dense readout. The user must infer the role, the evaluation criteria, and the value of the score. Its “Experimentation IQ” arrives only after ten levels, leaving early performance unanchored.

### Product implication

The entry CTA should begin a calibration decision. The first reveal should give a small, respectful benchmark such as “You spotted the strongest signal” and preview what future cases test. Deeper statistics can remain available, but the first task needs a single dominant clue.

## 2. Infinite Craft

The official Infinite Craft page exposes the canvas, item count, discoveries, sorting, reset action, and draggable elements immediately. It does not lead with a marketing page or tutorial carousel. The possibility space is communicated by what can be manipulated and what can be discovered.

Source: [Neal.fun — Infinite Craft](https://neal.fun/infinite-craft/)

### Pattern worth borrowing

- The play object is the hero.
- Discovery is visible and countable.
- Controls are learned through direct manipulation.
- Reset and collection affordances support experimentation.

### Significant gap

The Lab home describes the game but shows no experiment artifact. The numbered campaign nodes hide the variety of traps and skills. Curiosity depends on copy rather than a visible object that invites action.

### Product implication

Place a real but simplified experiment card in the Lab hero. Let the visitor make or preview a call from the first viewport. Represent discovered trap patterns and mastered judgment types as the collection—not just XP.

## 3. Reigns

Devolver describes Reigns as a left-or-right decision system where each request affects the balance of four factions. Individual choices create delayed consequences, new requests, dynasty risk, specific challenges, and unlocked cards. Bold art direction and a distinctive score turn a mechanically simple input into a recognizable identity.

Source: [Devolver Digital — Reigns](https://www.devolverdigital.com/games/reigns)

### Pattern worth borrowing

- Simple input, deep consequence.
- Persistent meters make trade-offs visible.
- Choices feed future content rather than ending at correctness.
- Narrative framing gives repeated cards meaning.
- Art and sound are part of the product identity.

### Significant gap

Ship/Kill/Keep Running is a strong input, but the choice behaves like a quiz answer. Correctness affects XP, stars, and unlocking; it does not visibly shape a PM identity, reveal a judgment tendency, or create a narrative consequence.

### Product implication

Do not add arbitrary branching story. Instead, let choices build a visible judgment profile: caution under uncertainty, sensitivity to integrity problems, ability to distinguish signal from noise, and willingness to stop bad tests. The campaign can frame cases as a ship-review docket and show how the player's decision style develops.

## 4. New York Times Games

The official Games help documentation describes a suite with a Games collection, Friends leaderboards, per-game statistics and streaks, badges, profile, and settings. Stats are game-specific while the profile and navigation unify the collection. Friends competition is bounded rather than a global leaderboard.

Source: [The New York Times Games app](https://thenewyorktimeshelpcenter.helpjuice.com/360052273251-The-New-York-Times-Games-app)

### Pattern worth borrowing

- Shared suite navigation and settings.
- Each game has its own meaningful performance measures.
- A profile aggregates play without flattening every game into one score.
- Daily games coexist with archives and other modes.
- Social comparison is opt-in and bounded.

### Significant gap

The Lab writes a shared XP profile to local storage but never renders it. Significant exposes several overlapping measures without explaining their hierarchy. There is no shared settings surface, recent-play state, or collection-level reason to try another game.

### Product implication

Create a Lab shell and profile that summarize games played, cases completed, and mastery badges. Keep Significant's first-try mastery and archetype coverage as its primary measures. Use Lab XP only if it unlocks visible recognition across games.

## 5. Duolingo and streak repair

Duolingo reports that separating a streak from a larger daily goal increased Day-14 retention by 3.3% relative, daily active learners by 1%, and the share of daily learners on a streak by 10.5% in its experiment. Its streak freeze protects a missed day, and independent research finds streak repair can reduce the disengagement associated with a break.

Sources: [Duolingo — Improving the Streak](https://blog.duolingo.com/improving-the-streak/), [Silverman and Barasch — On or Off Track](https://doi.org/10.1093/jcr/ucac029)

### Pattern worth borrowing

- Keep the daily action small.
- Separate showing up from performing perfectly.
- Explain and normalize repair.
- Preserve intrinsic value in the daily activity itself.

### Significant gap

The implementation correctly increments the streak on participation, but shields are invisible and unexplained. The completed daily state prioritizes the countdown and offers no additional practice, which can stop an otherwise promising first session.

### Product implication

Make the daily one meaningful case, explain streak protection at the moment it matters, and offer practice or campaign continuation after completion. Avoid guilt copy and do not make a streak the dominant identity.

## Cross-comparator pattern matrix

| Pattern | Human Benchmark | Infinite Craft | Reigns | NYT Games | Duolingo | Current Significant |
|---|---:|---:|---:|---:|---:|---:|
| Core action visible immediately | Strong | Strong | Strong | Varies by game | Strong | Weak |
| Clear competence feedback | Strong | Discovery-led | Consequence-led | Strong | Strong | Partial |
| Distinctive authored identity | Moderate | Strong | Strong | Strong | Strong | Weak |
| Progress has a clear meaning | Score/history | Discoveries | Dynasty/unlocks | Per-game stats | Learning/streak | Fragmented |
| Return loop | Retest/history | Open exploration | New cards/runs | Daily suite | Daily practice | Daily present, underexplained |
| Failure supports another attempt | Immediate retry | No hard failure | New reign | Puzzle-dependent | Lesson retry | Indirect return to map |
| Suite-level profile/settings | Limited | No | No | Strong | Strong | Stored, not shown |
| Portfolio/authorship proof | Low | Maker identity | Studio credits | Editorial brand | Learning mission | About page only |

## What the Lab should adopt

1. Human Benchmark's one-action start and immediately legible result.
2. Infinite Craft's principle that the interactive artifact is the hero.
3. Reigns' connection between simple decisions, long-term identity, and authored art/sound.
4. NYT Games' separation of shared suite identity from game-specific mastery.
5. Duolingo's low-friction, repairable daily ritual.

## What the Lab should avoid

- Copying another product's visual language or mascots.
- Adding global competition before the single-player learning loop works.
- Turning XP into a universal number that obscures game-specific mastery.
- Using streak loss, reminders, or scarcity to manufacture anxiety.
- Adding a long splash that delays play; the entry surface must itself be interactive.
- Treating random reward frequency as a substitute for meaningful consequence.

## Comparator-backed product test

The redesigned first minute should pass this sequence:

1. The player sees a real decision artifact before reading a long description.
2. One action begins the game.
3. The first case teaches one decisive signal.
4. The reveal preserves the evidence and explains the judgment.
5. The result updates a meaningful mastery profile.
6. The next action is obvious: continue, practice, daily, or inspect the case study.
