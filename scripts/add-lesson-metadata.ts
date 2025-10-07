#!/usr/bin/env tsx
/**
 * 既存のレッスンファイルにtype/skills/difficultyを追加するスクリプト
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

const lessonsDir = join(process.cwd(), 'content', 'lessons');
const lessonFiles = globSync('*.json', { cwd: lessonsDir });

// レッスンIDに基づいてメタデータを推定
function inferMetadata(id: string, lesson: any) {
  const metadata: any = {
    type: 'drill', // 全て現状はドリル
  };

  // レベルに基づいて難易度を設定
  if (id.startsWith('L1')) {
    metadata.difficulty = 1;
  } else if (id.startsWith('L2')) {
    metadata.difficulty = 2;
  } else if (id.startsWith('L3')) {
    metadata.difficulty = 3;
  } else if (id.startsWith('L4')) {
    metadata.difficulty = 4;
  } else {
    metadata.difficulty = 1;
  }

  // toolboxからスキルを推定
  const toolbox = lesson.toolbox || [];
  const skills: string[] = ['sequence']; // 全てに逐次実行は含まれる

  if (toolbox.includes('repeat_n')) {
    skills.push('loop');
  }
  if (toolbox.includes('if_touch_goal')) {
    skills.push('condition');
  }
  if (toolbox.includes('play_sound')) {
    if (!skills.includes('event')) {
      // 音はイベント扱い
    }
  }

  // 重複削除
  metadata.skills = [...new Set(skills)];

  // 想定時間（レベルに応じて）
  if (metadata.difficulty === 1) {
    metadata.estimatedTimeMin = 3;
  } else if (metadata.difficulty === 2) {
    metadata.estimatedTimeMin = 5;
  } else if (metadata.difficulty === 3) {
    metadata.estimatedTimeMin = 8;
  } else {
    metadata.estimatedTimeMin = 10;
  }

  return metadata;
}

let updatedCount = 0;

for (const file of lessonFiles) {
  const filePath = join(lessonsDir, file);
  const content = readFileSync(filePath, 'utf-8');
  const lesson = JSON.parse(content);

  // 既にtype/skills/difficultyがある場合はスキップ
  if (lesson.type && lesson.skills && lesson.difficulty) {
    continue;
  }

  const metadata = inferMetadata(lesson.id, lesson);

  // 新しいフィールドを追加（順序を保つために手動で構築）
  const updated = {
    id: lesson.id,
    title: lesson.title,
    ...metadata,
    goal: lesson.goal,
    toolbox: lesson.toolbox,
    hints: lesson.hints,
    starterCode: lesson.starterCode,
    accept: lesson.accept,
    ...(lesson.instruction ? { instruction: lesson.instruction } : {}),
  };

  // ファイルに書き戻し
  writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  console.log(`✓ ${file} updated`);
  updatedCount++;
}

console.log(`\n✅ Updated ${updatedCount} lesson files`);
