'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  Clock,
  LockKey,
  Notebook,
  Stack,
  Target,
} from '@phosphor-icons/react';
import {
  loadActiveExceptionRun,
  loadExceptionRoomState,
  type ActiveExceptionRunSnapshot,
  type ExceptionRoomState,
} from '@/lib/exception-room/state';
import { GameEntryLoading } from '@/components/game/GameEntryLoading';

export default function ExceptionRoomHome() {
  const [progress, setProgress] = useState<ExceptionRoomState | null>(null);
  const [activeRun, setActiveRun] = useState<ActiveExceptionRunSnapshot | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved game preference once
    setProgress(loadExceptionRoomState());
    setActiveRun(loadActiveExceptionRun());
  }, []);

  if (!progress) {
    return (
      <GameEntryLoading
        gameName="Exception Room"
        description="Restoring the review queue and your evidence record."
        theme="exception-room"
      />
    );
  }

  return (
    <main className="exception-world">
      <section className="exception-shell exception-start-shell">
        <div className="exception-start-scroll">
          <section className="exception-hero">
            <p className="exception-kicker">AI OPERATIONS SIMULATION</p>
            <h1><span>EXCEPTION</span><strong>ROOM</strong></h1>
            <p className="exception-hero-copy">
              The model made a call. You own what happens next. Review the evidence before capacity runs out.
            </p>
            <div className="exception-hero-art">
              <Image
                src="/exception-room/selected-direction.webp"
                alt="Exception Room queue and case review interface"
                fill
                sizes="348px"
                priority
              />
            </div>
          </section>

          <section className="exception-brief-grid" aria-label="Campaign details">
            <div><Clock size={18} weight="bold" /><span><b>8 min</b> campaign</span></div>
            <div><Target size={18} weight="bold" /><span><b>12</b> synthetic cases</span></div>
          </section>

          <section className="exception-how-it-works" aria-labelledby="exception-how-title">
            <h2 id="exception-how-title">HOW THE QUEUE WORKS</h2>
            <ol>
              <li><b>Inspect</b><span>Open the required evidence, not just the AI recommendation.</span></li>
              <li><b>Decide</b><span>Approve, correct, or escalate within finite review capacity.</span></li>
              <li><b>Learn</b><span>See how evidence, timing, and authority shaped the outcome.</span></li>
            </ol>
          </section>

          {activeRun?.mode === 'campaign' ? (
            <div className="exception-mode-card exception-mode-locked" aria-disabled="true">
              <span className="exception-mode-icon"><LockKey size={22} weight="fill" /></span>
              <span><b>Practice queue</b><small>Finish the active campaign before starting practice.</small></span>
              <span className="exception-soon">LOCKED</span>
            </div>
          ) : (
            <Link href="/exception-room/play?mode=practice" className="exception-mode-card exception-mode-primary">
              <span className="exception-mode-icon"><Brain size={24} weight="fill" /></span>
              <span>
                <b>{activeRun?.mode === 'practice' ? 'Resume practice' : progress.practiceComplete ? 'Replay practice' : 'Practice the decisions'}</b>
                <small>Three guided cases. No score and no XP.</small>
              </span>
              <ArrowRight size={22} weight="bold" />
            </Link>
          )}

          {activeRun?.mode === 'practice' ? (
            <div className="exception-mode-card exception-mode-locked" aria-disabled="true">
              <span className="exception-mode-icon"><LockKey size={22} weight="fill" /></span>
              <span><b>Scored campaign</b><small>Finish the active practice queue before starting the campaign.</small></span>
              <span className="exception-soon">LOCKED</span>
            </div>
          ) : progress.practiceComplete || activeRun?.mode === 'campaign' ? (
            <Link href="/exception-room/play?mode=campaign" className="exception-mode-card exception-mode-campaign">
              <span className="exception-mode-icon"><Stack size={24} weight="fill" /></span>
              <span>
                <b>{activeRun?.mode === 'campaign' ? 'Resume campaign' : progress.campaignComplete ? 'Run campaign again' : 'Start scored campaign'}</b>
                <small>Three shifts. Twelve cases. Every tradeoff counts.</small>
              </span>
              <ArrowRight size={22} weight="bold" />
            </Link>
          ) : (
            <div className="exception-mode-card exception-mode-locked" aria-disabled="true">
              <span className="exception-mode-icon"><LockKey size={22} weight="fill" /></span>
              <span><b>Scored campaign</b><small>Complete the three practice cases to unlock it.</small></span>
              <span className="exception-soon">LOCKED</span>
            </div>
          )}

          <Link href="/exception-room/about" className="exception-about-link">
            <Notebook size={18} weight="bold" /> HOW THIS GAME WAS DESIGNED
          </Link>

          <p className="exception-disclosure">
            Built with synthetic cases. No customer records or production data are used.
          </p>
        </div>
      </section>
    </main>
  );
}
