# Exception Room Engine and Balance Report

**Date:** 2026-07-16

**Branch:** `codex/exception-room-engine`

**Scope:** Stage 1 deterministic engine and Stage 2 scoring, content, practice, debrief, and policy simulation

## Implemented contract

- Twelve synthetic campaign cases across three shifts.
- Three guided practice micro-cases, one per case action.
- Seeded per-shift arrival slots with deadlines derived from relative due offsets.
- Typed selection, evidence, resolution, end-shift, and replay transitions.
- Explicit scheduled, queued, resolved, escalated, and expired case states.
- One global tick, resolution at the maximum tick, deterministic cross-shift advance, warning, breach, carryover, and capacity-constrained completion.
- Safety, Service, Capacity, raw metrics, and first-match descriptive profiles.
- Deterministic strengths, improvement, and repeated-exception debrief copy.

## Content invariants

The launch case set passes:

- unique case and evidence identifiers;
- text and evidence-count limits;
- complete action and detail outcome mappings;
- an authored escalation reason and named destination role for every case;
- required evidence references;
- exact 3, 4, and 5 case shift distribution;
- preferred-path affordability and escalate-all rejection per shift;
- at least two approvals, three corrections, three escalations, and two acceptable alternatives;
- high-confidence unsafe approval and low-confidence clean approval coverage;
- repeated exception coverage;
- paired queue-visible cue signatures with different preferred actions.

## Policy simulation

The automated balance suite evaluates 1,000 deterministic seeds.

| Policy | Expected gate | Verified result |
| --- | --- | --- |
| Preferred with required evidence | Balanced, all work resolved | Safety 100, Service 100, Capacity 100, no unresolved cases for every seed |
| Approve only | Never Balanced | Pass |
| Escalate only | Never Balanced | Pass |
| Correction heavy | Never Balanced | Pass |
| Queue-visible cue only | Never Balanced and no evidence use | Pass |
| Recommendation only | Never Balanced and no evidence use | Pass |
| Resolve only cheap preferred approvals | Capacity illusion exposed as backlog | Capacity 100, Backlog Bound, more than four unresolved cases for every seed |
| Random actions | Rare accidental Balanced result only | Balanced rate remains below 2 percent |

## Adversarial checks

- A cautious unnecessary escalation keeps Safety unchanged while reducing Service and Capacity.
- One critical unsafe approval blocks Balanced even when the rounded Safety score remains at least 80.
- A cheap unsafe action cannot keep a shift open when no harm-avoiding action is affordable.
- Ending a shift early records all remaining work as carried or expired.
- Warning and breach events emit at most once per case.
- Replaying the same seed and full event history reproduces byte-equivalent serializable state.
- Tampered event history fails with a typed `invalid-history` result.
- Every resolution records its evidence trace and authored learning destination.

## Remaining gates

- Independent content-focused Fable audit of the authored cases.
- Owner selection of one of three visual directions before UI work.
- Stage 3 persistence, shared profile, hooks, and typed analytics facade.
- Runtime accessibility, browser, usability, preview, deployment, and publication gates.
