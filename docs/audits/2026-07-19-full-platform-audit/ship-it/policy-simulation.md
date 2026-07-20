# Ship It integrity-policy simulation

Captured: 2026-07-19.

Audited commit: `d608c67`.

## Question

Can a run receive a leadership rating after choosing options that the authored copy itself identifies as deceptive, non-consensual, legally risky, inaccessible, insecure, or unsupported by evidence?

## Method

A deterministic diagnostic policy was run across seeds 1 through 10,000 using the production `startRun()`, `choose()`, deck, products, and `generateReview()` functions.

When one of these cards appeared, the policy selected the named integrity-risk option:

| Card | Selected option | Why classified for this diagnostic |
| --- | --- | --- |
| `dark-pattern-growth` | Ship the pre-check | The card explicitly calls it a dark pattern and removes meaningful opt-in. |
| `gdpr-list` | One more campaign first | The list has no recorded consent and Legal recommends purging it before an audit. |
| `demo-vaporware` | Let the demo ride | Prospects are shown a capability that does not exist. |
| `a11y-audit` | Blockers only | The product knowingly leaves 52 identified accessibility issues unresolved. |
| `data-pipeline` | Ship features, guess metrics | The team knowingly continues with unreliable product evidence. |
| `bounty-report` | Patch quietly next sprint | A known authentication bypass is deferred. |
| `founder-livestream` | Set up the stream | The founder plans to demonstrate features that do not exist. |
| `enterprise-checkbox` | Promise SSO | The team makes a contractual promise before engineering knows about it. |
| `seo-content-farm` | Sign the agency | The product funds deliberately low-quality content for projected traffic. |

All other decisions used a deterministic pseudo-random left or right choice. This is not a model of player behavior and does not prove the frequency of a real user's outcome. It is a reachability diagnostic for the scoring model.

## Results

9,699 of 10,000 simulated runs encountered and selected at least one classified option.

| Final rating | Runs |
| --- | ---: |
| PIP | 1,924 |
| Meets Expectations | 4,594 |
| Exceeds Expectations | 1,255 |
| Promoted | 1,921 |
| CEO-in-waiting | 5 |

1,926 of the 9,699 affected runs, or about 19.9 percent, received Promoted or CEO-in-waiting. This is expected from the source rating function because it considers survival, meter balance, and resolved arcs, not the meaning of individual decisions.

## Concrete reproduction seeds

### Seed 4,275

The policy selected:

- Set up a founder livestream that can show nonexistent features.
- Ship the pre-checked contact-invite dark pattern.
- Run one more campaign using a list with no recorded consent.
- Fix only 9 blockers while leaving 52 accessibility findings unresolved.

The run finished after week 18 with Users 62, Business 52, Team 42, and Tech 54. It resolved three arcs and received `CEO-in-waiting`.

### Seed 2,676

The policy let the vaporware demo ride and approved the founder livestream. It finished with balanced meters, resolved all four arcs, and received `CEO-in-waiting`.

### Seed 31

The policy ran one more non-consensual campaign and approved the founder livestream. It received `Promoted`.

## Audit conclusion

The source concern is confirmed: integrity-risk decisions do not constrain the top rating tiers. The remaining browser task is to reproduce a deterministic path in the rendered game and capture how the review copy emotionally frames the outcome.

The later implementation plan should decide which choices represent legitimate tradeoffs and which represent non-negotiable product constraints. This audit does not prescribe that model.
