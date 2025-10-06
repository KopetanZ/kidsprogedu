import L1_01_go_right from './L1_01_go_right.json';
import L1_02_box_move from './L1_02_box_move.json';
import L2_01_walk_repeat from './L2_01_walk_repeat.json';
import L2_02_walk_five from './L2_02_walk_five.json';
import L2_03_step_dance from './L2_03_step_dance.json';
import L3_01_when_flag from './L3_01_when_flag.json';
import L1_03_sound_move from './L1_03_sound_move.json';
import L1_04_shortest from './L1_04_shortest.json';
import type { Lesson } from '../../core/blocks/schemas';

export const lessons: Lesson[] = [
  L1_01_go_right as Lesson,
  L1_02_box_move as Lesson,
  L1_03_sound_move as Lesson,
  L1_04_shortest as Lesson,
  L2_01_walk_repeat as Lesson,
  L2_02_walk_five as Lesson,
  L2_03_step_dance as Lesson,
  L3_01_when_flag as Lesson,
];

export const lessonMap: Record<string, Lesson> = Object.fromEntries(
  lessons.map((l) => [l.id, l])
);
