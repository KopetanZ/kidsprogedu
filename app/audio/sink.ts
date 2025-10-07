"use client";
import type { AudioSink } from '../../core/engine/audio';

// 効果音タイプ
type SoundType = 'move' | 'goal' | 'error' | 'block_place' | 'play_sound';

export function createWebAudioSink(): AudioSink {
  const events: { type: 'play_sound'; id?: string; ts: number }[] = [];
  let ctx: AudioContext | null = null;
  const ensureCtx = () => {
    if (typeof window === 'undefined') return null;
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx;
  };

  // 効果音再生関数
  const playSound = (soundType: SoundType) => {
    const ac = ensureCtx();
    if (!ac) return;

    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain).connect(ac.destination);

    switch (soundType) {
      case 'move': {
        // ぴょん♪（短くて高めの音）
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'goal': {
        // やったー！（上昇する明るい音）
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc.frequency.linearRampToValueAtTime(784, now + 0.15); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'error': {
        // あれれ？（下降する音）
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.2);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'block_place': {
        // カチッ（短い低音）
        osc.type = 'square';
        osc.frequency.value = 200;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'play_sound':
      default: {
        // オリジナルのビープ音
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.05;
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  };

  return {
    events,
    play(id?: string) {
      events.push({ type: 'play_sound', id, ts: Date.now() });
      playSound((id as SoundType) || 'play_sound');
    },
  };
}

