# Significant learning-content review

This review examines the curriculum and decision model in source. It does not replace the pending interaction and visual audit.

## Curriculum map

The ten campaign levels progress through:

1. Clean win
2. Clean loss
3. Winner's curse
4. Peeking
5. Novelty effect
6. Underpowered test
7. Multiple comparisons
8. Contaminated test
9. Sample ratio mismatch
10. Simpson's paradox

The outcome distribution is one Ship, five Kill, and four Keep calls.

## Strengths

### SIG-C01: The curriculum moves from obvious evidence to subtle validity failures

The first two cases establish the controls, then the campaign introduces stopping errors, time effects, power, multiplicity, contamination, assignment failure, and segment-mix reversal. That progression is credible and teachable.

### SIG-C02: The data is simulated, seeded, and constrained to express each lesson

The game generates binomial arm data, calculates real readouts, and rejects random draws that do not visibly express the intended archetype. The scenario is more defensible than a fixed mock chart with a scripted answer.

### SIG-C03: Explanations identify the evidence pattern, not only the answer

The feedback references confidence intervals, duration, metric count, contamination timing, traffic split, and segment behavior. It gives an experienced reviewer evidence that the game is based on real experimentation failure modes.

### SIG-C04: Product flavors make repeated play less sterile

Ten product and hypothesis combinations vary the surface context while the underlying statistical archetype remains deterministic for a seed.

## Risks

### SIG-C-P1-01: The Winner's curse case grades an unjustified operational decision

Severity: `P1` learning integrity and expert credibility risk.

The level presents day 3 of a planned 14-day test with a tiny sample and an extreme positive result. Its explanation correctly says the observed effect is likely inflated, but the graded answer is Kill.

The player cannot observe the simulation's hidden true lift of zero. From the available evidence, inflation is a reason not to Ship, but it is not evidence that the product effect is negative or worthless. Keep running, replicate, or apply the planned stopping rule is the defensible operational call.

Impact: an experienced PM, analyst, or experimentation engineer may distrust the entire curriculum when the lesson confuses hidden ground truth with information available at decision time.

### SIG-C-P1-02: Calibration describes Kill as an evidence-insufficiency decision

Severity: `P1` decision-language and onboarding risk.

The calibration button pairs Kill with the explanation `Not enough evidence`, while Keep Running is described as `More data could change it`.

Not enough evidence is normally a reason to continue, increase power, or rerun a valid test. Kill should mean the evidence supports stopping the feature or abandoning the tested version. Teaching the wrong distinction in the first interaction makes later ambiguous cases harder to interpret.

### SIG-C-P2-01: The answer distribution rewards reflexive rejection

Severity: `P2` curriculum balance risk.

Only one of ten campaign levels grades Ship as correct, while five grade Kill and four grade Keep. A player who never ships is correct 90 percent of the time, and a player who always kills is correct half the time.

This weakens the case-study statement that the clean controls keep the game focused on judgment instead of reflexive cynicism. The final implementation plan should rebalance observable cases or make the campaign's deliberately skeptical scope explicit.

### SIG-C-P2-02: Kill and Keep carry inconsistent operational meanings

Severity: `P2` decision-language risk.

Keep sometimes means finish the planned test, sometimes means fix instrumentation, and sometimes means rerun a contaminated test. Kill sometimes means reject the current readout, and sometimes means stop the feature itself.

Impact: the three buttons look mutually exclusive, but their verbs mix experiment-state decisions with product decisions. This makes some disputed answers a language problem rather than a judgment problem.

### SIG-C-P2-03: Calibration announces three steps but exposes only one numbered step

Severity: `P2` onboarding coherence risk.

The coaching panel labels the experience `1 of 3` and draws three progress points. The decision and reveal do not advance that progress model or identify steps 2 and 3. A visitor can reasonably expect a three-screen tutorial that never appears.

### SIG-C-P2-04: The model omits product context that would change a real shipping decision

Severity: `P2` portfolio interpretation risk.

The campaign isolates one conversion metric. It does not model guardrail metrics, cost to ship, reversibility, minimum worthwhile effect, novelty risk by product type, qualitative evidence, or strategic urgency.

The narrow scope is appropriate for a short statistics game, but the product should state that it trains experiment-readout validity, not the full product shipping decision.

### SIG-C-P3-01: Feedback reveals a ground truth that real experiments never expose

Severity: `P3` realism risk.

The simulated true lift is useful for teaching and fully legitimate in a game. It should remain clearly framed as simulation truth so visitors do not infer that production experimentation provides the same certainty.
