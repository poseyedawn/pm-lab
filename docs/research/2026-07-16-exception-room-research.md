# Exception Room Research Brief

**Date:** 2026-07-16  
**Status:** Research complete for planning  
**Decision owner:** Alvin  
**Intended implementation home:** `pm-lab`  
**Public positioning:** Interactive AI product operations simulation

## Executive conclusion

Exception Room should be a short, turn-based serious game about operating a human review queue for a consequential AI workflow. The player manages limited review capacity, chooses which cases to inspect, studies source evidence, and resolves each case through approval, correction, or escalation. Cases age while the player acts. The final debrief shows how their choices affected safe completion, service levels, reviewer effort, escalation burden, and unresolved backlog.

The game should not claim that a human reviewer automatically makes AI safe. Research and current governance frameworks point in the opposite direction. Oversight depends on information, authority, timing, training, and the interaction between people and the system. The product should make those dependencies playable.

The recommended MVP uses authored synthetic cases, a deterministic engine, finite capacity points, and no backend or generative model. It should take four to six minutes, work without a real-time countdown, and explain its scoring. It is a portfolio demonstration, not a hiring assessment, compliance tool, or professional training certification.

## Research questions

1. What makes human oversight meaningful rather than ceremonial?
2. Which queue fields and actions are required to complete work safely?
3. How should capacity pressure be represented without creating an inaccessible timer?
4. Which mechanics teach prioritization, evidence review, and escalation judgment?
5. How can the simulation score tradeoffs without pretending every case has one obvious answer?
6. Which signals make the application valuable to Senior, Lead, and Principal AI product roles?
7. What can be shipped as a credible lightweight MVP inside the existing pm-lab architecture?

## Evidence synthesis

### Meaningful oversight requires capability and authority

The [NIST AI Risk Management Framework Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) calls for differentiated human and AI roles, ongoing monitoring, input from users, appeal, override, recovery, incident response, and change management. The framework supports an operating model with explicit ownership and intervention paths. It does not validate a specific queue interface.

[Article 14 of Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=en) says that assigned overseers of covered high-risk systems should be able to understand capabilities and limitations, remain aware of automation bias, interpret outputs, decide not to use or override them, and intervene or stop the system. Applicability is fact specific, but the text is a useful product-design signal: the reviewer needs understandable evidence and real authority.

