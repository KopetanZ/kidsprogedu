"use client";
import { create } from 'zustand';
import type { TelemetryEvent } from '../../core/blocks/schemas';

type TelemetryState = {
  events: TelemetryEvent[];
  lessonStartTs?: number;
  record: (e: TelemetryEvent) => void;
  startLesson: (lessonId: string) => void;
  runPressed: (lessonId: string) => void;
  hintTap: (lessonId: string) => void;
  clearLesson: (lessonId: string) => void;
};

export const useTelemetry = create<TelemetryState>()((set, get) => ({
  events: [],
  record(e) { set({ events: [...get().events, e] }); },
  startLesson(lessonId) {
    const ts = Date.now();
    set({ lessonStartTs: ts });
    get().record({ type: 'lesson_start', lessonId, ts });
  },
  runPressed(lessonId) { get().record({ type: 'run_pressed', lessonId, ts: Date.now() }); },
  hintTap(lessonId) { get().record({ type: 'hint_tap', lessonId, ts: Date.now() }); },
  clearLesson(lessonId) {
    const start = get().lessonStartTs ?? Date.now();
    const durationSec = Math.round((Date.now() - start) / 1000);
    get().record({ type: 'lesson_clear', lessonId, durationSec });
  },
}));
