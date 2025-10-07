"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BadgeId } from '../../core/badges/schemas';

type BadgeStore = {
  earnedBadges: BadgeId[];
  newBadges: BadgeId[];
  perfectCount: number;
  speedCount: number;
  earnBadge: (badgeId: BadgeId) => void;
  clearNewBadges: () => void;
  incrementPerfect: () => void;
  incrementSpeed: () => void;
};

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      earnedBadges: [],
      newBadges: [],
      perfectCount: 0,
      speedCount: 0,
      earnBadge(badgeId) {
        const earned = get().earnedBadges;
        if (!earned.includes(badgeId)) {
          set({
            earnedBadges: [...earned, badgeId],
            newBadges: [...get().newBadges, badgeId],
          });
        }
      },
      clearNewBadges() {
        set({ newBadges: [] });
      },
      incrementPerfect() {
        set({ perfectCount: get().perfectCount + 1 });
      },
      incrementSpeed() {
        set({ speedCount: get().speedCount + 1 });
      },
    }),
    {
      name: 'badge-storage',
    }
  )
);
