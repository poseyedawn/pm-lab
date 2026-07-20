import type {
  Card,
  ChoiceGuidance,
  DecisionFeedback,
  Dir,
  IntegrityGuidance,
  RunState,
} from '@/lib/ship-it/types';

type CardGuidance = Record<Dir, ChoiceGuidance>;

const protectedBoundary = (
  domain: IntegrityGuidance['domain'],
  boundary: string,
): IntegrityGuidance => ({ domain, outcome: 'protected', boundary });

const breachedBoundary = (
  domain: IntegrityGuidance['domain'],
  boundary: string,
): IntegrityGuidance => ({ domain, outcome: 'breach', boundary });

const reviewRequired = (
  domain: IntegrityGuidance['domain'],
  boundary: string,
): IntegrityGuidance => ({ domain, outcome: 'review-required', boundary });

export const DECISION_GUIDANCE: Record<string, CardGuidance> = {
  'roadmap-vs-refactor': {
    left: {
      why: 'The rebuild buys reliability and lowers the cost of future checkout changes, but the roadmap pauses while the team replaces the service.',
      assumption: 'Three focused weeks remove more delivery risk than another quarter of patches.',
    },
    right: {
      why: 'Features keep moving now, while each patch adds more checkout fragility and interrupts later work.',
      assumption: 'The service can survive another quarter without a major failure.',
    },
  },
  'enterprise-checkbox': {
    left: {
      why: 'The contract adds immediate revenue, but an unscoped promise transfers delivery risk to engineering and the customer.',
      assumption: 'The team can absorb SSO inside the promised date without displacing committed work.',
      integrity: breachedBoundary('truthfulness', 'Do not make a contractual product promise before the accountable team scopes and accepts it.'),
    },
    right: {
      why: 'The deal is lost now, while the roadmap and team capacity stay honest.',
      assumption: 'Protecting delivery credibility is worth more than this single contract.',
      integrity: protectedBoundary('truthfulness', 'Customer commitments must match work the team has reviewed and accepted.'),
    },
  },
  'dark-pattern-growth': {
    left: {
      why: 'The pre-check creates more invitations by removing a deliberate choice, which damages consent and customer trust.',
      assumption: 'A conversion lift obtained through default consent is not sustainable customer value.',
      integrity: breachedBoundary('customer-trust', 'Contact invitations require a clear opt-in. A deceptive default is not an acceptable growth tradeoff.'),
    },
    right: {
      why: 'Opt-in produces fewer invitations, but each one reflects a customer decision the product can defend.',
      assumption: 'Trust and valid intent matter more than the raw invite conversion rate.',
      integrity: protectedBoundary('customer-trust', 'Growth must preserve a clear and voluntary customer choice.'),
    },
  },
  'onboarding-friction': {
    left: {
      why: 'A shorter signup gets customers to value sooner, but Sales loses fields used for early lead scoring.',
      assumption: 'Observed product use will qualify prospects better than nine required questions.',
    },
    right: {
      why: 'The form preserves lead data for Sales, while more people abandon onboarding before they see the product.',
      assumption: 'The extra qualification data is worth the conversion cost.',
    },
  },
  'conference-week': {
    left: {
      why: 'The conference invests in team growth and morale, but removes capacity during a visible delivery week.',
      assumption: 'The demo can tolerate slower preparation without losing stakeholder confidence.',
    },
    right: {
      why: 'The demo gets full staffing, while the team loses a development opportunity it valued.',
      assumption: 'This roadmap review matters more than the conference benefit this year.',
    },
  },
  'price-increase': {
    left: {
      why: 'Higher prices improve revenue per account, while customers absorb a visible cost increase.',
      assumption: 'The product delivers enough value to retain most customers after the change.',
    },
    right: {
      why: 'Stable pricing protects customer goodwill, but leaves planned revenue on the table.',
      assumption: 'Retention and trust will create more value than the immediate price lift.',
    },
  },
  'stale-flags': {
    left: {
      why: 'Removing conflicting flags reduces production uncertainty, but the cleanup sprint ships no customer feature.',
      assumption: 'The avoided incident and lower maintenance cost justify one sprint of delay.',
    },
    right: {
      why: 'Feature delivery continues, while stale controls make future releases harder to reason about.',
      assumption: 'The team can manage the flag debt without triggering a production failure.',
    },
  },
  'exec-pet-feature': {
    left: {
      why: 'Building the dashboard satisfies an executive request, but uses capacity before customer need is established.',
      assumption: 'Investor value will outweigh the cost of bypassing discovery.',
    },
    right: {
      why: 'Pushing back protects discovery and team focus, but creates immediate executive friction.',
      assumption: 'Evidence can change the decision before the relationship cost grows.',
    },
  },
  'support-queue': {
    left: {
      why: 'Engineering support clears urgent customer pain, but interrupts planned technical work.',
      assumption: 'The top support causes are fixable within the one-week loan.',
    },
    right: {
      why: 'The roadmap keeps its engineers, while customers wait longer and public frustration grows.',
      assumption: 'The planned build will create more customer value than clearing the current queue.',
    },
  },
  'a11y-audit': {
    left: {
      why: 'Fixing the audit removes known access barriers and strengthens the product, but consumes two sprints.',
      assumption: 'Accessibility debt is product work, not an optional polish backlog.',
      integrity: protectedBoundary('accessibility', 'Known access barriers require a funded remediation plan, not indefinite deferral.'),
    },
    right: {
      why: 'Fixing only blockers saves near-term capacity, while 52 known barriers remain for customers who rely on accessible interaction.',
      assumption: 'Leaving documented access failures unresolved creates product and compliance risk.',
      integrity: breachedBoundary('accessibility', 'A blockers-only patch is not a complete response to a known accessibility audit.'),
    },
  },
  'data-pipeline': {
    left: {
      why: 'The rebuild restores confidence in product evidence, but delays feature work.',
      assumption: 'Reliable decisions are worth more than a quarter of faster delivery on corrupted data.',
      integrity: protectedBoundary('evidence', 'Material product decisions require instrumentation the team can trust.'),
    },
    right: {
      why: 'Features keep shipping, but the team knowingly measures their effect with incomplete data.',
      assumption: 'Guessing from a pipeline that drops 12 percent of traffic cannot support accountable product claims.',
      integrity: reviewRequired('evidence', 'Pause evidence-based claims until the measurement gap is bounded and reviewed.'),
    },
  },
  'competitor-launch': {
    left: {
      why: 'A counter-launch answers market pressure quickly, but compresses quality work and drains the team.',
      assumption: 'Matching the competitor now prevents more loss than a rushed release creates.',
    },
    right: {
      why: 'The team protects its strategy and pace, while the competitor owns the immediate narrative.',
      assumption: 'Differentiated execution will matter more than feature parity.',
    },
  },
  'intern-bot': {
    left: {
      why: 'The bot turns internal excitement into a customer feature, but launches with uncertain ownership and production readiness.',
      assumption: 'A small team can adopt and support the prototype after the intern leaves.',
    },
    right: {
      why: 'Archiving avoids an unsupported feature, but discards momentum and disappoints its creator.',
      assumption: 'The ownership gap is larger than the demonstrated customer opportunity.',
    },
  },
  'meeting-audit': {
    left: {
      why: 'Removing recurring meetings returns focus time, but some coordination will need to be rebuilt deliberately.',
      assumption: 'Teams will restore only meetings that produce a clear decision or shared context.',
    },
    right: {
      why: 'Existing coordination stays intact, while engineers continue losing nearly half the week to meetings.',
      assumption: 'The current meeting load prevents more mistakes than it causes delivery delay.',
    },
  },
  'gdpr-list': {
    left: {
      why: 'Purging the list reduces short-term pipeline, but removes contacts without recorded consent before the audit.',
      assumption: 'A smaller lawful list is more valuable than revenue built on invalid consent.',
      integrity: protectedBoundary('privacy', 'Marketing contact requires recorded consent and a defensible lawful basis.'),
    },
    right: {
      why: 'One more campaign may create revenue, but knowingly uses a list that cannot prove consent.',
      assumption: 'Audit timing does not make invalid consent acceptable.',
      integrity: breachedBoundary('legal', 'Do not use personal contact data when the required consent record is missing.'),
    },
  },
  'oncall-pm': {
    left: {
      why: 'Pager duty exposes Product to operating pain and builds team trust, but costs focus and sleep.',
      assumption: 'Direct incident experience will improve later prioritization and readiness decisions.',
    },
    right: {
      why: 'Product keeps normal hours, while Engineering remains alone with the consequences of roadmap decisions.',
      assumption: 'Incident learning can be obtained without joining the rotation.',
    },
  },
  'beta-churn': {
    left: {
      why: 'A stable surface helps more customers learn the product, but slows visible experimentation.',
      assumption: 'Polish will reduce churn more than another wave of beta features.',
    },
    right: {
      why: 'Rapid iteration serves power users and learning speed, while less engaged customers keep losing their footing.',
      assumption: 'The product can afford churn while it searches for the right model.',
    },
  },
  'demo-vaporware': {
    left: {
      why: 'The prototype creates sales interest, but prospects are shown a capability that Engineering has not agreed to build.',
      assumption: 'A successful demo does not excuse a false product claim.',
      integrity: breachedBoundary('truthfulness', 'Prospects must be told when a demonstrated capability is a prototype and not an available product.'),
    },
    right: {
      why: 'Removing the tab costs pipeline excitement, but keeps the demo aligned with the product customers can buy.',
      assumption: 'Accurate expectations create stronger contracts than a misleading feature promise.',
      integrity: protectedBoundary('truthfulness', 'Sales demonstrations must distinguish shipped capability from concepts.'),
    },
  },
  'board-okrs': {
    left: {
      why: 'Accepting the target signals ambition, but puts the team behind a number without a credible plan.',
      assumption: 'The stretch target will produce useful focus rather than distorted behavior.',
    },
    right: {
      why: 'An honest target protects execution quality, but creates tension with the growth committee.',
      assumption: 'A committed plan is more useful than a larger unsupported number.',
    },
  },
  'android-crash': {
    left: {
      why: 'The hotfix protects 40,000 affected customers, but asks an exhausted team for weekend work.',
      assumption: 'The crash severity justifies the short emergency effort and a recovery plan afterward.',
    },
    right: {
      why: 'The team gets recovery time, while affected customers remain blocked until Monday.',
      assumption: 'A two-day delay is safer than pushing an exhausted team into another incident.',
    },
  },
  'open-api': {
    left: {
      why: 'A public API opens partner growth, but every interface becomes a customer contract the team must support.',
      assumption: 'The channel opportunity is large enough to justify slower internal change.',
    },
    right: {
      why: 'Internal interfaces stay flexible, while partners remain blocked from building on the product.',
      assumption: 'The product needs more learning before it can promise a stable platform.',
    },
  },
  'design-system-rebuild': {
    left: {
      why: 'The system reduces repeated design and engineering work, but delays the next six weeks of roadmap output.',
      assumption: 'The component debt appears often enough for the investment to pay back.',
    },
    right: {
      why: 'Near-term features keep moving, while inconsistent patterns continue to slow every later release.',
      assumption: 'The team can contain the inconsistency without multiplying maintenance cost.',
    },
  },
  'churn-interviews': {
    left: {
      why: 'Interviews add context behind churn behavior, but consume a week of product attention.',
      assumption: 'Direct customer evidence will reveal causes the dashboard cannot show.',
    },
    right: {
      why: 'The calendar stays open, while the team keeps interpreting churn from behavioral data alone.',
      assumption: 'Existing instrumentation is specific enough to explain why customers leave.',
    },
  },
  'hackathon-ask': {
    left: {
      why: 'A hackathon creates autonomy and new ideas, but pauses committed delivery and may add unsupported prototypes.',
      assumption: 'The team can define ownership and selection rules before ideas become obligations.',
    },
    right: {
      why: 'The roadmap keeps its week, while the team loses a source of energy and bottom-up discovery.',
      assumption: 'Current commitments outweigh the likely learning from another hackathon.',
    },
  },
  'seo-content-farm': {
    left: {
      why: 'The agency may create search traffic, but low-quality material weakens customer trust and adds brand cleanup work.',
      assumption: 'Traffic projections alone do not prove that the content serves customers or the product.',
      integrity: reviewRequired('customer-trust', 'Growth content needs a quality standard, accountable review, and honest claims before publication.'),
    },
    right: {
      why: 'Rejecting the agency sacrifices projected traffic, but protects a consistent and useful customer voice.',
      assumption: 'Fewer credible articles will outperform a large volume of disposable content over time.',
      integrity: protectedBoundary('customer-trust', 'Published product content should be accurate, useful, and reviewed.'),
    },
  },
  'legacy-webview': {
    left: {
      why: 'Support continues for 120,000 customers, but every release carries an extra compatibility cost.',
      assumption: 'The affected customers cannot move to a supported environment soon.',
    },
    right: {
      why: 'Dropping the WebView returns delivery capacity, while a defined customer group loses access.',
      assumption: 'A migration path and notice can reduce the harm of ending support.',
      integrity: reviewRequired('accessibility', 'Removing access from a known customer group requires notice, migration support, and an impact review.'),
    },
  },
  'bounty-report': {
    left: {
      why: 'Paying the researcher and patching now protects accounts, but interrupts planned work and creates an unbudgeted cost.',
      assumption: 'An authentication bypass is urgent enough to override the normal roadmap.',
      integrity: protectedBoundary('security', 'A known authentication bypass requires prompt containment, remediation, and responsible researcher handling.'),
    },
    right: {
      why: 'The roadmap loses less time now, while a known authentication bypass remains exploitable until the next sprint.',
      assumption: 'Quiet deferral does not reduce the security exposure.',
      integrity: breachedBoundary('security', 'Do not defer a known authentication bypass for routine roadmap convenience.'),
    },
  },
  'public-roadmap': {
    left: {
      why: 'A public roadmap gives customers visibility, but turns tentative plans into expectations and exposes direction to competitors.',
      assumption: 'The team can communicate uncertainty and update commitments openly.',
    },
    right: {
      why: 'Plans remain flexible and private, while customers get less context for their own decisions.',
      assumption: 'Direct account communication can replace a public roadmap without reducing trust.',
    },
  },
  'usage-pricing': {
    left: {
      why: 'Usage pricing may improve revenue alignment, but unreliable metering can create inaccurate customer bills.',
      assumption: 'The measurement gap must be fixed and audited before money depends on it.',
      integrity: reviewRequired('evidence', 'Billing must not depend on metering the company already describes as an estimate.'),
    },
    right: {
      why: 'Flat plans avoid questionable bills, but leave some revenue and pricing flexibility unused.',
      assumption: 'Reliable billing is worth delaying the pricing model change.',
      integrity: protectedBoundary('evidence', 'Customer charges require measurement the company can verify.'),
    },
  },
  'founder-livestream': {
    left: {
      why: 'The livestream creates attention, but repeated demos of nonexistent features mislead customers and bind the team to invented promises.',
      assumption: 'Hype does not justify presenting future ideas as working product.',
      integrity: breachedBoundary('truthfulness', 'Public product demonstrations must clearly distinguish available features from concepts.'),
    },
    right: {
      why: 'Reducing the livestream ambition costs attention, but keeps public claims tied to real product capability.',
      assumption: 'Credible demonstrations create stronger demand than promises the team cannot support.',
      integrity: protectedBoundary('truthfulness', 'Public claims must match the product customers can use.'),
    },
  },
  'sso-bill-due': {
    left: {
      why: 'Pulling engineers in may preserve the contract, but the unplanned promise now displaces roadmap and platform work.',
      assumption: 'The customer relationship is still recoverable through focused delivery.',
    },
    right: {
      why: 'Slipping the date protects more team capacity, but activates the contract and trust cost created by the earlier promise.',
      assumption: 'A transparent renegotiation is safer than another rushed commitment.',
    },
  },

  'incident-sev1': {
    left: {
      why: 'The launch keeps its week, while the organization loses the chance to learn why payments failed.',
      assumption: 'The outage will not repeat before the team revisits it.',
    },
    right: {
      why: 'The postmortem costs launch time, but creates shared evidence and actions that reduce repeat risk.',
      assumption: 'A blameless review will find a preventable system cause.',
    },
  },
  'incident-repeat': {
    left: {
      why: 'The team restores service first, but pays the full operating cost of a failure it did not investigate earlier.',
      assumption: 'A focused response can contain the repeat incident before more customers leave.',
    },
    right: {
      why: 'A statement may slow public damage briefly, while delaying the fix extends customer and platform harm.',
      assumption: 'Communication cannot substitute for restoring the payment path.',
    },
  },
  'incident-runbook': {
    left: {
      why: 'Funding alerts and ownership reduces repeat risk, but takes capacity from the near-term roadmap.',
      assumption: 'The postmortem identified a fixable class of failure rather than a one-off event.',
    },
    right: {
      why: 'Feature work resumes immediately, while the known ownership and alerting gap remains.',
      assumption: 'Documenting the problem without funding controls is enough to prevent recurrence.',
    },
  },
  'big-customer-ask': {
    left: {
      why: 'The custom promise improves renewal odds, but creates one-account work that drains platform and team capacity.',
      assumption: 'The contract value exceeds the long-term cost of a customer-specific workflow.',
    },
    right: {
      why: 'The roadmap stays coherent, while a large customer may reduce or cancel its renewal.',
      assumption: 'A stronger shared product will retain more value than this custom request.',
    },
  },
  'big-customer-escalation': {
    left: {
      why: 'Dropping everything may save the account, but makes the earlier custom promise expensive for every other customer and the team.',
      assumption: 'The account can still be retained if delivery becomes the top priority.',
    },
    right: {
      why: 'Renegotiation protects team focus, but forces the company to admit the original commitment was not credible.',
      assumption: 'A smaller honest scope can preserve more trust than another missed promise.',
    },
  },
  'big-customer-renewal': {
    left: {
      why: 'A reusable enterprise tier converts the account need into product strategy, but still consumes platform capacity.',
      assumption: 'Other enterprise customers share enough of the need to justify a tier.',
    },
    right: {
      why: 'The shared product remains simple, while the company gives up a validated enterprise expansion path.',
      assumption: 'Enterprise complexity would distract more than the renewal revenue helps.',
    },
  },
  'burnout-crunch': {
    left: {
      why: 'Crunch may hit the partner window, but transfers schedule risk into exhaustion and retention risk.',
      assumption: 'Five weeks of overtime can be contained without lasting team damage.',
    },
    right: {
      why: 'Refusing overtime protects sustainable pace, while the company may miss a valuable partner moment.',
      assumption: 'A narrower launch or later date preserves more value than forced overtime.',
    },
  },
  'burnout-resignation': {
    left: {
      why: 'A counter-offer and apology may retain critical billing knowledge, but requires money and credible behavior change.',
      assumption: 'The resignation risk is still reversible and not only about compensation.',
    },
    right: {
      why: 'The company avoids a special retention package, while losing scarce knowledge and signaling that burnout has no consequence.',
      assumption: 'The team can replace the engineer without deeper morale or platform damage.',
    },
  },
  'burnout-reset': {
    left: {
      why: 'A recovery sprint repairs morale and bugs, but pauses the next wave of business commitments.',
      assumption: 'Explicit recovery will restore capacity faster than continuing at launch pace.',
    },
    right: {
      why: 'Roadmap momentum continues, while the team carries exhaustion and unresolved launch defects forward.',
      assumption: 'The team can sustain another cycle without more resignations or quality loss.',
    },
  },
  'launch-gamble-date': {
    left: {
      why: 'The keynote creates reach and pipeline, but ships the feature before Engineering considers it ready.',
      assumption: 'The conference opportunity outweighs the quality and support risk.',
    },
    right: {
      why: 'The feature gets two more weeks of quality work, while Marketing loses a rare launch stage.',
      assumption: 'A stable launch will create more durable value than the keynote spike.',
    },
  },
  'launch-gamble-press': {
    left: {
      why: 'Owning the failure preserves credibility and directs the team toward repair, but extends the delivery cost of the early launch.',
      assumption: 'Transparent recovery can convert a shaky launch into customer trust.',
      integrity: protectedBoundary('truthfulness', 'Public incident communication should state what failed and what the team is doing next.'),
    },
    right: {
      why: 'The company protects the signup narrative, while customers keep encountering defects the launch team is not addressing.',
      assumption: 'A temporary acquisition spike will not survive ignored product failures.',
      integrity: reviewRequired('customer-trust', 'A known launch failure needs a customer recovery plan, not only growth reporting.'),
    },
  },
  'launch-gamble-stabilize': {
    left: {
      why: 'Stabilization converts the rushed release into a dependable feature, but pauses new roadmap work.',
      assumption: 'Two focused weeks can remove the defect tail customers keep experiencing.',
    },
    right: {
      why: 'New work keeps moving, while flaky sync and angry reviews continue to tax customers and Engineering.',
      assumption: 'The existing defects will not compound into churn or a larger incident.',
    },
  },
  'viral-spike': {
    left: {
      why: 'Throttling protects the service and support team, but turns away some of the demand that caused the overshoot.',
      assumption: 'A controlled waitlist retains more long-term value than an overloaded launch.',
    },
    right: {
      why: 'Open signups capture the moment, while capacity and support absorb a surge they were not built to handle.',
      assumption: 'The system can survive the peak before customer experience collapses.',
    },
  },
  'influencer-flood': {
    left: {
      why: 'Building the expected feature may retain the new audience, but diverts the team into an unplanned promise.',
      assumption: 'The influencer audience matches the product strategy well enough to justify the pivot.',
    },
    right: {
      why: 'The roadmap stays intact, while much of the acquisition spike churns and weakens the growth story.',
      assumption: 'The tourists are less valuable than the customers already served by the roadmap.',
    },
  },
  'monetization-squeeze': {
    left: {
      why: 'New paywalls may lift revenue, but remove value customers already use and create support and trust costs.',
      assumption: 'Enough customers will pay rather than leave or reduce usage.',
    },
    right: {
      why: 'The free tier remains useful, while the board gives up immediate monetization from a strong quarter.',
      assumption: 'Preserving adoption will support a better pricing change later.',
    },
  },
  'growth-at-all-costs': {
    left: {
      why: 'Chasing the investor deck may protect fundraising momentum, but forces the team to build promises made before product review.',
      assumption: 'Capital gained now will outweigh the delivery and credibility debt.',
      integrity: breachedBoundary('truthfulness', 'Investor materials must distinguish committed work from ideas the team has not scoped.'),
    },
    right: {
      why: 'Resetting expectations damages the current fundraising story, but restores a plan the team can support honestly.',
      assumption: 'Accurate commitments create a healthier financing process than inflated feature claims.',
      integrity: protectedBoundary('truthfulness', 'Investor claims must match reviewed product commitments.'),
    },
  },
  'comfort-culture': {
    left: {
      why: 'Tighter goals reconnect morale with outcomes, but reduce the comfort that produced the team overshoot.',
      assumption: 'Clearer accountability can improve delivery without reversing the healthy culture.',
    },
    right: {
      why: 'The team keeps maximum autonomy and comfort, while customers and the board wait longer for useful work.',
      assumption: 'Morale will eventually convert into roadmap output without a goal reset.',
    },
  },
  'perpetual-hack-week': {
    left: {
      why: 'Returning to the roadmap restores customer and business focus, but ends a period the team enjoyed.',
      assumption: 'The best internal experiments can survive a deliberate selection process.',
    },
    right: {
      why: 'The team keeps its creative pace, while customer commitments continue to receive no capacity.',
      assumption: 'Another internal tool will create more value than the delayed roadmap.',
    },
  },
  'gold-plating': {
    left: {
      why: 'Feature mode redirects a healthy platform toward customer delivery, but stops technical refinement the team values.',
      assumption: 'The sync engine is reliable enough and further rewrites have low customer return.',
    },
    right: {
      why: 'Engineering continues refining the platform, while customers and revenue wait for visible product progress.',
      assumption: 'Another rewrite will create a defensible advantage rather than more internal elegance.',
    },
  },
  'replatform-dream': {
    left: {
      why: 'Replatforming may modernize the stack, but consumes a rare stable period without a clear customer problem.',
      assumption: 'The new platform removes a specific constraint that justifies the freeze.',
    },
    right: {
      why: 'The team ships on the healthy platform, while postponing a technical change it finds attractive.',
      assumption: 'Current architecture can support the next product phase without hidden risk.',
    },
  },
};

