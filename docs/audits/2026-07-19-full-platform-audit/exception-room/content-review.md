# Exception Room decision-model review

This review examines the campaign, practice content, engine, and scoring model in source. It does not replace the pending interaction and visual audit.

## Content map

The game contains three practice cases and twelve campaign cases across three shifts. The cases cover:

- conflicting current and submitted records
- unfamiliar but supported inputs
- missing approval authority
- random clean samples
- bounded unit and field errors
- repeated workflow defects
- policy boundaries and confirmed authority
- equally authoritative conflicting sources
- missing citations with a correctable record

## Strengths

### EXC-C01: The authored practice content covers the three action families clearly

Approve, Correct, and Escalate each have a dedicated practice case in source. The examples distinguish evidence sufficiency from decision authority, which is an important human-in-the-loop concept.

### EXC-C02: The campaign separates case correction from system learning

Resolutions can create signals for a rule, evaluation set, workflow, or policy. The repeated date-drift cases deliberately evolve from a correctable individual case to a workflow-level escalation. This is strong product-management content.

### EXC-C03: Safety, service, and capacity are modeled independently

The score weights consequences, timeliness, unnecessary escalation, unresolved work, and capacity use. This communicates that safe review is not the same as escalating everything and that throughput is not the same as approving everything.

### EXC-C04: The cases model authority as distinct from evidence

Some cases have clear evidence but still require a policy owner. Others arrive under a policy-boundary route but can be approved because the current policy explicitly grants reviewer authority. This is credible operational design.

## Risks

### EXC-C-P1-01: Evidence review is optional, free, and only loosely scored

Severity: `P1` core-mechanic and learning-integrity risk.

The landing says to review evidence before capacity runs out, and every case declares required evidence. In the engine, however:

- opening evidence does not advance time or spend capacity
- a decision can be submitted without opening any evidence
- the declared required evidence list is not checked during resolution
- the evidence score counts a case as inspected after any one evidence item, even if it was not required

Impact: optimal play is either to open everything because it is free, or to ignore evidence and answer from the case summary. Neither path creates the intended tension between careful review and service capacity.

### EXC-C-P1-02: The visible decision can be correct without the player demonstrating the intended reasoning

Severity: `P1` assessment validity risk.

Outcomes depend only on the chosen action and optional detail ID. They do not depend on whether the player inspected the evidence that justifies that action.

Impact: the game measures answer selection, not evidence-based judgment. For a portfolio piece about accountable AI operations, that distinction is material.

### EXC-C-P1-03: The authored practice sequence is not reachable in the product

Severity: `P1` first-time comprehension risk.

The three practice cases are exported from the content layer but are not imported by any page, component, hook, or production engine path. Start campaign opens the full queue immediately.

Impact: the best available explanation of Approve, Correct, Escalate, evidence, authority, and capacity is dead content. A first-time visitor must infer the controls while already being scored.

### EXC-C-P1-04: Case deadlines are not exposed accurately enough to support queue prioritization

Severity: `P1` decision-quality risk.

The queue cards do not show due ticks. The selected case does not show its due tick. The only urgency text is a header summary that says one case is due next tick for every positive value, even when the nearest case is due several ticks later.

Impact: Service is a scored dimension, but the player is not given reliable information to optimize it.

### EXC-C-P1-05: The strongest operator profile does not require evidence inspection

Severity: `P1` assessment validity and AI-oversight credibility risk.

The debrief calculates and displays evidence inspection rate, but the profile model does not include that value. Balanced Operator requires Safety, Service, and Capacity thresholds only, plus the absence of one unsafe-approval condition.

The production-engine diagnostic in `policy-simulation.md` found nine evidence-free Balanced Operator outcomes across 10,000 random-policy seeds. Seed 6,240 received Safety 100, Service 100, Capacity 96, and Balanced Operator with a 0 percent evidence inspection rate.

Impact: the game's strongest identity label can reward outcomes without requiring the player to demonstrate the central behavior promised by the premise.

### EXC-C-P2-01: Action cost is constant across all case complexity

Severity: `P2` model depth risk.

Approve always costs 1, Correct always costs 2, and Escalate always costs 3. Case consequence, evidence volume, reversibility, and escalation destination do not change that work estimate.

Impact: the model risks teaching that the action label determines operational cost, when real queues vary substantially within the same action family.

### EXC-C-P2-02: Evidence inspection rate overstates review quality

Severity: `P2` scoring integrity risk.

The score reports the percentage of resolved cases with at least one opened evidence item. It does not distinguish required evidence, conflicting evidence, or complete review.

Impact: a high inspection rate can be earned by opening the first item on every case, even if the decisive source was never reviewed.

### EXC-C-P2-03: The strongest portfolio story has no in-product case study

Severity: `P2` portfolio translation risk.

The engine contains nuanced concepts that are not obvious from the landing page alone: bounded authority, evidence sufficiency, reversibility, repeated defects, learning destinations, and consequence-weighted scoring. Without an About route, a hiring reviewer must infer the system from play.
