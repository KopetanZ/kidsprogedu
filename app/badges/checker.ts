"use client";
import { useBadgeStore } from './store';
import { lessons } from '../../content/lessons';

// バッジ獲得条件をチェック
export function checkBadges(clearedLessonIds: string[]) {
  const { earnBadge, perfectCount, speedCount } = useBadgeStore.getState();
  const clearedCount = clearedLessonIds.length;

  // 最初のレッスン
  if (clearedCount === 1) {
    earnBadge('first_lesson');
  }

  // レッスン数マイルストーン
  if (clearedCount >= 10) {
    earnBadge('lessons_10');
  }
  if (clearedCount >= 20) {
    earnBadge('lessons_20');
  }
  if (clearedCount >= 30) {
    earnBadge('lessons_30');
  }

  // 全レッスンクリア
  if (clearedCount >= lessons.length) {
    earnBadge('all_complete');
  }

  // レベル別完了チェック
  const getLevel = (id: string) => {
    if (id.startsWith('L1')) return 1;
    if (id.startsWith('L2')) return 2;
    if (id.startsWith('L3')) return 3;
    if (id.startsWith('L4')) return 4;
    return 1;
  };

  const level1Lessons = lessons.filter(l => getLevel(l.id) === 1);
  const level2Lessons = lessons.filter(l => getLevel(l.id) === 2);
  const level3Lessons = lessons.filter(l => getLevel(l.id) === 3);
  const level4Lessons = lessons.filter(l => getLevel(l.id) === 4);

  if (level1Lessons.every(l => clearedLessonIds.includes(l.id))) {
    earnBadge('level1_complete');
  }
  if (level2Lessons.every(l => clearedLessonIds.includes(l.id))) {
    earnBadge('level2_complete');
  }
  if (level3Lessons.every(l => clearedLessonIds.includes(l.id))) {
    earnBadge('level3_complete');
  }
  if (level4Lessons.every(l => clearedLessonIds.includes(l.id))) {
    earnBadge('level4_complete');
  }

  // パーフェクトバッジ（ヒントなし5回）
  if (perfectCount >= 5) {
    earnBadge('perfect_5');
  }

  // スピードランナーバッジ（素早くクリア3回）
  if (speedCount >= 3) {
    earnBadge('speed_runner');
  }
}
