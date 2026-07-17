# Exception Room: Adversarial Product and Implementation Audit

**Auditor role:** Fable (review-only, adversarial)
**Date:** 2026-07-16
**Primary repo/branch:** `portfolio-projects/pm-lab` @ `codex/exception-room-plan` (planning files present, untracked, expected)
**Editorial repo/branch:** `portfolio` @ `codex/exception-room-editorial-plan` (package present, untracked, expected)
**Mode:** Try to disprove readiness. Findings personally verified against the working tree and existing code.

> This audit permits no implementation. It creates exactly one file (this report). No research, spec, plan, article, or image was modified. The untracked `.claude/` directory in the portfolio repo was left untouched.

---

## 1. Verdict

### APPROVE WITH REQUIRED REVISIONS

**What this verdict permits, precisely:**

1. **Visual ideation (ER-002) may begin now**, in parallel with the revisions below. The product inputs the three-option gate needs, the seven-field case anatomy, the three-action model, the queue/evidence/reveal/debrief surfaces, warning/breach states, the 3-5 visible-case constraint, and the mobile canvas, are stable across all three artifacts. The gate must be handed one caveat: the "distinct amber" differentiation premise is weaker than the docs claim (see A12), so color selection must be made against the *actual* token file, not the stated rationale.

2. **It does NOT permit engine, scoring, content, UI, daily, or portfolio-integration implementation.** Two P1 findings mean the core run-time model cannot be implemented deterministically as written, and nine P2 findings include hidden product decisions (profile precedence order, escalation baseline, outcome classification, shift capacity) that the implementer would otherwise be forced to invent, exactly the failure mode this audit exists to prevent. Per the plan's own rule (§13, line 1227), unresolved P0/P1 blocks implementation and P2 requires disposition before the affected stage.

3. **The editorial article is NOT cleared for publication.** It has an internal contract-enumeration inconsistency (A10) plus the standard external-source freshness gate that cannot be closed during this review.

This is **not** a REJECT: the concept is differentiated and sound, the research is genuinely evidence-backed and well-hedged, the anti-gaming architecture is mostly correct, and the reuse of existing pm-lab patterns is largely accurate. The defects are correctable with targeted edits to the three planning docs and the article, not a replan.

---

## 2. Executive summary

**Strongest qualities (verified):**

- **Differentiated thesis with a real learning spine.** "Operational judgment after generation" is a genuinely distinct portfolio signal versus another chatbot demo. The seven-field contract, three-action vocabulary, and multi-dimensional score form a coherent chain from article → game → about page → cover.
- **Anti-gaming design mostly holds.** The "Balanced Operator requires all three dimensions ≥80" gate defeats single-metric optimization; the `min(actualCost, preferredCost)` capacity construction fairly penalizes expensive acceptable alternatives; per-shift capacity makes "escalate everything" literally unaffordable (verified numerically in §7). Confidence deliberately does not encode the answer.
- **Architecture fit is real where it is claimed.** The deterministic per-step-RNG pattern (`mulberry32(hashString(seed:step))`), the `memoryFallback` safe-storage pattern, the daily-seed + midnight-rollover interval pattern, the `syncLabProfile()` summation, the route convention (`/{game}`, `/play`, `/daily`, `/about`), and the reusable juice primitives (`sound.ts`, `haptics.ts`, `PressButton`, `confetti`) all exist in the repo exactly as the plan assumes.
- **Privacy/analytics posture is strong** and the article is properly hedged (VERIFIED_SOURCE / PROPOSED / SYNTHETIC labels, no confidential TRA data, cover is text-free and on-brief at the verified 1536×1024).
- **Plan structure is unusually complete**: 12 user stories with acceptance criteria, a granular ER task tree, a test matrix, stage gates, a release checklist, and a definition of done.

**Principal weaknesses (verified):**

- **The time model is under-defined at three interacting points**: Shift 3's starting capacity is literally missing from the spec table (A01), and the tick↔shift boundary advance plus "max shift tick crossed" semantics are unspecified (A02). Together these make it impossible to prove a clean or Balanced run is even reachable, which in turn makes the ER-205 balance simulation ("preferred policy can reach Balanced") unwritable.
- **Two scoring decisions are hidden or self-contradictory**: profile precedence order and the "escalation baseline" are undefined (A03), and the Safety formula penalizes cautious-but-unnecessary escalation, directly contradicting the research's stated intent that unnecessary escalation should hit service/capacity, not safety (A04).
- **A learning-thesis hole**: nothing in the scoring or content invariants prevents a player from pattern-matching queue-visible fields to the preferred action and reaching Balanced without ever inspecting evidence (A06), the exact behavior the product claims to teach against.
- **Editorial inconsistency**: the article's headline thesis and the claim ledger enumerate the contract as "…authority, time…" while the contract body, the visual brief, and the research use "Priority" (A10).

**Readiness:** Ready for the visual gate; not ready for engine/scoring/content build. Roughly a half-day of owner decisions and doc edits closes the P1s and the mechanics P2s.

**Finding counts:** **P0: 0 · P1: 2 · P2: 9 · P3: 7** (18 total).

---

## 3. Severity-ranked findings

Each finding: ID · severity · file:line · verification status · problem · why it matters · correction · evidence · artifact/stage affected.

### P0: none

No defect prevents the project from proceeding at all. The architecture and concept are sound; every blocker below is a targeted fix, not a redesign.

---

### P1: must resolve before engine/scoring implementation begins

#### A01: Shift 3 starting capacity is missing from the spec
- **File:** `docs/superpowers/specs/2026-07-16-exception-room-design.md:178` (table rows 174-178).
- **Status:** VERIFIED. Row 178 has 5 pipes (4 cells); rows 174-177 have 6 pipes (5 cells). The "Starting capacity" cell for Shift 3 does not exist. Shifts 1 and 2 specify 8 and 10 (lines 176-177).
- **Problem:** The engine's third and hardest shift has no capacity budget. No other artifact supplies it. Plan ER-204 (line 608) *instructs the implementer to create* shift capacity but gives no value.
- **Why it matters:** Capacity is load-bearing, not cosmetic. It is the mechanism that makes "escalate everything" unaffordable (verified in §7: at cap 10, Shift 2 caps escalations at 3). Whether Shift 3 blocks escalate-all, whether all five cases are affordable, and whether the balance sim can reach Balanced all depend on this number. The implementer would invent it. That is the precise outcome the audit is charged to prevent.
- **Correction:** Add the value. Given 5 cases and Approve/Correct/Escalate = 1/2/3, a value of **12** blocks escalate-all (15 > 12) while leaving the preferred path affordable; the owner should set it deliberately and the invariant suite should assert the preferred path is fundable and escalate-all is not.
- **Artifact/stage:** Spec; blocks Stage 1 (ER-106) and Stage 2 (ER-204, ER-205).