export const CARD_CAUSAL_CONTEXT: Partial<Record<string, string>> = {
  'sso-bill-due': 'Earlier choice: You promised SSO before Engineering scoped it. The contractual date has arrived.',
  'incident-repeat': 'Earlier choice: You skipped the payment postmortem. The same failure has returned.',
  'incident-runbook': 'Earlier choice: You funded a blameless payment postmortem. It found an unowned config path.',
  'big-customer-escalation': 'Earlier choice: You promised a one-customer workflow. The account is now escalating the delay.',
  'big-customer-renewal': 'Earlier choice: You held the shared roadmap line. The customer has returned with a reusable enterprise need.',
  'burnout-resignation': 'Earlier choice: You called for evenings and weekends. A critical engineer is now preparing to leave.',
  'burnout-reset': 'Earlier choice: You called for crunch to hit the launch. The team is carrying the cost.',
  'launch-gamble-press': 'Earlier choice: You shipped for the keynote before the feature was ready. The public demo failed.',
  'launch-gamble-stabilize': 'Earlier choice: You shipped early for the keynote. The defect tail is still affecting customers.',
  'viral-spike': 'Backlash: Customer reached 85 or higher. Demand has outrun support and platform capacity.',
  'influencer-flood': 'Backlash: Customer reached 85 or higher. Acquisition now exceeds the product promise.',
  'monetization-squeeze': 'Backlash: Business reached 85 or higher. Revenue pressure is now extracting value from customers.',
  'growth-at-all-costs': 'Backlash: Business reached 85 or higher. Fundraising claims have run ahead of product commitments.',
  'comfort-culture': 'Backlash: Team reached 85 or higher. Morale is no longer translating into accountable delivery.',
  'perpetual-hack-week': 'Backlash: Team reached 85 or higher. Internal exploration has displaced the customer roadmap.',
  'gold-plating': 'Backlash: Tech reached 85 or higher. Platform refinement has displaced customer delivery.',
  'replatform-dream': 'Backlash: Tech reached 85 or higher. A healthy platform is attracting change without a customer constraint.',
};

