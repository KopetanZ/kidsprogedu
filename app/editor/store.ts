"use client";
import { create } from 'zustand';
import type { Block, Lesson } from '../../core/blocks/schemas';
import { Runtime } from '../../core/engine/runtime';

type EditorState = {
  lesson?: Lesson;
  program: Block[];
  history: Block[][];
  isRunning: boolean;
  pos: { x: number; y: number };
  hintText?: string;
  _raf?: number;
  _runtime?: import('../../core/engine/runtime').Runtime;
  setLesson: (lesson: Lesson) => void;
  addBlock: (b: Block) => void;
  removeLast: () => void;
  undo: () => void;
  reset: () => void;
  run: () => boolean; // returns cleared?
  runAnimated: () => Promise<boolean>;
  hint: (text: string) => void;
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  program: [],
  history: [],
  isRunning: false,
  pos: { x: 1, y: 1 },
  setLesson(lesson) {
    set({ lesson, program: lesson.starterCode.slice(), pos: { x: 1, y: 1 } });
  },
  addBlock(b) {
    const prev = get().program;
    set({ history: [...get().history, prev], program: [...prev, b] });
  },
  removeLast() {
    const prev = get().program;
    set({ history: [...get().history, prev], program: prev.slice(0, -1) });
  },
  undo() {
    const history = get().history.slice();
    const last = history.pop();
    if (last) set({ program: last, history });
  },
  reset() {
    const lesson = get().lesson;
    const raf = get()._raf;
    if (raf) cancelAnimationFrame(raf);
    if (lesson) set({ program: lesson.starterCode.slice(), pos: { x: 1, y: 1 }, isRunning: false, _raf: undefined, _runtime: undefined });
  },
  run() {
    const lesson = get().lesson;
    if (!lesson) return false;
    const program: Block[] = [{ block: 'when_flag' }, ...get().program.filter((b) => b.block !== 'when_flag')];
    const r = new Runtime({ goal: lesson.goal });
    r.load(program);
    r.runUntilIdle(256);
    const s = r.getState();
    set({ pos: s.pos, isRunning: false });
    return s.pos.x === lesson.goal.x && s.pos.y === lesson.goal.y;
  },
  async runAnimated() {
    const lesson = get().lesson;
    if (!lesson) return false;
    // Prepare program
    const program: Block[] = [{ block: 'when_flag' }, ...get().program.filter((b) => b.block !== 'when_flag')];
    const { Runtime } = await import('../../core/engine/runtime');
    const { createWebAudioSink } = await import('../audio/sink');
    const { useAudioStore } = await import('../audio/store');
    const muted = useAudioStore.getState().muted;
    const audio = muted ? undefined : createWebAudioSink();
    const runtime = new Runtime({ goal: lesson.goal, maxInstructionsPerTick: 1, audio });
    runtime.load(program);
    set({ _runtime: runtime, isRunning: true });

    return new Promise<boolean>((resolve) => {
      const tick = () => {
        const st = get()._runtime!;
        if (!st) { set({ isRunning: false, _raf: undefined }); resolve(false); return; }
        st.step();
        const s = st.getState();
        set({ pos: s.pos });
        if (s.running) {
          const raf = requestAnimationFrame(tick);
          set({ _raf: raf });
        } else {
          set({ isRunning: false, _raf: undefined, _runtime: undefined });
          resolve(s.pos.x === lesson.goal.x && s.pos.y === lesson.goal.y);
        }
      };
      const raf = requestAnimationFrame(tick);
      set({ _raf: raf });
    });
  },
  hint(text) {
    set({ hintText: text });
    setTimeout(() => set({ hintText: undefined }), 3000);
  },
}));
