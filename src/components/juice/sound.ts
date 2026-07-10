'use client';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, ms: number, delayMs = 0, type: OscillatorType = 'sine', gain = 0.05) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const t0 = ac.currentTime + delayMs / 1000;
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + ms / 1000);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000);
}

export const sfx = {
  click: (on: boolean) => on && tone(600, 60, 0, 'triangle', 0.03),
  win: (on: boolean) => {
    if (!on) return;
    tone(523, 120);          // C5
    tone(784, 200, 110);     // G5
  },
  lose: (on: boolean) => on && tone(140, 220, 0, 'square', 0.04),
  reward: (on: boolean) => {
    if (!on) return;
    tone(523, 100);
    tone(659, 100, 90);
    tone(784, 100, 180);
    tone(1047, 260, 270);
  },
};