export function getDecisionFeedback(card: Card, dir: Dir): DecisionFeedback {
  const choice = card[dir];
  const guidance = DECISION_GUIDANCE[card.id]?.[dir];
  if (!guidance) throw new Error(`Missing Ship It decision guidance for ${card.id}:${dir}`);
  return {
    cardId: card.id,
    choiceLabel: choice.label,
    effects: choice.effects,
    guidance,
  };
}

export function getLastDecisionFeedback(run: RunState, deck: Card[]): DecisionFeedback | null {
  const last = run.history.at(-1);
  if (!last) return null;
  const card = deck.find((candidate) => candidate.id === last.cardId);
  return card ? getDecisionFeedback(card, last.dir) : null;
}

export function getIntegrityEvents(run: RunState, deck: Card[]): DecisionFeedback[] {
  return run.history.flatMap((entry) => {
    const card = deck.find((candidate) => candidate.id === entry.cardId);
    if (!card) return [];
    const feedback = getDecisionFeedback(card, entry.dir);
    return feedback.guidance.integrity ? [feedback] : [];
  });
}

export function getIntegrityIssues(run: RunState, deck: Card[]): DecisionFeedback[] {
  return getIntegrityEvents(run, deck).filter(
    (feedback) => feedback.guidance.integrity?.outcome !== 'protected',
  );
}
