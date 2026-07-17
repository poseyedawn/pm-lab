'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Clock,
  LockKey,
  SpeakerHigh,
  SpeakerSlash,
  Stack,
  Target,
} from '@phosphor-icons/react';
import {
  loadExceptionRoomState,
  saveExceptionRoomState,
  type ExceptionRoomState,
} from '@/lib/exception-room/state';

export default function ExceptionRoomHome() {
  const [progress, setProgress] = useState<ExceptionRoomState | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved game preference once
    setProgress(loadExceptionRoomState());
  }, []);

  if (!progress) return <main className="exception-world" aria-busy="true" />;

  const toggleSound = () => {
    const next = { ...progress, soundOn: !progress.soundOn };
    saveExceptionRoomState(next);
    setProgress(next);
  };

  return (
    <main className="exception-world">
      <section className="exception-shell exception-start-shell">
        <header className="exception-topbar">
          <div className="exception-brand-mark"><Stack weight="fill" size={19} /></div>
          <button className="exception-icon-button" type="button" onClick={toggleSound} aria-label={`Turn sound ${progress.soundOn ? 'off' : 'on'}`}>
            {progress.soundOn ? <SpeakerHigh size={20} weight="fill" /> : <SpeakerSlash size={20} weight="fill" />}
          </button>
        </header>

        <div className="exception-start-scroll">
          <section className="exception-hero">
            <p className="exception-kicker">AI OPERATIONS SIMULATION</p>
            <h1><span>EXCEPTION</span><strong>ROOM</strong></h1>
            <p className="exception-hero-copy">
              The model made a call. You own what happens next. Review the evidence before capacity runs out.
            </p>
            <div className="exception-hero-art">
              <Image
                src="/assets/exception-room/selected-direction.webp"
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

          <Link href="/exception-room/play" className="exception-mode-card exception-mode-primary">
            <span className="exception-mode-icon"><Stack size={24} weight="fill" /></span>
            <span>
              <b>{progress.campaignComplete ? 'Run campaign again' : 'Start campaign'}</b>
              <small>Three shifts. Finite capacity. Every tradeoff counts.</small>
            </span>
            <ArrowRight size={22} weight="bold" />
          </Link>

          <div className="exception-mode-card exception-mode-locked" aria-disabled="true">
            <span className="exception-mode-icon"><LockKey size={22} weight="fill" /></span>
            <span><b>Daily queue</b><small>A shared case mix is coming next.</small></span>
            <span className="exception-soon">SOON</span>
          </div>

          <p className="exception-disclosure">
            Built with synthetic cases. No customer records or production data are used.
          </p>
        </div>
      </section>
    </main>
  );
}
