import Link from 'next/link';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'How Exception Room was designed',
  description: 'The evidence, authority, queue, and scoring model behind Exception Room.',
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="exception-about-section">
    <h2>{title}</h2>
    <div>{children}</div>
  </section>
);

export default function ExceptionRoomAboutPage() {
  return (
    <main className="exception-world">
      <article className="exception-shell exception-about-shell">
        <div className="exception-about-scroll">
          <header>
            <p className="exception-kicker">BEHIND THE FIELD TEST</p>
            <h1>HOW EXCEPTION ROOM WAS DESIGNED</h1>
            <p>
              A compact simulation of the work between an AI recommendation and an accountable operational decision.
            </p>
          </header>

          <Section title="What this game tests">
            <p>
              Exception Room tests whether a player can review evidence, respect decision authority, protect service
              deadlines, and use limited capacity well. Picking the right action is not enough. The game records
              whether the required evidence was actually reviewed.
            </p>
          </Section>

          <Section title="Why evidence and authority are separate">
            <p>
              Some recommendations are safe to approve because two current sources agree. Some contain a bounded
              error that the operator can correct. Others have complete evidence but still require a named policy
              owner. The cases teach that evidence can support a decision without granting the authority to make it.
            </p>
          </Section>

          <Section title="How the queue creates pressure">
            <p>
              Twelve synthetic cases arrive across three shifts. Approve, Correct, and Escalate spend different amounts
              of review capacity. Cases also have deadlines, consequence levels, and carryover rules. The pressure comes
              from prioritization, not a countdown clock.
            </p>
          </Section>

          <Section title="How the debrief stays accountable">
            <p>
              Safety is weighted by consequence and required-evidence coverage. Service reflects safe, timely outcomes.
              Capacity rewards proportionate review effort. A decision made with missing evidence remains visible in the
              final trace and cannot earn the strongest operator profile.
            </p>
          </Section>

          <Section title="How it was built">
            <p>
              The simulation is deterministic and runs entirely in the browser. Every case, deadline, action cost,
              outcome, and learning destination is authored and testable. Progress stays local. The scenarios are
              synthetic and contain no customer or production data.
            </p>
          </Section>

          <Link href="/exception-room/play?mode=practice" className="exception-primary-button">
            TRY THE PRACTICE QUEUE <ArrowRight size={20} weight="bold" />
          </Link>
          <Link href="/exception-room" className="exception-secondary-button">
            <ArrowLeft size={18} weight="bold" /> BACK TO BRIEFING
          </Link>
        </div>
      </article>
    </main>
  );
}
