"use client";
import { create } from 'zustand';
import type { SaveData } from '../../core/blocks/schemas';
import { DEFAULT_PROFILE, getOrCreateDefault, markLessonCleared } from '../../core/infra/save';

type SaveState = {
  profileId: string;
  data?: SaveData;
  loading: boolean;
  load: () => Promise<void>;
  clearIds: string[];
  markCleared: (lessonId: string) => Promise<void>;
};

export const useSaveStore = create<SaveState>()((set, get) => ({
  profileId: DEFAULT_PROFILE,
  data: undefined,
  loading: false,
  clearIds: [],
  async load() {
    set({ loading: true });
    try {
      const data = await getOrCreateDefault();
      set({ data, clearIds: data.clearedLessonIds, loading: false });
    } catch (e) {
      set({ loading: false });
    }
  },
  async markCleared(lessonId) {
    const updated = await markLessonCleared(lessonId);
    set({ data: updated, clearIds: updated.clearedLessonIds });

    // バッジチェック
    if (typeof window !== 'undefined') {
      import('../badges/checker').then(({ checkBadges }) => {
        checkBadges(updated.clearedLessonIds);
      }).catch(() => {});
    }
  },
}));