#### A02: The tick↔shift boundary advance and "max shift tick crossed" semantics are undefined
- **Files:** spec `:172` (global ticks, capacity resets per shift), `:182` (empty-queue time-advance "in the same shift"), `:193` (shift ends when "the maximum shift tick is crossed"); plan invariant `:219` ("Every action … advances exactly one tick").
- **Status:** VERIFIED (arithmetic) + INFERRED (consequence).
- **Problem:** Two gaps:
  - **(a) Boundary advance.** Shift 1 = ticks 0-3, Shift 2 = 4-7, Shift 3 = 8-12. If a resolution is the only tick-advancer and Shift 1 completes at tick 3 (three cases resolved), the global tick is 3. Shift 2's cases arrive at tick ≥4. The queue is now empty, but the only defined time-advance rule is scoped to "the same shift" (`:182`), so nothing is specified to move the tick from 3 to 4. As written, Shift 2 can stall with no admitted case and no rule to advance time.
  - **(b) Crossing semantics.** With one tick per resolution, Shift 2 (4 cases, ticks 4-7) advances 4→5→6→7→8; the 4th resolution reaches tick 8, which is beyond the max of 7. Shift 3 (5 cases, 8-12) does the same at the 5th case. The spec never states whether a resolution *at* `maxTick` is allowed (resolve at the boundary, then end) or forbidden (shift already over). This determines whether a full-clear is achievable.
- **Why it matters:** These are undefined transitions in the central loop. They (i) risk a deadlock at every shift boundary, (ii) make "can the preferred policy resolve everything on time?" unanswerable, and therefore (iii) make ER-205's assertion "preferred policy can reach Balanced Operator" unverifiable and ER-106's determinism tests unwritable. Balanced needs Service ≥80; if the tick budget forces breaches, Balanced may be structurally unreachable.
- **Correction:** State explicitly, e.g.: "On shift completion the engine sets `tick = nextShift.openingTick` and resets capacity"; and "A resolution is permitted while `tick <= shift.maxTick`; the post-resolution advance that produces `tick > maxTick` ends the shift." Then add an invariant test that the authored schedule admits a full-clear path within each shift's tick budget (or explicitly document that some breach is intended and cap the reachable Service accordingly).
- **Artifact/stage:** Spec + plan; blocks Stage 1 (ER-103, ER-106, ER-107) and Stage 2 (ER-205).

---

### P2: must resolve before the affected stage begins

#### A03: Profile precedence order and the "escalation baseline" are undefined
- **Files:** spec `:255`-`:265` (profiles + "Profile precedence must be explicit and unit tested"); research `:228`; plan ER-202 `:576`-`:582` ("Encode profiles in a single ordered rule list").
- **Status:** VERIFIED. All three artifacts *require* an explicit order and none *provides* it. "Escalation burden above the authored baseline" (spec `:260`) references a baseline that is never defined.
- **Problem:** Multiple profiles co-apply. Worked overlaps: safety 95 / service 60 / escalation-heavy → matches both **Safety First** and **Escalation Heavy**; safety 65 / service 90 / unresolved > 1/3 → matches both **Speed Over Evidence** and **Backlog Bound**; all-three ≥80 with >half escalated → matches both **Balanced Operator** and **Escalation Heavy**. Without an order, the user-facing label is nondeterministic, and **Safety First** cannot even be evaluated without the baseline number.
- **Why it matters:** The profile is the headline of the debrief and must be published on the about page (US-08, US-11). The label a player receives is a product-judgment decision the owner should make, not the implementer.
- **Correction:** Publish the ordered list (recommend: Balanced → Speed Over Evidence → Escalation Heavy → Backlog Bound → Safety First → Calibration in Progress, tuned to intent) and define the escalation baseline concretely (e.g., "escalations > 1 per shift on average" or "> the preferred-policy escalation count for this seed").
- **Artifact/stage:** Spec; blocks Stage 2 (ER-202).

