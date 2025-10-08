"use client";

// BGMタイプ
export type BGMType = 'menu' | 'editor' | 'clear';

// BGMプレイヤークラス
export class BGMPlayer {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private currentGains: GainNode[] = [];
  private isMuted: boolean = false;
  private currentType: BGMType | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // メニュー用BGM（明るく軽快）
  private playMenuBGM() {
    if (!this.ctx) return;

    const melody = [
      { freq: 523, duration: 0.3 }, // C5
      { freq: 587, duration: 0.3 }, // D5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 784, duration: 0.3 }, // G5
      { freq: 659, duration: 0.3 }, // E5
      { freq: 587, duration: 0.3 }, // D5
    ];

    let time = this.ctx.currentTime;
    const playNote = (freq: number, duration: number, startTime: number) => {
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);

      this.currentOscillators.push(osc);
      this.currentGains.push(gain);
    };

    const playSequence = () => {
      melody.forEach((note) => {
        playNote(note.freq, note.duration, time);
        time += note.duration;
      });
    };

    // ループ再生
    const loop = () => {
      if (this.currentType === 'menu' && !this.isMuted) {
        time = this.ctx!.currentTime;
        playSequence();
        setTimeout(loop, melody.reduce((sum, n) => sum + n.duration, 0) * 1000);
      }
    };

    loop();
  }

  // エディタ用BGM（落ち着いた集中できる音）
  private playEditorBGM() {
    if (!this.ctx) return;

    const notes = [440, 493, 523, 587]; // A4, B4, C5, D5
    let index = 0;

    const playAmbient = () => {
      if (!this.ctx || this.currentType !== 'editor' || this.isMuted) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = notes[index % notes.length] ?? 440;
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);

      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2);

      this.currentOscillators.push(osc);
      this.currentGains.push(gain);

      index++;
      setTimeout(playAmbient, 2000);
    };

    playAmbient();
  }

  // BGMを再生
  play(type: BGMType, muted: boolean = false) {
    this.stop();
    this.currentType = type;
    this.isMuted = muted;

    if (muted) return;

    switch (type) {
      case 'menu':
        this.playMenuBGM();
        break;
      case 'editor':
        this.playEditorBGM();
        break;
      case 'clear':
        // クリア画面は効果音のみで十分
        break;
    }
  }

  // BGMを停止
  stop() {
    this.currentType = null;
    this.currentOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.currentOscillators = [];
    this.currentGains = [];
  }

  // ミュート切り替え
  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.currentGains.forEach((gain) => {
        gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      });
    }
  }
}

// グローバルBGMプレイヤー
let globalBGMPlayer: BGMPlayer | null = null;

export function getBGMPlayer(): BGMPlayer {
  if (!globalBGMPlayer && typeof window !== 'undefined') {
    globalBGMPlayer = new BGMPlayer();
  }
  return globalBGMPlayer!;
}
