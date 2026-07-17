import Link from 'next/link';
import { GameShell } from '@/components/game/GameShell';

export const metadata = {
  title: 'How Ship It was designed',
  description: 'The stakeholder-tension model, arc system, and engagement mechanics behind Ship It.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-2 rounded-[var(--radius-card)] bg-surface p-6 shadow-lg">
    <h2 className="text-lg font-extrabold text-sky-deep">{title}</h2>
    <div className="flex flex-col gap-2 text-sm leading-relaxed text-ink">{children}</div>
  </section>
);

export default function ShipItAbout() {
  return (
    <GameShell gameId="ship-it">
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <header>
        <h1 className="text-2xl font-extrabold text-sky-deep">How Ship It was designed</h1>
        <p className="mt-1 text-sm text-ink-soft">A game about the part of product management nobody puts on the roadmap.</p>
      </header>

      <Section title="What this game trains">
        <p>
          Ship It is about prioritization under stakeholder pressure. Every card is a real trade-off with no
          correct answer: the choice that grows Users starves Tech, the one that calms the board burns the team.
          The game never lectures — the meters do the teaching.
        </p>
      </Section>

      <Section title="The stakeholder-tension model">
        <p>
          Four meters — Users, Business, Team, Tech — start at 50. Any meter at zero ends the run: the product is
          shelved, the funding pulled, the engineers gone, or the platform down.
        </p>
        <p>
          Maxing a meter is its own failure mode. Park any meter at 85+ and its backlash card comes for you: a
          viral spike drowns support, a monetization squeeze angers users, comfort culture invites board pressure,
          and a gold-plated platform starves the roadmap. Optimizing one stakeholder always taxes another.
        </p>
      </Section>

      <Section title="Arcs and consequences">
        <p>
          Choices set flags that the deck remembers. Skip the postmortem in week two and the same outage returns in
          week eight, twice as hard. Four authored arcs — an incident, a demanding enterprise customer, a burnout
          spiral, and a launch gamble — can each be resolved or fumbled, and your review remembers which.
        </p>
      </Section>

      <Section title="The performance review">
        <p>
          Every run ends in a quarterly review, from PIP to CEO-in-waiting. It is template-generated from the run
          state — your lowest meter, the arcs you closed or abandoned, the overshoots you triggered — and seeded, so
          the same run always writes the same review. No AI, no server: the whole game is deterministic from its seed.
        </p>
      </Section>

      <Section title="Engagement mechanics, and the lines we drew">
        <p>
          The retention layer is deliberate: instant restart, a rating ladder to climb, a daily run with streaks and
          shields, and a share card. The lines are equally deliberate: no dark patterns, no pay-anything, no
          notifications, and every byte of state lives in your browser. The game about resisting growth hacks should
          probably resist them itself.
        </p>
      </Section>

      <Link href="/ship-it" className="text-center text-sm font-extrabold text-ink-soft underline">
        Back to Ship It
      </Link>
    </main>
    </GameShell>
  );
}
