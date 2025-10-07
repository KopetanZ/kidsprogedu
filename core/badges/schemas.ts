import { z } from 'zod';

// バッジID
export const BadgeId = z.enum([
  'first_lesson',
  'level1_complete',
  'level2_complete',
  'level3_complete',
  'level4_complete',
  'lessons_10',
  'lessons_20',
  'lessons_30',
  'all_complete',
  'perfect_5',
  'speed_runner',
]);

export type BadgeId = z.infer<typeof BadgeId>;

// バッジデータ
export const BadgeSchema = z.object({
  id: BadgeId,
  title: z.string(),
  description: z.string(),
  emoji: z.string(),
  color: z.string(),
});

export type Badge = z.infer<typeof BadgeSchema>;

// バッジ定義
export const BADGES: Badge[] = [
  {
    id: 'first_lesson',
    title: 'はじめの いっぽ',
    description: 'さいしょの レッスンを クリア！',
    emoji: '🌟',
    color: '#FFD700',
  },
  {
    id: 'level1_complete',
    title: 'レベル1 マスター',
    description: 'レベル1の すべての レッスンを クリア！',
    emoji: '🎯',
    color: '#4F8EF7',
  },
  {
    id: 'level2_complete',
    title: 'レベル2 マスター',
    description: 'レベル2の すべての レッスンを クリア！',
    emoji: '🔥',
    color: '#FF9800',
  },
  {
    id: 'level3_complete',
    title: 'レベル3 マスター',
    description: 'レベル3の すべての レッスンを クリア！',
    emoji: '💎',
    color: '#9C27B0',
  },
  {
    id: 'level4_complete',
    title: 'レベル4 マスター',
    description: 'レベル4の すべての レッスンを クリア！',
    emoji: '👑',
    color: '#4CAF50',
  },
  {
    id: 'lessons_10',
    title: '10レッスン クリア',
    description: '10この レッスンを クリアしたよ！',
    emoji: '⭐',
    color: '#FFC107',
  },
  {
    id: 'lessons_20',
    title: '20レッスン クリア',
    description: '20この レッスンを クリアしたよ！',
    emoji: '✨',
    color: '#FF5722',
  },
  {
    id: 'lessons_30',
    title: '30レッスン クリア',
    description: '30この レッスンを クリアしたよ！',
    emoji: '🌈',
    color: '#E91E63',
  },
  {
    id: 'all_complete',
    title: 'かんぺき マスター',
    description: 'すべての レッスンを クリアしたよ！すごい！',
    emoji: '🏆',
    color: '#FFD700',
  },
  {
    id: 'perfect_5',
    title: 'パーフェクト！',
    description: '5つの レッスンを ヒントなしで クリア！',
    emoji: '💯',
    color: '#00BCD4',
  },
  {
    id: 'speed_runner',
    title: 'スピード ランナー',
    description: '3つの レッスンを すばやく クリア！',
    emoji: '⚡',
    color: '#FFEB3B',
  },
];
