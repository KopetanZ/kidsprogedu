import { describe, it, expect } from 'vitest';
import { LessonSchema } from '../core/blocks/schemas';

describe('LessonSchema', () => {
  it('accepts a minimal valid lesson', () => {
    const lesson = {
      id: 'L1_01_go_right',
      title: 'みぎへ いこう',
      goal: { type: 'reach', x: 4, y: 1 },
      toolbox: ['when_flag', 'move_right', 'play_sound'],
      hints: ['みぎの ぶろっくを 3こ おいて ためしてみよう'],
      starterCode: [{ block: 'when_flag' }],
      accept: { maxBlocks: 8, allowLinearSolution: true },
    };
    const p = LessonSchema.safeParse(lesson);
    expect(p.success).toBe(true);
  });

  it('rejects invalid times', () => {
    const bad = {
      id: 'L1_bad',
      title: 'bad',
      goal: { type: 'reach', x: 1, y: 1 },
      toolbox: ['when_flag', 'move_right'],
      hints: ['h'],
      starterCode: [{ block: 'when_flag' }, { block: 'move_right', times: 2 }],
      accept: { maxBlocks: 8 },
    };
    const p = LessonSchema.safeParse(bad);
    expect(p.success).toBe(false);
  });
});

