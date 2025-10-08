"use client";
import { create } from 'zustand';
import type { Block, Lesson } from '../../core/blocks/schemas';
import { Runtime } from '../../core/engine/runtime';

type EditorState = {
  lesson?: Lesson;
  program: Block[];
  history: Block[][];
  isRunning: boolean;
  isStepMode: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  currentBlockIndex?: number;
  pos: { x: number; y: number };
  hintText?: string;
  _raf?: number;
  _runtime?: import('../../core/engine/runtime').Runtime;
  setLesson: (lesson: Lesson) => void;
  addBlock: (b: Block) => void;
  addBlockToRepeat: (repeatIndex: number, child: Block) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  removeBlock: (index: number) => void;
  removeLast: () => void;
  undo: () => void;
  reset: () => void;
  run: () => boolean; // returns cleared?
  runAnimated: () => Promise<boolean>;
  startStepMode: () => void;
  stepNext: () => void;
  stepPrevious: () => void;
  pauseStep: () => void;
  resumeStep: () => void;
  stopStepMode: () => void;
  hint: (text: string) => void;
};

export const useEditorStore = create<EditorState>()((set, get) => ({
  program: [],
  history: [],
  isRunning: false,
  isStepMode: false,
  isPaused: false,
  currentStepIndex: 0,
  pos: { x: 1, y: 1 },
  setLesson(lesson) {
    set({ lesson, program: lesson.starterCode.slice(), pos: { x: 1, y: 1 } });
  },
  addBlock(b) {
    const prev = get().program;
    const history = get().history;
    // 履歴を最大5件に制限
    const newHistory = history.length >= 5 ? [...history.slice(1), prev] : [...history, prev];
    set({ history: newHistory, program: [...prev, b] });

    // ブロック配置音を再生
    if (typeof window !== 'undefined') {
      import('../audio/sink').then(({ createWebAudioSink }) => {
        const audio = createWebAudioSink();
        audio.play('block_place');
      }).catch(() => {});
    }
  },
  addBlockToRepeat(repeatIndex, child) {
    const prev = get().program;
    const history = get().history;
    const newHistory = history.length >= 5 ? [...history.slice(1), prev] : [...history, prev];
    const newProgram = prev.map((block, idx) => {
      if (idx === repeatIndex && block.block === 'repeat_n') {
        return {
          ...block,
          children: [...(block.children || []), child],
        };
      }
      return block;
    });
    set({ history: newHistory, program: newProgram });

    // ブロック配置音を再生
    if (typeof window !== 'undefined') {
      import('../audio/sink').then(({ createWebAudioSink }) => {
        const audio = createWebAudioSink();
        audio.play('block_place');
      }).catch(() => {});
    }
  },
  moveBlock(fromIndex, toIndex) {
    const prev = get().program;
    const history = get().history;
    const newHistory = history.length >= 5 ? [...history.slice(1), prev] : [...history, prev];
    const newProgram = [...prev];
    const [movedBlock] = newProgram.splice(fromIndex, 1);
    newProgram.splice(toIndex, 0, movedBlock);
    set({ history: newHistory, program: newProgram });
  },
  removeBlock(index) {
    const prev = get().program;
    const history = get().history;
    const newHistory = history.length >= 5 ? [...history.slice(1), prev] : [...history, prev];
    const newProgram = prev.filter((_, i) => i !== index);
    set({ history: newHistory, program: newProgram });
  },
  removeLast() {
    const prev = get().program;
    const history = get().history;
    // 履歴を最大5件に制限
    const newHistory = history.length >= 5 ? [...history.slice(1), prev] : [...history, prev];
    set({ history: newHistory, program: prev.slice(0, -1) });
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
          // Add 200ms delay between steps for visibility
          const timeoutId = setTimeout(() => {
            const raf = requestAnimationFrame(tick);
            set({ _raf: raf });
          }, 200);
        } else {
          const cleared = s.pos.x === lesson.goal.x && s.pos.y === lesson.goal.y;
          if (cleared && audio) {
            // ゴール到達時の効果音
            audio.play('goal');
          }
          set({ isRunning: false, _raf: undefined, _runtime: undefined });
          resolve(cleared);
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
  startStepMode() {
    const lesson = get().lesson;
    if (!lesson) return;

    const program: Block[] = [{ block: 'when_flag' }, ...get().program.filter((b) => b.block !== 'when_flag')];

    // Create runtime with step mode (1 instruction per tick)
    import('../../core/engine/runtime').then(({ Runtime }) => {
      import('../audio/sink').then(({ createWebAudioSink }) => {
        import('../audio/store').then(({ useAudioStore }) => {
          const muted = useAudioStore.getState().muted;
          const audio = muted ? undefined : createWebAudioSink();
          const runtime = new Runtime({ goal: lesson.goal, maxInstructionsPerTick: 1, audio });
          runtime.load(program);
          set({
            _runtime: runtime,
            isStepMode: true,
            isPaused: true,
            currentStepIndex: 0,
            pos: { x: 1, y: 1 }
          });
        });
      });
    });
  },
  stepNext() {
    const runtime = get()._runtime;
    const lesson = get().lesson;
    if (!runtime || !lesson) return;

    runtime.step();
    const state = runtime.getState();
    set({
      pos: state.pos,
      currentStepIndex: get().currentStepIndex + 1,
      currentBlockIndex: state.currentBlockIndex
    });

    // Check if completed
    if (!state.running) {
      const cleared = state.pos.x === lesson.goal.x && state.pos.y === lesson.goal.y;
      if (cleared) {
        import('../audio/sink').then(({ createWebAudioSink }) => {
          const audio = createWebAudioSink();
          audio.play('goal');
        });
      }
      set({ isStepMode: false, _runtime: undefined, currentBlockIndex: undefined });
    }
  },
  stepPrevious() {
    // For simplicity, restart and replay to previous step
    const currentIndex = get().currentStepIndex;
    if (currentIndex <= 0) return;

    get().startStepMode();

    // Execute steps up to currentIndex - 1
    setTimeout(() => {
      for (let i = 0; i < currentIndex - 1; i++) {
        get().stepNext();
      }
    }, 100);
  },
  pauseStep() {
    set({ isPaused: true });
  },
  resumeStep() {
    set({ isPaused: false });
    // Continue stepping automatically
    const autoStep = () => {
      if (!get().isPaused && get().isStepMode) {
        get().stepNext();
        if (get().isStepMode) {
          setTimeout(autoStep, 500);
        }
      }
    };
    setTimeout(autoStep, 500);
  },
  stopStepMode() {
    const raf = get()._raf;
    if (raf) cancelAnimationFrame(raf);
    set({
      isStepMode: false,
      isPaused: false,
      currentStepIndex: 0,
      _runtime: undefined,
      pos: { x: 1, y: 1 }
    });
  },
}));
