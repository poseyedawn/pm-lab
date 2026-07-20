# Exception Room evidence-policy simulation

Captured: 2026-07-19.

Audited commit: `d608c67`.

## Question

Can the debrief award `Balanced Operator` when the player never opens evidence?

## Method

The production `scorePolicy()` diagnostic was run across 1,000 seeds for every authored policy and then across 10,000 seeds for the random policy.

The random policy:

- Never calls `viewEvidence()`.
- Selects an available case at random.
- Selects Approve, Correct, or Escalate at random.
- Uses the first available action detail when one is required.

This is a reachability diagnostic, not a model of player behavior.

## Results

Across the first 1,000 random-policy seeds:

- Every run had a 0 percent evidence inspection rate.
- Two runs received `Balanced Operator`.
- Average Safety was 57.0, Service 40.4, and Capacity 43.4.

Across 10,000 seeds, nine evidence-free random runs received `Balanced Operator`.

### Strongest reproduction: seed 6,240

The evidence-free random policy produced:

| Debrief measure | Result |
| --- | ---: |
| Safety | 100 |
| Service | 100 |
| Capacity | 96 |
| Evidence inspection rate | 0 |
| Resolved safely | 12 |
| Service breaches | 0 |
| Unresolved | 0 |
| Profile | Balanced Operator |

### Additional reproductions

- Seed 18: Safety 84, Service 81, Capacity 81, 0 percent evidence, two unsafe approvals, Balanced Operator.
- Seed 359: Safety 100, Service 87, Capacity 82, 0 percent evidence, Balanced Operator.
- Seed 4,249: Safety 100, Service 95, Capacity 86, 0 percent evidence, Balanced Operator.

The cue-only policy also opened no evidence, resolved every case, and produced Safety 92, Service 76, and Capacity 67 for all tested schedules. It did not receive Balanced Operator because one score stayed below the profile threshold.

## Cause confirmed in source

`scoreRun()` calculates `evidenceInspectionRate` for display, but `profileForFacts()` does not receive or evaluate that value. Balanced Operator requires Safety, Service, and Capacity of at least 80 and no unsafe high or critical approval. Evidence review is not part of the profile definition.

## Audit conclusion

The assessment model can award its strongest balanced profile without the central behavior named in the game premise: reviewing evidence before making an AI-operations decision.

The remaining browser task is to reproduce a controlled evidence-free run and capture whether the debrief visually presents the 0 percent evidence rate strongly enough to counteract the positive profile label.
