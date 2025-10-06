import L1_01_go_right from './L1_01_go_right.json';
import L1_02_box_move from './L1_02_box_move.json';
import L1_03_sound_move from './L1_03_sound_move.json';
import L1_04_shortest from './L1_04_shortest.json';
import L1_05_zigzag from './L1_05_zigzag.json';
import L1_06_L_shape from './L1_06_L_shape.json';
import L1_07_around from './L1_07_around.json';
import L1_08_cross from './L1_08_cross.json';
import L2_01_walk_repeat from './L2_01_walk_repeat.json';
import L2_02_walk_five from './L2_02_walk_five.json';
import L2_03_step_dance from './L2_03_step_dance.json';
import L2_04_ladder_climb from './L2_04_ladder_climb.json';
import L2_05_repeat_mix from './L2_05_repeat_mix.json';
import L2_06_spiral from './L2_06_spiral.json';
import L2_07_big_square from './L2_07_big_square.json';
import L2_08_mountain from './L2_08_mountain.json';
import L3_01_when_flag from './L3_01_when_flag.json';
import L3_02_touch_escape from './L3_02_touch_escape.json';
import L3_03_hit_return from './L3_03_hit_return.json';
import L3_04_treasure_open from './L3_04_treasure_open.json';
import L3_05_flag_double from './L3_05_flag_double.json';
import L3_06_flag_pattern from './L3_06_flag_pattern.json';
import L3_07_sound_flag from './L3_07_sound_flag.json';
import L3_08_repeat_flag from './L3_08_repeat_flag.json';
import L4_01_my_dance from './L4_01_my_dance.json';
import L4_02_mini_game from './L4_02_mini_game.json';
import L4_03_maze from './L4_03_maze.json';
import L4_04_art from './L4_04_art.json';
import L4_05_story from './L4_05_story.json';
import L4_06_challenge from './L4_06_challenge.json';
import type { Lesson } from '../../core/blocks/schemas';

export const lessons: Lesson[] = [
  L1_01_go_right as Lesson,
  L1_02_box_move as Lesson,
  L1_03_sound_move as Lesson,
  L1_04_shortest as Lesson,
  L1_05_zigzag as Lesson,
  L1_06_L_shape as Lesson,
  L1_07_around as Lesson,
  L1_08_cross as Lesson,
  L2_01_walk_repeat as Lesson,
  L2_02_walk_five as Lesson,
  L2_03_step_dance as Lesson,
  L2_04_ladder_climb as Lesson,
  L2_05_repeat_mix as Lesson,
  L2_06_spiral as Lesson,
  L2_07_big_square as Lesson,
  L2_08_mountain as Lesson,
  L3_01_when_flag as Lesson,
  L3_02_touch_escape as Lesson,
  L3_03_hit_return as Lesson,
  L3_04_treasure_open as Lesson,
  L3_05_flag_double as Lesson,
  L3_06_flag_pattern as Lesson,
  L3_07_sound_flag as Lesson,
  L3_08_repeat_flag as Lesson,
  L4_01_my_dance as Lesson,
  L4_02_mini_game as Lesson,
  L4_03_maze as Lesson,
  L4_04_art as Lesson,
  L4_05_story as Lesson,
  L4_06_challenge as Lesson,
];

export const lessonMap: Record<string, Lesson> = Object.fromEntries(
  lessons.map((l) => [l.id, l])
);
