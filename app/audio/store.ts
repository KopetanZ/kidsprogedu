"use client";
import { create } from 'zustand';

type AudioState = {
  muted: boolean;
  setMuted: (v: boolean) => void;
  toggle: () => void;
};

const KEY = 'kidsprogedu_muted';

export const useAudioStore = create<AudioState>()((set, get) => ({
  muted: (() => {
    if (typeof window === 'undefined') return false;
    try {
      const v = window.localStorage.getItem(KEY);
      return v === '1';
    } catch { return false; }
  })(),
  setMuted(v) {
    set({ muted: v });
    try { if (typeof window !== 'undefined') window.localStorage.setItem(KEY, v ? '1' : '0'); } catch {}
  },
  toggle() {
    const v = !get().muted;
    get().setMuted(v);
  },
}));