#### A04: The Safety formula penalizes cautious escalation, contradicting the research
- **Files:** spec `:232`-`:236` (Safety credits only "preferred and acceptable"); research `:182` ("Unnecessary escalation should affect service and capacity without being described as a moral failure").
- **Status:** VERIFIED (contradiction by direct read) + INFERRED (formula behavior).
- **Problem:** An unnecessary escalation is neither the preferred nor an acceptable action, so under the Safety definition its consequence weight drops out of the numerator → Safety falls. But escalation avoids harm; it is a *handoff*, not an unsafe completion. The research explicitly says unnecessary escalation should cost Service and Capacity, not Safety. So the spec makes over-caution reduce Safety, which the research forbids.
- **Why it matters:** It produces misleading Safety scores and mis-frames the debrief (Fable prompt #8: acceptable/cautious actions must be scored fairly). It is also *redundant*: escalate-everything already tanks Service and Capacity (verified §7), so the Safety penalty is unnecessary for anti-gaming and only introduces the contradiction.
- **Correction:** Credit Safety for any non-harmful resolution (preferred, acceptable, **or** a cautious escalation that avoids the authored harm); reserve zero Safety credit for unsafe approvals (harmful completions) only. Route the cost of unnecessary escalation entirely to Capacity/Service. Verify escalate-everything still cannot reach Balanced (it will not, Service/Capacity collapse).
- **Artifact/stage:** Spec + research alignment; blocks Stage 2 (ER-201).

#### A05: The outcome-classification function is incompletely specified
- **Files:** plan `:167` (`outcome: 'preferred' | 'acceptable' | 'unsafe' | 'unnecessary'`); spec `:200`-`:216`, `:236`.
- **Status:** VERIFIED (enumeration gap).
- **Problem:** The four outcome labels drive both scoring and reveal copy, but the mapping from `(action, case)` to outcome is only defined for two cases: unsafe = approve-with-missing/conflicting-critical-evidence; escalation = justified/acceptable/unnecessary per authored rules. Undefined combinations include: **correcting a clean-approval case** (over-correction, not unsafe, not an escalation, so which bucket?); **approving a case whose preferred action is Correct but whose evidence is not "critical conflicting"** (wrong output propagated, yet the narrow "unsafe" definition may not capture it, falls through to no bucket). There is no "wrong-but-not-unsafe" outcome.
- **Why it matters:** Cases that fall through the classification get ambiguous safety credit and ambiguous reveal copy, which directly undermines the "reveal distinguishes preferred/acceptable/unsafe/unnecessary" acceptance (US-07) and the scoring monotonicity tests (ER-201).
- **Correction:** Publish a total decision function mapping every `(action × case)` to exactly one outcome, including over-correction and non-critical wrong approvals. Add a content-invariant test that every case × every action yields a defined outcome.
- **Artifact/stage:** Spec; blocks Stage 2 (ER-201, ER-203).

#### A06: A no-evidence pattern-matcher can reach Balanced (learning-thesis hole)
- **Files:** spec `:236` (evidence views are a separate process measure, excluded from scores); US-03 `:261` (cards show consequence, due, age, route reason); spec falsifiable thesis `:16`; plan Fable prompt #1 `:1211`.
- **Status:** VERIFIED (mechanism) + INFERRED (exploitability, pending content).
- **Problem:** Evidence inspection costs nothing and affects no score dimension. The only defense is that the preferred action must be *underivable* from queue-visible fields. But nothing in the content invariants (spec `:268`-`:281`, plan §12) forbids route reason + consequence from deterministically implying the action (e.g., `missing-evidence`→escalate, `repeat-correction`→correct, low + `random-quality-sample`→approve). If such a mapping exists, a player pattern-matches to Balanced without opening a single evidence panel, precisely the behavior the product claims to teach against.
- **Why it matters:** It falsifies the product thesis while producing a high score, and it is invisible to the score (evidence rate is a raw metric only).
- **Correction:** Add a content invariant: for each surface-cue combination (route reason × consequence × confidence band), at least two cases must have *different* preferred actions, forcing evidence inspection to disambiguate. Consider a soft signal in the debrief when a high score co-occurs with a near-zero evidence rate ("scored well without inspecting evidence, replay and verify").
- **Artifact/stage:** Spec + content; blocks Stage 2 (ER-204) and informs ER-205.

#### A07: Analytics has no typed contract; "unsupported event fails TypeScript" is new infrastructure, not an extension
- **Files:** `src/lib/analytics.ts:3` (`track(name: string, props?: Record<string, string|number|boolean>)`, fully permissive); spec `:313`-`:332`; US-12 `:374`; plan ER-304 `:696`, `:706`.
- **Status:** VERIFIED. `track` is imported untyped in 10+ call sites (`significant/*`, `ship-it/*`, `components/*`). No typed event union exists.
- **Problem:** ER-304 says "Modify `analytics.ts` **only if** the current wrapper requires extension" and the acceptance "An unsupported event or property fails TypeScript." There is nothing to *extend*: the current signature accepts any string and any props. Making invalid events fail typecheck requires introducing a typed layer. Retrofitting the shared `track` to be strict would break/entangle the 10 existing Significant/Ship It callers ("do not refactor Significant or Ship It", plan `:150`).
- **Why it matters:** Hidden scope and a coupling trap. The acceptance criterion cannot be met by "extending"; it needs a new, isolated typed wrapper.
- **Correction:** Specify a dedicated typed façade (e.g., `trackException(event: ExceptionAnalyticsEvent)`) that narrows to the permitted event/property unions and delegates to the existing `track`, leaving current callers untouched. Update ER-304 wording from "extend" to "add a typed Exception Room analytics façade over the existing wrapper."
- **Artifact/stage:** Plan; blocks Stage 3 (ER-304).

#### A08: Seeded arrival-order variants conflict with per-case authored `arrivesAtTick`/`dueAtTick`
- **Files:** spec domain model `:135`-`:136` (`arrivesAtTick: number; dueAtTick: number` authored per case); plan ER-103 `:490`-`:491` ("Seed any arrival-order variant through the existing PRNG. Keep authored due ticks internally consistent with arrival ticks"); US-09 `:335`-`:337` (daily seed + new seeded variant).
- **Status:** VERIFIED (representational contradiction).
- **Problem:** `arrivesAtTick` and `dueAtTick` are absolute authored integers. A seed that reshuffles arrival order must change *when* each case arrives, which invalidates its absolute `dueAtTick` (a case authored to be due at tick 5 cannot arrive at tick 6). You cannot both author absolute ticks and reshuffle order deterministically. The daily "variant" and the "replay new seed" feature therefore have no consistent representation.
- **Why it matters:** Daily mode (Stage 6) and replay-new-seed (US-09) depend on this; the research also relies on seeded variants to defeat memorization (research risk table `:358`). As written the two mechanisms are mutually inconsistent.
- **Correction:** Choose one model. Either (a) make due **relative** (`dueOffset` from arrival) and let the seed permute arrival slots, recomputing absolute due at run start; or (b) keep absolute authored ticks and define "variant" as *content-set selection / within-tick tie ordering* only, not a global reshuffle. Update the domain model and ER-103/ER-601 accordingly.
- **Artifact/stage:** Spec + plan; blocks Stage 1 (ER-103) and Stage 6 (ER-601).

#### A09: The practice case is required but unassigned, and its scope is undefined
- **Files:** research `:130` (1 practice case + 12 campaign cases); US-02 `:243`-`:251` ("The practice case demonstrates route reason, consequence, evidence, and **all three actions**"); plan ER-102 `:466`-`:476` (3 test fixtures), ER-204 `:604`-`:618` (author **twelve** campaign cases).
- **Status:** VERIFIED (traceability gap).
- **Problem:** No ER task authors the practice content. ER-102 builds three *test fixtures*; ER-204 authors the *twelve campaign* cases; ER-303/ER-407 build the practice *flow*. The practice *case* (a 13th, per research) is orphaned. Separately, one case can take only one action, so "demonstrates all three actions" is impossible for a single practice case unless practice is a guided multi-case walkthrough, the scope (1 vs 3 cases, guided vs free) is unspecified.
- **Why it matters:** US-02 has no implementing task and an untestable ("all three actions" in one case) acceptance criterion.
- **Correction:** Add an ER task under Stage 2 to author the practice content, and decide practice scope (recommend: a short 3-case guided walkthrough, one per action, unscored). Reword US-02 to match.
- **Artifact/stage:** Plan; blocks the practice slice (ER-303/ER-407) and Stage 2 content.

#### A10: Editorial: the article thesis and claim ledger enumerate the contract differently from its own body
- **Files:** `portfolio/docs/editorial/articles/11-the-exception-queue-is-the-product/article.md:24` ("…trigger, consequence, evidence, **authority, time**, resolution, and learning…") and `claim-ledger.md:13` (same "authority, time") **vs** the contract body `article.md:67`-`:69` (field 4 = **Priority**), `visual-brief.md:37` (**Priority**), and research `:141`-`:149`, `:146` (**Priority**).
- **Status:** VERIFIED (internal + cross-surface inconsistency).
- **Problem:** The article's bold central claim and the ledger's headline PROPOSED claim name a field ("time") that the article never defines as one of the seven; the actual field 4 is "Priority" (which *includes* time/age as an input). The game's about page (ER-701) will publish the same seven-part contract using "Priority," so a visitor moving between the article and the game sees two different enumerations.
- **Why it matters:** Portfolio-pair coherence is an explicit goal (research `:88`-`:93`). A recruiter noticing the mismatch reads it as imprecision in the framework being sold as "original and inspectable."
- **Correction:** Make the thesis (`article.md:24`) and ledger (`claim-ledger.md:13`) say "…evidence, priority, authority, resolution, and learning," matching the body and visual brief.
- **Artifact/stage:** Article; publication gate.

#### A11: Daily midnight rollover mid-run can reseed/reset an in-progress run
- **Files:** plan ER-601 `:913`-`:923` ("Handle midnight rollover through a live date check", "Midnight rollover updates without hard refresh"); reference pattern `src/hooks/useShipDaily.ts:22`-`:33` (1s interval recomputes `today`/seed).
- **Status:** VERIFIED (pattern) + INFERRED (Exception Room consequence).
- **Problem:** The daily hook recomputes `today` and the derived seed reactively. Ship It's daily is a single quick decision, so mid-run rollover is negligible. Exception Room's daily run is 4-6 minutes; a player starting near 23:5x will cross midnight mid-run, and a reactive seed change would reseed or reset the active run. The plan addresses "same-day replay overwrite" but not an in-flight run at rollover.
- **Why it matters:** Silent loss/reset of an in-progress run; a real (if low-frequency) correctness bug that the reference pattern does not already solve for a long run.
- **Correction:** Specify that an in-progress daily run pins its seed/date at start and completes under that date; a detected rollover updates the *next* run's availability and countdown, never the active run's seed.
- **Artifact/stage:** Plan; blocks Stage 6 (ER-601).

---

### P3: improvements that can reasonably be deferred (with disposition)

#### A12: "Distinct amber" differentiation collides with the existing `--color-gold`
- **Files:** research `:291` ("warm amber … distinct from Significant violet and Ship It stakeholder colors"); spec `:292`; `src/app/globals.css:8` (`--color-brand` violet is the only brand token), `:15` (`--color-gold: #f59e0b`, amber, already used by Ship It's business meter and `.btn-3d`).
- **Status:** VERIFIED.
- **Problem:** Ship It has no single signature color; it uses the shared palette (sky/gold/violet/rose) for its four meters, and that palette already includes amber (`--color-gold`). So "amber, distinct from Ship It" is self-undercutting: Exception Room amber will read as Ship It's business-meter gold.
- **Correction (feed into ER-002):** Either commit to teal as the dominant identity (amber as accent) or choose a distinctly different amber hue and register it as a new token; make the differentiation decision against the token file, not the stated rationale. Update research/spec wording.
- **Artifact/stage:** Research/spec; informs visual ideation.

#### A13: Storage schema-versioning/migration is new work, not "reuse existing pattern"
- **Files:** plan ER-301 `:644`-`:652` ("Reuse the existing safe-storage pattern" **and** "Store schema version", "future-version tests"); `src/lib/shipit/state.ts:51`-`:57` (`safeParse` = spread defaults over parsed JSON; no version field, no migration).
- **Status:** VERIFIED.
- **Problem:** The existing pattern is a version-less merge; versioning in the repo is done via the storage-key suffix (`:v1`). "Store a schema-version field + future-version migration tests" is genuinely new behavior, mildly at odds with "reuse the existing pattern."
- **Correction:** Clarify whether versioning is key-suffix (existing) or a stored field (new), and if new, scope it as new work with its own migration/`future-version` test, not as reuse.
- **Artifact/stage:** Plan; Stage 3 (ER-301).

#### A14: XP rule is undecided and philosophically inconsistent with Ship It
- **Files:** plan ER-302 `:664`-`:672` ("idempotent … one-time reward", "according to the selected XP rule"); `src/lib/shipit/state.ts` + `src/hooks/useShipDaily.ts:44` (`xp: prev.xp + xp`, **cumulative**); double-grant guard comment `useShipDaily.ts:38`-`:40` (known bug class, commit 3c43256); `src/lib/labProfile.ts:8`-`:14` (sums each key's `xp`).
- **Status:** VERIFIED.
- **Problem:** Ship It's XP accumulates per run; the plan wants Exception Room XP idempotent/one-time. Both feed the same `pmlab:profile:v1` sum, mixing semantics. "The selected XP rule" is undecided. Also, the codebase learned the hard way to guard daily XP double-grants (`lastDailyDate === date` before adding), ER-601 should require that guard explicitly.
- **Correction:** Decide the XP rule (recommend a fixed milestone grant on first campaign completion + a small per-daily grant, matching Ship It's model), and require the same-day double-grant guard in ER-601 acceptance.
- **Artifact/stage:** Plan; Stage 3 (ER-302) / Stage 6 (ER-601).

#### A15: "Review time / handling time" (article) vs free evidence inspection (game)
- **Files:** `article.md:108` (instrument "handling time"), `:93` ("scarce human attention"); spec `:194` (evidence inspection spends no capacity, no tick).
- **Status:** VERIFIED (thematic).
- **Problem:** The article frames review *time* as the scarce resource; the game makes evidence inspection free and models scarcity only at the action (capacity) level. Defensible (WCAG-driven, no timer), but a recruiter comparing the pair may expect time-as-cost.
- **Correction:** The about page should explicitly reconcile this ("capacity abstracts reviewer effort; inspection is free by accessibility choice"). No mechanic change needed.
- **Artifact/stage:** About page copy; Stage 7 (ER-701).

#### A16: Capacity can read 100 while the player does almost nothing
- **Files:** spec `:248`-`:252` (Capacity = safe value / capacity spent).
- **Status:** VERIFIED (by calculation, §7).
- **Problem:** Resolving only the cheap clean-approval cases at preferred cost and letting the rest expire yields Capacity = Σ1/Σ1 = 100. It rewards inactivity in isolation.
- **Why it's P3:** Mitigated, the all-three-≥80 gate and **Backlog Bound** (unresolved > 1/3 arrivals) both catch it, and the debrief shows raw metrics. But it is counterintuitive and should be a named test.
- **Correction:** Add an ER-201/ER-205 test asserting a "resolve-only-cheap" policy gets high Capacity but Backlog Bound + sub-80 Service/Safety, and confirm the about page explains Capacity is not a utilization target.
- **Artifact/stage:** Plan (test); Stage 2.

#### A17: Plan gates the engine on visual selection; research says visual does not block the engine
- **Files:** plan `:31` ("Start implementation only after Alvin approves the plan **and selects one of three visual directions**"); research `:381` ("These decisions do not block engine and content planning").
- **Status:** VERIFIED (inconsistency).
- **Problem:** Minor sequencing contradiction. It also under-uses available parallelism (engine + content could proceed while the visual gate runs).
- **Correction:** Align: allow Stage 1-2 (engine/content) to proceed once the plan is approved; gate only Stage 4+ (UI) on visual selection. Update plan `:31`.
- **Artifact/stage:** Plan sequencing.

#### A18: "Capacity exhausted" end-condition is imprecise
- **Files:** spec `:182` ("If remaining capacity cannot fund any available action, the shift ends"); action costs Approve 1 (`:180`).
- **Status:** VERIFIED (ambiguity).
- **Problem:** Since Approve costs 1, "cannot fund any action" effectively means capacity < 1 (i.e., 0). And "any available action" is ambiguous between per-case (a case whose only allowed action is Escalate at cost 3, with capacity 2) and per-queue. The engine could strand a player in forced unsafe approvals rather than ending the shift.
- **Correction:** State the end-condition as "capacity < the minimum affordable action across all queued cases," and decide whether a case can restrict its allowed actions such that it becomes unaffordable while others remain.
- **Artifact/stage:** Spec; Stage 1 (ER-105/ER-106).

---

## 4. Cross-artifact contradiction table

| # | Conflict | Artifact A (file:line) | Artifact B (file:line) | Required resolution |
|---|---|---|---|---|
| 1 | Shift 3 has no capacity value | spec:178 (4 cells) | spec:176-177 (shifts 1,2 = 8,10); plan ER-204:608 | Supply the number (A01) |
| 2 | Contract enumerated as "authority, time" vs "Priority" | article.md:24; claim-ledger.md:13 | article.md:67-69; visual-brief.md:37; research:141-149 | Use "priority" everywhere (A10) |
| 3 | Unnecessary escalation: safety vs service/capacity | research:182 (service/capacity) | spec:232-236 (Safety credits only preferred/acceptable) | Make cautious escalation safety-neutral (A04) |
| 4 | Absolute authored ticks vs seeded arrival-order variant | spec:135-136 (absolute `arrivesAtTick`/`dueAtTick`) | plan ER-103:490-491; US-09:335-337 | Pick relative-due or restrict "variant" (A08) |
| 5 | Analytics "unsupported event fails TypeScript" vs untyped wrapper | spec:313-332; US-12:374; plan:706 | src/lib/analytics.ts:3 (untyped, 10 callers) | Add typed façade; reword ER-304 (A07) |
| 6 | Engine gated on visual selection vs not | plan:31 | research:381 | Gate only UI on visual (A17) |
| 7 | "Reuse safe-storage pattern" vs "store schema version + future-version tests" | plan ER-301:645, :648 | shipit/state.ts:51-57 (version-less) | Clarify versioning model (A13) |
| 8 | XP idempotent one-time vs cumulative | plan ER-302:664-672 | shipit/state.ts; useShipDaily.ts:44 | Decide XP rule (A14) |

---

## 5. State-machine audit

### Reconstructed run model (independently derived from spec + plan)

**State vector** (spec `:152`-`:166`): `{ seed, mode, shift∈{1,2,3}, tick, capacityRemaining, queuedCaseIds[], selectedCaseId, resolved[], evidenceViewed{}, status∈{practice,active,complete}, history[] }`. Per-case status ∈ {queued, resolved, escalated, expired} (spec `:105`).

**Transitions:**

1. `startExceptionRun(seed, mode, cases)` → shift 1, tick 0, capacity 8, admit cases with `arrivesAtTick ≤ 0`, status active (after optional practice).
2. `selectCase` → sets `selectedCaseId` (no tick, no capacity). Rejects terminal cases.
3. `viewEvidence` → appends to `evidenceViewed` (no tick, no capacity; dedup). *(invariant, plan :507-:508)*
4. `resolveCase(decision)` → records `CaseResolution`, case → terminal, capacity −= cost (never < 0).
5. `advanceAfterResolution` → tick += 1; age unresolved; admit `arrivesAtTick ≤ tick`; emit warning (1 tick before due) / breach (after due), each ≤ once.
6. `completeShiftIfNeeded` → ends shift on {all required resolved | capacity can't fund any action | max tick crossed}; reset capacity; carry unresolved per content rule; shift += 1 or status → complete.
7. Empty queue + future same-shift arrival → `time-advanced` to arrival tick (no capacity).
8. `scoreRun` (terminal) → `ScoreBreakdown`; `replayRun(seed, history, cases)` reproduces serializable state.

### Invariants (plan :213-:226): assessment

Sound and testable: capacity ≥ 0; case enters queue once; one terminal state per case; no terminal case selectable; evidence never advances tick; warning/breach ≤ once; no case vanishes at a shift boundary; replay byte-equivalent. **These are good.**

### Transition problems / missing invariants / deadlock risks

- **Undefined: boundary tick advance** (A02a). No rule moves `tick` from a completed shift's end to the next shift's opening tick; the time-advance rule is scoped "same shift." **Deadlock risk** at every shift boundary if the next shift's cases arrive at a later tick and the queue is empty.
- **Undefined: resolution at `tick == maxTick`** (A02b). "Crossed" is not defined as `>` vs `>=`. Determines whether a full-clear is reachable in Shifts 2-3 (equal ticks and cases).
- **Missing value: Shift 3 capacity** (A01), the engine cannot initialize Shift 3.
- **Missing invariant: schedule feasibility.** No invariant asserts that the authored arrival/due schedule permits resolving each shift's required cases within its tick budget. Without it, ER-205's "preferred → Balanced" may be structurally false.
- **Under-specified: capacity-exhaust condition** (A18), per-case vs per-queue affordability; risk of forced unsafe approvals instead of a clean shift end.
- **Under-specified: never-arrived cases at run end.** A case whose `arrivesAtTick` is never reached (shift ended early) must be counted (plan ER-106:537 says "accounts for every authored case"), but the status taxonomy (`queued|resolved|escalated|expired`) does not clearly name "never arrived." Recommend an explicit terminal for this.
- **`resolveCase` vs `advanceAfterResolution` tick ownership**, two functions; the spec should state which advances the tick (recommend: `advanceAfterResolution` owns the single increment; `resolveCase` records `resolvedAtTick` = pre-advance tick). Minor but must be pinned for determinism.

**No** unreachable-state or infinite-loop risk was found *given* the above are resolved; the immutable-update engine style (verified in `shipit/engine.ts`) precludes accidental mutation loops.

---

## 6. Adversarial simulation results

Each required scenario, with resulting state / expected behavior / ambiguity.

| # | Scenario | Result / expected behavior | Ambiguity |
|---|---|---|---|
| 1 | Empty queue, future arrival remains | `time-advanced` to arrival tick, no capacity (spec:182) | **Cross-shift not covered** (A02a) |
| 2 | Capacity cannot fund any action | Shift ends "capacity exhausted"; unresolved carry/expire | Per-case vs per-queue (A18); Approve=1 means this ≈ capacity 0 |
| 3 | New case arrives at exact shift boundary | Admitted when `arrivesAtTick ≤ tick` in the new shift | Depends on undefined boundary advance (A02a) |
| 4 | Acceptable alt costs more than preferred | Safe + on-time; Capacity value = `min(actual,preferred)`, spent = actual → capacity-penalized | **Well-defined; correct** ✓ |
| 5 | High-confidence recommendation is unsafe | Approve → unsafe event, 0 safety credit; preferred = correct/escalate (archetype 1) | Content must include ≥1 (spec:275), not yet authored |
| 6 | Escalate every case | Capacity-blocked (can't escalate all: §7); escalated-justified safe, unnecessary → Escalation Heavy; Service/Capacity collapse → not Balanced ✓ | Safety treatment of unnecessary escalation wrong (A04) |
| 7 | Approve every case | Unsafe on high/critical → Safety low → Speed Over Evidence; not Balanced ✓ | Outcome bucket for non-critical wrong approvals (A05) |
| 8 | Never open evidence | Engine fine; **can reach Balanced by pattern-matching** | Learning-thesis hole (A06) |
| 9 | Submit same action twice | Rejected: functional-updater guard + terminal-state rejection (verified pattern, `useShipRun.ts:19-24`) ✓ | None |
| 10 | Corrupted / incompatible persisted state | `safeParse` → defaults, play continues (pattern verified, `shipit/state.ts`) ✓ | "Incompatible version" behavior beyond merge undefined (A13) |
| 11 | Daily crosses local midnight | Interval recomputes `today`/seed (pattern verified, `useShipDaily.ts:22-33`) | **Mid-run reseed/reset** for 4-6 min run (A11) |
| 12 | localStorage denied | `memoryFallback` keeps in-session state (verified) ✓ | None |
| 13 | Clipboard denied | Selectable-text fallback (US-09, ER-603) ✓ | Implementation-verified later |
| 14 | Analytics unavailable/blocked | `try/catch` swallow, already in `analytics.ts:4-8` ✓ | None |
| 15 | Reduced motion | Component-level handling exists (`juice/confetti.ts` + 6 components); confetti off, no shake/travel ✓ | Global CSS kill-switch not present in `globals.css` (component-level instead) |
| 16 | Keyboard-only full run | Required AC (US-10, ER-502), design intends it | Runtime-verify later (no implementation yet) |
| 17 | Screen reader on new/reprioritized case | Polite live region; "arrive without stealing focus" (US-06, ER-502); dedup during animation | Announcement noisiness under multiple arrivals, verify at runtime |

Scenarios 1, 3, 11 surface the P1/P2 time-model and daily gaps. Scenarios 4, 9, 10, 12, 14, 15 are already well-covered by verified existing patterns.

---

## 7. Scoring exploit analysis (hand-calculated)

**Weights:** low 1, med 3, high 8, critical 15. Service weight = `min(weight, 8)`. For a worked example, assume an illustrative 12-case mix of {low×2, med×4, high×4, critical×2}, so total consequence weight = 2 + 12 + 32 + 30 = **76** (case count 2 + 4 + 4 + 2 = 12).

**Per-shift affordability (verified anti-gaming):**
- Shift 1: cap 8, 3 cases. Escalate-all = 3×3 = 9 > 8 → **cannot escalate all**.
- Shift 2: cap 10, 4 cases. Escalate-all = 12 > 10 → max 3 escalations (9) + 1 approve.
- Shift 3: cap **?** (A01). At cap 12: escalate-all = 15 > 12 → blocked. At cap 15: escalate-all fits → anti-gaming weakened. **The missing value decides this.**

**Exploit A, Approve everything.** Safety credit only for the 2 clean approvals (preferred = approve). Numerator ≈ 2 (weight of the two low cases); the high/critical cases (approved unsafely) contribute 0. Safety ≈ 100×2/76 ≈ **3**. Service high (fast, on-time) ≈ 85-95. Capacity = Σ min(1,pref)/Σ1 = 2/12 ≈ **17**. All-three gate fails; ≥1 unsafe critical approval → **Balanced impossible**. Profile = Speed Over Evidence. ✓ **Defeated.**

**Exploit B, Escalate as much as affordable.** Justified escalations (say 4 high/critical where escalate is preferred) → safe + on-time if handoff ≤ due. Unnecessary escalations on clean/correction cases → under current spec lose Safety credit (A04 contradiction), and cost 3 each → Capacity value 0, spent 3. Capacity ≈ small/large → **low** (~20-40). Service low (few cases resolved before capacity/tick exhaustion → breaches + unresolved). Profile = Escalation Heavy. **Balanced impossible.** ✓ **Defeated** (but Safety mechanism is wrong, A04).

**Exploit C, Resolve only cheap preferred cases, ignore the rest (Capacity gaming).** Resolve the 2 clean approvals (value min(1,1)=1 each, spent 1 each). Capacity = 2/2 = **100**. But 10 cases unresolved → Safety numerator = 2/76 ≈ 3; Service ≈ 0 for 10 cases; unresolved 10 > 12/3 = 4 → **Backlog Bound**. **Balanced impossible.** ✓ Capacity=100 is real but harmless given the gate (A16, document/test).

**Exploit D, Acceptable alternative that costs more.** Preferred = approve (1), chosen = acceptable escalate (3). Safety: full credit (acceptable = safe). Service: on-time if ≤ due. Capacity: value min(3,1)=1, spent 3 → efficiency 1/3 for that case. **Correctly** rewards the safe outcome while penalizing the wasted capacity. ✓ **Design is correct here.**

**Exploit E, Single-metric optimization.** Any attempt to max one dimension drives another below 80 (A→Service high/Safety low; C→Capacity 100/Service 0). The **all-three-≥80** Balanced gate is the load-bearing anti-gaming mechanism and it holds. ✓

**Preferred/acceptable difference:** meaningfully different and fairly scored *for capacity and service*; **not fairly scored for safety** when the acceptable/cautious action is an unnecessary escalation (A04).

**Conclusion:** The scoring is **not gameable into Balanced Operator** by any single degenerate policy, the strongest property of the design. The defects are (i) the Safety penalty for cautious escalation (A04, wrong and redundant), (ii) undefined outcome buckets (A05), (iii) the no-evidence content hole (A06), and (iv) the reachability of Balanced hinging on the unresolved time-model (A01/A02).

---

## 8. Traceability matrix

Goal → Story → Acceptance → ER task → Test (matrix §9) → Gate → DoD. Gaps marked ✗.

| Product goal (§1 / research) | Story | Key acceptance | ER task(s) | Test area | Gate | Status |
|---|---|---|---|---|---|---|
| Understand premise fast | US-01 | Premise+time first viewport | ER-402 | Responsive/Components | Visual, ER-805 | OK |
| Learn without risk | US-02 | Practice shows all 3 actions | ER-303/407 (flow); **content ✗** | Components | - | **✗ A09** (no content task; untestable AC) |
| Choose what matters | US-03 | Cards hide preferred action | ER-403 | Queue | ER-805 | OK (but A06 risk) |
| Inspect evidence | US-04 | State w/o color; no hover-only | ER-404 | Components/A11y | ER-803 | OK |
| Bounded action | US-05 | No double-resolve; cost shown | ER-405/ER-105 | Decisions | ER-802 | OK |
| Accessible pressure | US-06 | 1 tick/resolution; warn/breach | ER-106 | Queue | ER-803 | **Partial ✗ A02** (tick model) |
| Consequence of a decision | US-07 | Distinguish 4 outcomes | ER-203/406 | Scoring/Components | - | **Partial ✗ A05** (outcome fn) |
| Understand the run | US-08 | Profile per published precedence | ER-202/501 | Scoring | Publication | **✗ A03** (order undefined) |
| Replay + daily | US-09 | Seeded variant; stable share | ER-107/601/603 | Determinism/Persistence | ER-807 | **✗ A08** (variant vs ticks), A11 |
| Access needs | US-10 | Keyboard-only; 320px; reduced motion | ER-502/503/504 | Accessibility | ER-803 | OK (runtime-verify) |
| Inspect the thinking | US-11 | Publish formulas + precedence | ER-701 | Publication | Publication | **Depends on A03/A04** |
| Privacy analytics | US-12 | Unsupported event fails TS | ER-304 | Analytics | ER-806 | **✗ A07** (no typed contract) |
| Anti-gaming (research risks) | - | Preferred→Balanced; approve/escalate-only can't | ER-205 | Scoring | ER-802 | **Blocked by A01/A02** |

**Broken/missing links:** US-02→content (A09); US-06/ER-205→time model (A01/A02); US-07→outcome function (A05); US-08/US-11→precedence order (A03); US-09→variant representation (A08); US-12→typed analytics (A07). Every other link is intact and testable.

---

## 9. Architecture and sequencing audit

**Repository fit, verified strong:**
- Domain/engine/state layering (`src/lib/exception-room/**`, zero React) matches `shipit/*` and `engine/*` (Significant) exactly. Pure functions with explicit inputs (plan :211) match `shipit/engine.ts` (`startRun`, `choose`).
- Deterministic per-step RNG: `shipit/engine.ts:13` `stepRng(seed, step) = mulberry32(hashString('shipit:${seed}:${step}'))`; `prng.ts` exports `mulberry32`, `hashString`. Exception Room's proposed seeding is a direct fit.
- Safe storage: `shipit/state.ts` `memoryFallback` + `safeParse` is exactly the "playable without storage" behavior the spec requires.
- Daily seed + rollover: `shipit/daily.ts` (`hashString('shipit-daily-${date}')`), `engine/daily.ts` (`dayNumber`), `useShipDaily.ts` (1s interval), all reusable.
- `syncLabProfile()` (`labProfile.ts`) sums each game key's top-level `xp`; adding Exception Room = add its key to `GAME_KEYS` + store top-level `xp`.
- Routes: `/{game}`, `/play`, `/daily`, `/about` present for both existing games, Exception Room's routes match.
- Reuse primitives confirmed to exist: `components/juice/{sound.ts, haptics.ts, PressButton.tsx, confetti.ts}`; reduced motion handled in 6+ components. **No new dependency needed** (package.json: Next 16.2.10, React 19.2.4, framer-motion 12, canvas-confetti, @vercel/analytics, vitest 4).

**Fit gaps (findings):** typed analytics does not exist (A07); storage versioning is new (A13); XP philosophy differs (A14); amber differentiation collides with `--color-gold` (A12).

**Boundaries:** The plan correctly forbids refactoring Significant/Ship It (:150) and keeps types React-free (:80). The only coupling risks are analytics (A07) and `labProfile.ts` (`GAME_KEYS` edit + its tests, ER-302 scopes this correctly).

**Sequencing:** Stage ordering is mostly correct, visual gate (ER-002) precedes UI (Stage 4), engine (Stage 1) precedes scoring (Stage 2) precedes hooks/analytics (Stage 3) precedes presentation (Stage 4). **Issues:** (i) plan :31 over-gates the engine on visual selection (A17); (ii) ER-205 (balance sim) is blocked by the unresolved time model (A01/A02), it is currently unwritable; (iii) cross-repo integration (ER-703/704) correctly depends on live routes + published article and correctly switches branches, no circular dependency found. **No task is mis-staged** except the missing practice-content task (A09).

**Oversized-file risk:** `ExceptionRunScreen.tsx` (ER-407) orchestrates practice/queue/review/reveal/shift-summary/debrief/error, at risk of exceeding the global 300-line warning. Recommend the plan pre-commit to extracting per-phase subcomponents (the file map already lists them, so this is low risk if the screen stays a router).

---

## 10. Accessibility, privacy, analytics, and content-risk findings

**Accessibility, verified defects vs risks requiring implementation validation:**
- *Testable AC present (good):* keyboard-only completion, no keyboard trap, focus move on open/close, 320px + 200% reflow, target size ≥24px (primary ≥44px), contrast AA, color-independence, reduced-motion removes shake/travel/count-up/confetti (spec :334-:345). These are expressed as criteria, not aspirations. ✓
- *Untestable-as-written:* US-02 "demonstrates all three actions" in one practice case (A09). Fix the AC.
- *Runtime-validation risks (no defect yet):* live-region noisiness on multiple arrivals/reprioritizations (sim #17); focus not stolen by arrivals (US-06), verify in ER-803.
- *Pattern availability confirmed:* reduced motion handled component-level (not a global CSS kill-switch in `globals.css`); acceptable, but the plan should not assume a global CSS switch.

**Privacy, verified strong:** No auth/PII/upload/free-text; analytics events carry archetype/action/tier/score-band only (spec :313-:332, plan §11); `analytics.ts` already swallows failures. Persistence explicitly excludes evidence text and full history (spec :306-:309). Share text excludes case details (ER-603). No confidential TRA data anywhere. ✓

**Analytics, one defect:** the typed-contract acceptance requires new infrastructure (A07). Otherwise well-specified.

**Content risk, assessed at design/invariant level (cases not yet authored, so not runtime-verifiable):**
- Good guardrails: ≥2 clean approvals, ≥1 high-confidence error, ≥1 low-confidence clean case, no protected-class stereotypes, text limits enforced by tests (spec :268-:281; plan §12).
- **Gap:** no invariant prevents surface cues from determining the answer (A06).
- **Cannot verify:** realism, bias, evidence sufficiency, ambiguous-answer avoidance, and "every launch case has enough information to be implemented deterministically", **because `cases.ts` does not exist yet.** These must be re-audited after ER-204 authoring, against the content-review checklist (plan §12) and A05/A06 invariants.

---

## 11. Scope recommendations

**Essential for the hiring signal (keep):**
- The queue → evidence → three-action → reveal → multi-dimensional debrief core loop.
- The three-dimension score + raw metrics + descriptive profile (the inspectable-judgment proof).
- The about page publishing sources, formulas, and precedence.
- Deterministic engine + content invariants + the anti-gaming balance sim.
- Keyboard-only + reduced-motion + 320px accessibility.

**Valuable after the core loop is proven (defer but keep on the roadmap):**
- Daily mode (Stage 6), depends on the seeded-variant model (A08); do not build until that is resolved.
- Five moderated usability sessions (ER-804), high-value but gate public claims strictly.
- Portfolio project case study (ER-703), only after live routes + evidence exist.

**Defer or remove for MVP:**
- The `sort control after shift one` (US-03/ER-403) adds surface and a "announce current sort" a11y burden for marginal learning value, defer to post-core.
- Streak/shield semantics for daily (ER-601), only adopt if trivially compatible with existing Lab policy; otherwise omit for MVP.
- Practice as a full unscored case set, a single guided walkthrough is enough (A09); do not over-build.
- Timed mode, domain packs, user-authored cases, multiplayer, leaderboards, correctly already deferred (plan :65). Keep them out.

**Overengineering flag:** the schema-versioning + future-version migration (A13) is heavier than the two shipped games; for a v1 portfolio piece, key-suffix versioning (`:v1`) plus corrupt-payload fallback is sufficient. Do not build migration machinery you will not exercise.

---

## 12. Human decisions required (do not let the implementer invent these)

1. **Shift 3 starting capacity** (A01), a single load-bearing number.
2. **Tick-model semantics** (A02), boundary advance rule + whether resolution at `tick == maxTick` is allowed.
3. **Profile precedence order + escalation baseline** (A03), a user-facing product-judgment call.
4. **Safety treatment of cautious/unnecessary escalation** (A04), align to research (safety-neutral) or justify the deviation.
5. **Outcome classification function** (A05), the total `(action × case) → outcome` mapping.
6. **Content non-determinism rule** (A06), the invariant that forces evidence inspection.
7. **Seeded-variant representation** (A08), relative-due vs restricted variant.
8. **Practice scope** (A09), 1 guided walkthrough vs 3 cases; and whether it demos all three actions.
9. **XP rule** (A14), milestone vs cumulative; reconcile with Ship It.
10. **Exception Room color identity** (A12), resolve amber-vs-`--color-gold` at the visual gate.
11. **Editorial:** approve the "priority" fix in the thesis + ledger (A10), and the source-freshness re-check window before publication.

These are product/editorial/brand calls. This audit does not decide them.

---

## 13. Exact patch recommendations (proposed language: NOT applied)

**P-1 (A01), spec `:178`, replace the Shift 3 row:**
> `| 3 | 5 | 8 through 12 | 12 | Repeated exceptions and operating-model diagnosis |`
> *(Owner to confirm 12; it blocks escalate-all while keeping the preferred path affordable.)*

**P-2 (A02), spec, add after `:193`:**
> "Time model: the global tick advances by exactly one on each resolution. On shift completion the engine sets `tick = openingTick(nextShift)` and resets capacity. A resolution is permitted while `tick <= shift.maxTick`; the post-resolution advance that yields `tick > maxTick` ends the shift. The empty-queue time-advance also applies across a shift boundary to the next scheduled arrival."

**P-3 (A04), spec `:236`, replace:**
> "Safety credits any resolution that avoids the authored downstream harm, preferred, acceptable, or a cautious escalation that hands the case off safely. Only an unsafe approval (a harmful completion) receives zero case safety credit. The cost of an unnecessary escalation is charged to Service and Capacity, never to Safety."

**P-4 (A03), spec `:265`, replace:**
> "Profile precedence (first match wins): 1) Balanced Operator, 2) Speed Over Evidence, 3) Escalation Heavy, 4) Backlog Bound, 5) Safety First, 6) Calibration in Progress. Escalation baseline = the preferred-policy escalation count for the run's seed; 'escalation burden above baseline' means the player exceeded it. This order is published on the about page and asserted in tests."

**P-5 (A07), plan ER-304 `:696`, replace the intent line:**
> "Add a typed Exception Room analytics façade (e.g., `trackException(event: ExceptionAnalyticsEvent)`) over the existing untyped `track`. The façade narrows to the permitted event and property unions so an unsupported event fails TypeScript, without changing the shared `track` signature or the existing Significant/Ship It call sites."

**P-6 (A08), spec `:136`, replace `dueAtTick`:**
> `dueOffsetTicks: number; // due = arrivesAtTick + dueOffsetTicks, so a seed may permute arrival slots without invalidating deadlines`
> and update ER-103 to compute absolute due at run start.

**P-7 (A10), article `:24` and claim-ledger `:13`, replace "authority, time" with:**
> "…trigger, consequence, evidence, priority, authority, resolution, and learning…"

**P-8 (A09), plan, add task under Stage 2:**
> "ER-206: Author the guided practice walkthrough (3 unscored micro-cases, one per action). Acceptance: each action is demonstrated exactly once; skipping requires no confirmation and grants no XP; content passes the same invariants as campaign cases."

---

## 14. Final gate checklist

**Before visual ideation (ER-002), may start now:**
- [ ] Hand the gate the A12 color caveat (amber vs `--color-gold`); decide identity against the token file.
- [ ] Confirm the stable product inputs (7 fields, 3 actions, queue/evidence/reveal/debrief, warning/breach, 3-5 visible, mobile canvas). *(All present.)*

**Before core engine implementation (Stage 1):**
- [ ] A01 Shift 3 capacity set.
- [ ] A02 tick-model semantics defined.
- [ ] A18 capacity-exhaust condition defined.
- [ ] A08 seeded-variant/due representation chosen.
- [ ] `resolveCase`/`advance` tick ownership pinned.
- [ ] Schedule-feasibility invariant added.

**Before scoring implementation (Stage 2):**
- [ ] A03 precedence order + escalation baseline published.
- [ ] A04 Safety treatment corrected.
- [ ] A05 outcome function published.
- [ ] A06 content non-determinism invariant added.
- [ ] A09 practice content task added.
- [ ] A16 capacity-inactivity test added.

**Before UI implementation (Stage 4):**
- [ ] One visual direction owner-approved (ER-002).
- [ ] Tokens measured; Significant/Ship It screenshots unchanged (ER-401).
- [ ] A07 typed analytics façade specified.

**Before accessibility acceptance (ER-803):**
- [ ] US-02 AC reworded to be testable (A09).
- [ ] Keyboard-only, 320px/200%, reduced-motion, live-region behavior verified at runtime.

**Before portfolio integration (ER-703/704):**
- [ ] Live pm-lab routes verified.
- [ ] Article published with truthful date + A10 fix.
- [ ] Cross-links resolve (companion `04-designing-ai-that-knows-when-to-stop` exists ✓).

**Before publication:**
- [ ] A10 contract wording fixed in article + ledger.
- [ ] All four external sources re-checked within 7 days (freshness gate, **cannot be closed in this review**).
- [ ] Owner editorial approval.
- [ ] No public claim exceeds five-test evidence.

---

## 15. Confidence and limitations

**Inspected (high confidence):** both repo branches and working-tree states; both `AGENTS.md`/`CLAUDE.md`; the three primary planning artifacts in full; the full editorial package (article, source-pack, claim-ledger, scorecard, visual-brief); the cover image (viewed and dimension-verified 1536×1024 via `sips`); the validation script; and the cited pm-lab code (`package.json`, `prng.ts`, `analytics.ts`, `labProfile.ts`, `shipit/{types,daily,state,engine}.ts`, `hooks/{useShipRun,useShipDaily}.ts`, `engine/daily.ts`, `globals.css`) plus a route/primitive/analytics-usage inventory.

**Could not verify (affects specific findings, not the verdict):**
- **Case content does not exist** (`cases.ts` unwritten). All content-realism, bias, evidence-sufficiency, ambiguous-answer, and A06 exploitability judgments are at the design/invariant level and **must be re-audited after ER-204**. This is the single biggest residual unknown.
- **No build/test/validator run** (constraints forbid deps/servers). Test *coverage* was assessed from the plan; test *results* are unverified. The editorial validator was read, not executed, I confirmed the package's structural inputs by hand (no em/en dashes; ~1201 raw body words within the 900-1400 gate; cover 1536×1024; status `draft`; `publishedAt: null`; unique tags; cover path matches slug), so it should pass structurally, but I did not run it.
- **External source freshness** (NIST, EU AI Act, Nature, Microsoft) was not re-fetched; per instructions this is a publication gate, not a review task, and remains open.
- **Runtime accessibility/performance/screen-reader/Lighthouse** cannot be evaluated with no implementation; assessed only as acceptance criteria.
- A02's downstream ("Balanced reachable?") and A06's exploitability are **inferred**, contingent on the time model and content that are not yet fixed/authored.

**Effect on verdict:** The verified P1/P2 defects are sufficient on their own to withhold implementation approval; none depends on the unverifiable items. The unverifiable items (chiefly content) mean a **second, content-focused audit is required after ER-204** before Stage 2 closes. The verdict, APPROVE WITH REQUIRED REVISIONS, visual ideation permitted, implementation gated, is robust to what could not be checked.

---

*End of audit. No implementation performed. No research, spec, plan, article, or image modified. This report is the only file created.*
