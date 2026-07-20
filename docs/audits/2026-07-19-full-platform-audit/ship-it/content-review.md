# Ship It decision-model review

This review examines the deck, scoring, and feedback model in source. It does not replace the pending interaction and visual audit.

## Content map

The deck contains 51 authored cards:

- 30 standalone stakeholder dilemmas
- 1 conditional SSO consequence card
- 12 cards across four three-part story arcs
- 8 overshoot cards, two for each meter

A run normally spans 12 decisions and can extend to 18 while consequences remain active.

## Strengths

### SHIP-C01: The subject matter is recognizably product management

The deck covers platform debt, enterprise commitments, onboarding friction, pricing, accessibility, data quality, incidents, customer concentration, burnout, launches, security, research, and executive pressure. The situations are concrete enough to prompt real discussion.

### SHIP-C02: Consequences persist beyond a single card

Flags and authored arcs let an early promise or shortcut return later. This is the game's strongest product idea because it demonstrates that product decisions create future operating conditions, not isolated score changes.

### SHIP-C03: Overshoot mechanics challenge single-metric optimization

Users, Business, Team, and Tech can become unhealthy when neglected, but high values also trigger backlash. That is a more mature model than simply maximizing four bars.

### SHIP-C04: The review is deterministic and run-specific

The ending reflects the final meter balance, opened and resolved arcs, overshoots, and survival. A repeated seed produces the same review, which is credible engineering evidence.

## Risks

### SHIP-C-P1-01: The core score model is hidden and does not teach after each decision

Severity: `P1` comprehension and learning-loop risk.

Before a choice, the interface only identifies which meters are affected. It does not reveal direction or magnitude. Afterward, it shows numerical meter movement but no card-specific explanation for why those values changed. The final review discusses the lowest meter and story arcs, not the reasoning behind individual choices.

Impact: a visitor can observe that the game has an opinion without understanding the model behind that opinion. Experienced PMs may read fixed numerical effects as arbitrary, while less experienced players receive little guidance they can transfer to real work.

### SHIP-C-P1-02: The claim that there are no correct answers includes actions with clear legal, ethical, accessibility, or security boundaries

Severity: `P1` product judgment and portfolio trust risk.

The deck treats the following as ordinary meter trades:

- using a pre-checked contact-invite dark pattern
- sending another campaign from a list without recorded consent
- postponing an authentication-bypass patch
- leaving known accessibility failures unresolved
- knowingly showing vaporware to prospects

Nuance is appropriate for prioritization, but some options require explicit constraints, escalation, or rejection rather than a favorable score on one meter. Presenting every choice as morally equivalent can make the portfolio communicate weaker judgment than the writing intends.

### SHIP-C-P1-03: The Users meter mixes adoption with user welfare

Severity: `P1` model coherence risk.

Shipping the pre-checked invite dark pattern adds 12 Users points, and signing a low-quality SEO content agency adds 8 Users points. In other cards, the same meter represents support quality, accessibility, churn, and product trust.

Impact: if Users means usage growth, the label is incomplete. If it means user value or health, harmful growth tactics should not increase it. The ambiguity makes the meter impossible to interpret consistently.

### SHIP-C-P1-04: High ratings do not account for unsafe or unethical choices

Severity: `P1` scoring integrity and portfolio trust risk.

The rating function only checks whether the run survived, whether all meters finish between 30 and 70, and how many arcs were resolved. Legal, security, accessibility, and dark-pattern decisions set no negative integrity state of their own.

Impact: a player can make choices the case-study says the product itself rejects and still receive a top performance rating if the final meters and arcs align.

The production-engine diagnostic in `policy-simulation.md` confirms reachability. Across 10,000 seeds, 1,926 runs containing classified integrity-risk choices received Promoted or CEO-in-waiting.

### SHIP-C-P2-02: Fixed effect sizes appear more precise than the content can support

Severity: `P2` credibility risk.

Every authored choice maps directly to fixed meter deltas such as plus 12 Business or minus 8 Team. The values are useful game balancing inputs, but there is no explanation that they are editorial weights rather than measured causal estimates.

### SHIP-C-P2-03: The final review cannot close the learning loop for a 12-card run

Severity: `P2` feedback depth risk.

The review is limited to three sentences. It can mention the rating, lowest meter, one arc, or an overshoot, but cannot identify a player's strongest decision, riskiest shortcut, or repeated pattern across the quarter.
