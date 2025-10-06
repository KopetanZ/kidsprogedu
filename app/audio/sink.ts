"use client";
import type { AudioSink } from '../../core/engine/audio';

export function createWebAudioSink(): AudioSink {
  const events: { type: 'play_sound'; id?: string; ts: number }[] = [];
  let ctx: AudioContext | null = null;
  const ensureCtx = () => {
    if (typeof window === 'undefined') return null;
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  };
  return {
    events,
    play(id?: string) {
      events.push({ type: 'play_sound', id, ts: Date.now() });
      const ac = ensureCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 beep
      gain.gain.value = 0.05; // low volume for kids-friendly
      osc.connect(gain).connect(ac.destination);
      const now = ac.currentTime;
      osc.start(now);
      osc.stop(now + 0.15);
    },
  };
}