The [Federal Reserve SR 11-7 guidance on model risk management](https://www.federalreserve.gov/bankinforeg/srletters/sr1107a1.pdf) describes effective challenge as critical analysis by objective and informed parties with the competence and influence to cause change. This is a financial supervisory document, not an AI UX standard. It reinforces a key design boundary: a reviewer without knowledge or influence is not an effective control.

### Adding a human does not guarantee better performance

A 2024 [systematic review and meta-analysis in Nature Human Behaviour](https://www.nature.com/articles/s41562-024-02024-1) found heterogeneous results across human and AI combinations. Combined systems did not reliably outperform the better actor working alone. Publication bias and variation among tasks and studies limit broad conclusions, but the evidence rejects a simple assumption that a person in the loop guarantees synergy.

A systematic review of clinical decision support studies found [no robust evidence that machine learning support consistently improved clinician diagnostic performance](https://pmc.ncbi.nlm.nih.gov/articles/PMC7953308/). The authors emphasized evaluation of supported human decisions rather than stand-alone model outputs. The clinical context does not transfer directly to a portfolio game, but the measurement principle does.

Research on [automation bias](https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751/) identifies task complexity, workload, time pressure, trust calibration, and system design as factors that can increase overreliance. This supports using capacity constraints carefully and avoiding a mandatory real-time countdown in the default mode.

### Human-AI interfaces need correction, control, and understandable feedback

The [Microsoft Guidelines for Human-AI Interaction](https://doi.org/10.1145/3290605.3300233) synthesize and validate 18 guidelines across initial use, normal interaction, failure, and change over time. Relevant principles include communicating what the system can do, supporting efficient correction, explaining why the system acted, and making the effect of feedback understandable.

The [Google People + AI Guidebook](https://pair.withgoogle.com/guidebook-v2/chapter/feedback-controls/) recommends balancing automation with user control, distinguishing explicit from implicit feedback, and telling users how and when their feedback affects the system. The guide draws partly on proprietary studies that cannot be independently inspected, so it should inform design rather than serve as proof.

Google Cloud's 2026 [human-in-the-loop agent design pattern](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system?hl=en) models a workflow that pauses at predefined checkpoints so a person can approve, correct, or provide input. The pattern gives the game its core action vocabulary. It is vendor architecture guidance, not user-outcome evidence.

### A queue is an operating system for scarce attention

Basic queueing theory connects work in progress, arrival rate, and waiting time. [MIT OpenCourseWare materials on Little's Law](https://live.ocw.mit.edu/courses/2-854-introduction-to-manufacturing-systems-fall-2016/5d3e9532c2ff6e156d48e41f9bd9576f_MIT2_854F16_Queueing.pdf) provide the foundation for representing arrival, backlog, and age as linked operational measures. Exception Room does not need to teach the equation, but its engine should respect the relationship: if cases arrive faster than the player can resolve them, backlog and waiting time must rise.

The [GOV.UK guidance for service support](https://www.gov.uk/service-manual/helping-people-to-use-your-service/set-up-and-manage-user-support) recommends tracking enquiry status, response time, handling time, volume, team performance, and the causes behind demand. It also frames incoming enquiries as signals that a service may need improvement. This supports treating repeated exception classes as product feedback rather than permanent manual work.

### A serious game needs authentic decisions and a debrief

A 2024 [systematic review of serious games used in high-stakes assessment](https://link.springer.com/article/10.1007/s11423-024-10362-0) found that authentic tasks and in-game behavior can represent professional competencies, while also identifying design and validity limitations. Exception Room should borrow the authenticity principle but explicitly avoid presenting itself as a validated assessment.

Simulation literature emphasizes that the debrief is where deeper lessons become explicit. The game should therefore preserve the player's decisions, reveal case ground truth and tradeoffs, and let the player inspect why the result occurred. A score without a decision trace would undermine the product's own thesis.

The case-inspection rhythm has a useful precedent in [Papers, Please](https://papersplea.se/presskit/): repeated document review, changing rules, and consequences make bureaucracy playable. Exception Room should borrow the clarity of inspecting evidence under constraint. It must avoid copying the narrative, interface, art, or punitive real-time structure.

### Accessibility changes the pressure mechanic

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires keyboard access and gives users control over timing in applicable experiences. The default mode should therefore use turn-based capacity points and case aging rather than a countdown. If a timed challenge appears later, it must be optional, adjustable, pausable, and unnecessary for accessing core content or progression.

Motion should communicate state rather than decorate it. [Apple's motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion) recommends purposeful, brief, optional motion and alternatives for people who reduce motion. The existing pm-lab reduced-motion and sound controls should be inherited.

## Hiring-market signal

Current AI product openings in the target lane repeatedly ask for workflow discovery, human review, auditability, exception handling, rapid prototyping, measurable outcomes, and platform thinking:

- [MeridianLink Senior Product Manager, AI Products](https://jobs.ashbyhq.com/meridianlink/a85d295b-93a2-4bb1-924f-00925527e5f0) includes AI workflow automation, operations and compliance discovery, human review, launch readiness, automation rates, exception volume, and drift.
- [UiPath Principal Product Manager](https://jobs.ashbyhq.com/uipath/d3ef8c17-984f-4138-a853-cca29eaa7133) centers human judgment, review, approval, exception routing, and technical product design.
- [Legion Health Technical Product Manager, Consumer and AI](https://jobs.ashbyhq.com/legionhealth/0ffded39-1242-4a35-9bc3-0e5b0ce22276/) asks for clinical, operational, and regulatory workflow translation, review queues, evaluation loops, metrics, and rapid prototypes.
- [n8n AI Product Manager](https://jobs.ashbyhq.com/n8n/42e72645-d99a-4545-97b7-53ba3a699893) emphasizes evaluations, observability, traces, guardrails, reliability, latency, cost, debugging, and human oversight.

The product should demonstrate these capabilities through its mechanism and about page. It should not reproduce job-description phrases as marketing copy.

## Product opportunity

Most portfolio AI demos show generation. Exception Room can show operational judgment after generation, where uncertainty becomes queue volume, reviewer work, escalation, and downstream consequence. This is more differentiated than another chatbot or document summarizer.

The game can create a coherent portfolio pair:

- The article explains the operating thesis and seven-part Exception Queue Contract.
- The game lets a visitor experience the cost of ignoring those fields.
- The about page reveals the engine, scoring choices, accessibility decisions, and ethical boundaries.
- A later project case study can document design decisions and observed play-test behavior without claiming business impact prematurely.

## Recommended product model

### Primary player

A recruiter, hiring manager, AI PM, product leader, or operator with four to six minutes and no prior instruction in queueing theory.

### Player job

Understand a queue quickly, identify which cases deserve scarce attention, inspect enough evidence to challenge the AI, and choose a defensible resolution.

### Learning outcomes

By the end of one run, the player should be able to explain that:

1. Confidence is one routing input, not a complete priority system.
2. Consequence, reversibility, evidence, age, and authority change what should be reviewed first.
3. Approving everything creates unsafe completion.
4. Escalating everything moves work and creates backlog.
5. Corrections need a destination, and not every correction should train a model.
6. Queue metrics can reveal product, data, or operating-model failures.

### Core loop

1. Scan a queue containing three to five visible cases.
2. Choose which case to open.
3. Review the AI recommendation, route reason, consequence, due state, and source evidence.
4. Approve, correct, or escalate.
5. Spend capacity based on the action.
6. Advance the shift, age unresolved cases, and admit any scheduled arrivals.
7. Receive immediate case feedback only after acting.
8. Finish with a decision trace and multi-dimensional debrief.

### Run structure

- One optional guided practice with three short, unscored micro-cases, one for each action.
- Three short shifts.
- Twelve authored cases per full campaign run.
- Three to five active cases visible at once.
- Finite review capacity represented as tokens or minutes.
- Four to six minute target completion.
- Deterministic seed and authored ground truth.

## Queue contract in the game

Every case should encode the seven article fields:

| Contract field | Game representation |
| --- | --- |
| Trigger | Route-reason chip and short plain-language explanation |
| Consequence | Risk tier, reversibility, and downstream action |
| Evidence | Two to four inspectable source items with conflicts or gaps |
| Priority | Computed from consequence, age, due state, and uncertainty |
| Authority | Available actions and any escalation owner |
| Resolution | Player action, correction, rationale, timestamp, downstream state |
| Learning | Post-case explanation of whether the signal changes a rule, test set, workflow, or nothing |

## Case taxonomy

The MVP should include at least twelve cases across these archetypes:

1. High-confidence output contradicted by a newer authoritative source.
2. Low-confidence but correct output with low consequence and easy reversibility.
3. Missing required source evidence.
4. Two authoritative sources in conflict.
5. Input outside the model's known format or distribution.
6. Duplicate or near-duplicate record.
7. Policy boundary requiring a different owner.
8. Correctable extraction or classification error.
9. Potential fairness or sensitive-attribute concern, expressed without demographic stereotypes.
10. Clean, supported, low-risk approval.
11. Urgent low-risk case competing with a slower high-consequence case.
12. Repeated correction revealing a product or data defect.

At least two cases must be clean approvals. At least two must have more than one acceptable action. This prevents the game from teaching reflexive distrust or arbitrary answer memorization.

## Action model

### Approve

Use when evidence supports the recommendation and the player has authority. Lowest capacity cost. Unsafe when support is missing or consequential evidence conflicts.

### Correct

Use when the reviewer can identify and repair a bounded error. Medium capacity cost. The correction must record which evidence changed the result.

### Escalate

Use when evidence is insufficient, authority is missing, or consequence requires specialist judgment. Highest immediate capacity cost and adds downstream workload. Correct escalation is valuable. Unnecessary escalation avoids direct harm, so it should remain Safety-neutral while reducing Service and Capacity. It should not be described as a moral failure.

Deferral is represented by choosing another case. It is not a fourth action in the MVP.

## Pressure model

The default game is turn based:

- Each action consumes capacity.
- Every decision advances one operational tick.
- Pending cases age and can cross warning or breach thresholds.
- New cases arrive at authored ticks.
- The player can inspect evidence without spending capacity, but opening and closing every item still advances no state and should not be rewarded.
- A shift ends when all required cases are resolved, no harm-avoiding authored resolution remains affordable, or a post-resolution advance crosses the shift's tick limit.

This preserves queue pressure without relying on reaction speed. An optional timed challenge is a post-MVP experiment only.

## Scoring model

Avoid a single opaque score. Show three dimensions and raw outcomes:

### Safety

Weighted share of decisions that avoid the authored downstream harm. Weight by consequence tier. A critical unsafe approval matters more than an unnecessary review of a reversible case.

### Service

Weighted share of cases completed before their due tick, adjusted for unresolved backlog. Correct escalation counts as a completed review decision only when the case reaches its defined handoff state.

### Capacity

Safe resolutions achieved relative to available review capacity, with a penalty for unnecessary escalations and repeated rework. This is not a labor-utilization target.

### Raw metrics

- safe completions;
- unsafe approvals;
- correct corrections;
- justified escalations;
- unnecessary escalations;
- service-level breaches;
- unresolved cases;
- capacity spent;
- evidence inspection rate;
- repeated exception classes.

The result card may assign a descriptive profile such as Balanced Operator, Safety First, Speed Over Evidence, Escalation Heavy, or Backlog Bound. The profile logic and formulas must be published on the about page and covered by tests.

## Decision validity

Each case needs:

- one preferred action;
- zero or more acceptable actions;
- a written rationale;
- consequence if mishandled;
- evidence required for the preferred action;
- action costs;
- learning destination;
- content-review notes.

The engine must distinguish an acceptable alternative from the preferred action. The debrief should say why the alternative was defensible and what tradeoff it created. No case should be scored solely by confidence.

## Interaction architecture

### Start screen

- One-sentence premise.
- Four to six minute expectation.
- Start campaign and daily mode cards.
- Plain statement that all cases are synthetic.
- Sound toggle and about link.

### Queue screen

- Shift and capacity header.
- Compact queue list showing consequence, age, due state, and route reason.
- No automatic opening of the highest-priority case.
- Clear selected and keyboard-focus states.

### Case review screen

- AI recommendation.
- Why the case was routed.
- Consequence and reversibility.
- Evidence drawer with source type, date, and conflict state.
- Approve, Correct, Escalate actions.
- Back-to-queue control that preserves state.

### Resolution reveal

- Preferred and acceptable action explanation.
- Consequence of the player's choice.
- Which evidence mattered.
- Where the correction or escalation goes next.
- Short return-to-queue action.

### Debrief

- Three dimensions and raw metrics.
- Timeline of decisions.
- Two strongest decisions and one improvement opportunity.
- Repeated exception pattern, if present.
- Share card, replay, daily, and about links.

## Design direction

Exception Room should inherit the pm-lab shell: a mobile-sized canvas on desktop, friendly bold typography, tactile buttons, high-contrast states, restrained motion, sound control, seeded runs, local progress, and an explanatory about page.

It should have its own dominant color. Recommended direction: deep teal as the dominant identity with restrained amber as an operational accent. Amber already appears in the shared Lab palette, so the visual gate must compare proposed tokens against the actual Ship It and Significant tokens before selecting exact values. Final screen design requires the separate three-option visual ideation gate before UI implementation.

## Architecture recommendation

- Next.js App Router and TypeScript within the current pm-lab project.
- Pure deterministic engine under `src/lib/exception-room/`.
- React hooks own run and persistence state.
- Components render the queue, case review, evidence, actions, reveals, and debrief.
- Existing `mulberry32`, lab profile, analytics wrapper, juice primitives, safe storage, sound, haptics, and reduced-motion patterns should be reused.
- Auth, database, AI API, upload, and free-text user input remain out of scope.
- Case data is typed source code in v1 and validated through content-invariant tests.

## Privacy, security, and ethics

- All cases, organizations, records, and consequences are synthetic.
- No resume, tax, health, financial, employment, or customer data is accepted.
- No login, account, cookies for identity, or cross-site tracking.
- Analytics events contain mode, case archetype, action, aggregate score band, and completion state only. They do not contain evidence text or a stable visitor identifier.
- No leaderboard or claim that a score predicts job performance.
- No dark patterns, paid mechanics, fake scarcity, guilt copy, or punitive streak loss.
- The about page states that the game is educational product exploration, not legal, medical, financial, or compliance advice.

## Accessibility requirements

- Full keyboard operation with visible focus.
- Semantic buttons and headings.
- Queue changes and result feedback announced through restrained live regions.
- No information conveyed through color alone.
- Minimum target size consistent with WCAG 2.2 AA.
- Text supports 200 percent zoom and reflow without horizontal scrolling.
- No required drag, swipe, precise pointer movement, or timed response.
- Reduced motion removes card travel, shake, count-up, and confetti.
- Sound is optional, persisted, and never the sole feedback channel.
- Haptics are optional enhancement only.

## Success measures

### Portfolio success

- At least 60 percent of starters complete a run.
- Median completed run falls between four and six minutes.
- At least 20 percent of completers open the about page or replay.
- Recruiter and PM usability interviews can accurately explain the core lesson after one run.

These are initial product hypotheses, not public claims.

### Learning success

In moderated testing, at least four of five participants should be able to name two priority inputs beyond confidence and explain one cost of unnecessary escalation. The threshold is a launch hypothesis and should be revised after the first five tests.

### Technical success

- Deterministic replay from seed and action history.
- Zero network requirement during a run after page load.
- Lighthouse accessibility and performance at least 95 on the target route.
- No uncaught error when storage, clipboard, sound, haptics, or analytics are unavailable.

## Risks and mitigations

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| The game becomes a quiz with one obvious right answer | Weak product signal and low replay value | Multiple active cases, competing deadlines, acceptable alternatives, and capacity tradeoffs |
| The scoring rewards escalating everything | False lesson and queue inflation | Escalation cost, service impact, justified versus unnecessary escalation metrics |
| Confidence becomes the answer key | Teaches the behavior the article rejects | Include high-confidence errors, low-confidence clean cases, and consequence-first priority |
| Cases resemble real customers or regulated advice | Privacy, trust, and legal risk | Fully synthetic neutral domain, content audit, no real forms, no sensitive details |
| Time pressure excludes players | Accessibility failure and distorted learning | Turn-based capacity default; timed mode deferred and optional |
| The interface exposes too much at once | Cognitive overload on mobile | Progressive disclosure, compact queue, one case review surface, short evidence items |
| Replay becomes memorization | Poor retention and weak demonstration | Seeded variants, case parameterization, per-shift arrival-slot changes with deadlines derived from relative due offsets, daily mode after MVP |
| The about page overclaims learning validity | Credibility risk | Label measures as hypotheses and game as portfolio exploration, not validated assessment |
| Scope duplicates Ship It | Portfolio redundancy | Focus on evidence inspection, queue operations, and human oversight rather than stakeholder meters |

## Decisions made

1. Build in pm-lab and link from the portfolio later.
2. Use one neutral synthetic operational domain for MVP.
3. Use a turn-based capacity system as the default pressure mechanic.
4. Present a queue the player can reorder through action, not a forced sequence of cards.
5. Use approve, correct, and escalate as the core action vocabulary.
6. Use three score dimensions plus raw metrics rather than one opaque number.
7. Use deterministic authored content with no AI API.
8. Defer timed mode, additional domain packs, user-authored cases, and leaderboards.

## Open decisions for the visual-design gate

- Exact fictional organization and domain language.
- The three visual directions for queue and evidence presentation.
- Final game-specific color tokens and icon set.
- Whether the campaign uses three named shifts or one continuous work session.
- Exact share-card composition.

These decisions do not block engine and content planning. They must be resolved before UI implementation.

## Source refresh policy

Re-check job postings, living vendor documentation, NIST pages, WCAG, and the EU AI Act before publishing a case study. The research supports design choices as of 2026-07-16 and should not be presented as permanent legal or market guidance.
