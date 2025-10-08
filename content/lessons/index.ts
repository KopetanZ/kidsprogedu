import L1_01_go_right from './L1_01_go_right.json';
import L1_02_box_move from './L1_02_box_move.json';
import L1_03_sound_move from './L1_03_sound_move.json';
import L1_04_shortest from './L1_04_shortest.json';
import L1_05_zigzag from './L1_05_zigzag.json';
import L1_06_L_shape from './L1_06_L_shape.json';
import L1_07_around from './L1_07_around.json';
import L1_08_cross from './L1_08_cross.json';
import L1_09_long_path from './L1_09_long_path.json';
import L1_10_find_pattern from './L1_10_find_pattern.json';
import L2_01_walk_repeat from './L2_01_walk_repeat.json';
import L2_02_walk_five from './L2_02_walk_five.json';
import L2_03_step_dance from './L2_03_step_dance.json';
import L2_04_ladder_climb from './L2_04_ladder_climb.json';
import L2_05_repeat_mix from './L2_05_repeat_mix.json';
import L2_06_spiral from './L2_06_spiral.json';
import L2_07_big_square from './L2_07_big_square.json';
import L2_08_mountain from './L2_08_mountain.json';
import L2_09_complete_dance from './L2_09_complete_dance.json';
import L2_10_debug_repeat from './L2_10_debug_repeat.json';
import L2_11_nest_intro from './L2_11_nest_intro.json';
import L2_12_double_loop from './L2_12_double_loop.json';
import L3_01_when_flag from './L3_01_when_flag.json';
import L3_02_touch_escape from './L3_02_touch_escape.json';
import L3_03_hit_return from './L3_03_hit_return.json';
import L3_04_treasure_open from './L3_04_treasure_open.json';
import L3_05_flag_double from './L3_05_flag_double.json';
import L3_06_flag_pattern from './L3_06_flag_pattern.json';
import L3_07_sound_flag from './L3_07_sound_flag.json';
import L3_08_repeat_flag from './L3_08_repeat_flag.json';
import L3_09_reach_goal from './L3_09_reach_goal.json';
import L3_10_debug_event from './L3_10_debug_event.json';
import L3_11_use_everything from './L3_11_use_everything.json';
import L3_12_hard_challenge from './L3_12_hard_challenge.json';
import L4_01_my_dance from './L4_01_my_dance.json';
import L4_02_mini_game from './L4_02_mini_game.json';
import L4_03_maze from './L4_03_maze.json';
import L4_04_art from './L4_04_art.json';
import L4_05_story from './L4_05_story.json';
import L4_06_challenge from './L4_06_challenge.json';
import L4_07_complex_work from './L4_07_complex_work.json';
import L4_08_final_challenge from './L4_08_final_challenge.json';
import type { Lesson } from '../../core/blocks/schemas';

// Cast the entire array via unknown to avoid literal-to-type compatibility errors.
// JSON is validated against LessonSchema separately (see schema:check).
export const lessons = [
  L1_01_go_right,
  L1_02_box_move,
  L1_03_sound_move,
  L1_04_shortest,
  L1_05_zigzag,
  L1_06_L_shape,
  L1_07_around,
  L1_08_cross,
  L1_09_long_path,
  L1_10_find_pattern,
  L2_01_walk_repeat,
  L2_02_walk_five,
  L2_03_step_dance,
  L2_04_ladder_climb,
  L2_05_repeat_mix,
  L2_06_spiral,
  L2_07_big_square,
  L2_08_mountain,
  L2_09_complete_dance,
  L2_10_debug_repeat,
  L2_11_nest_intro,
  L2_12_double_loop,
  L3_01_when_flag,
  L3_02_touch_escape,
  L3_03_hit_return,
  L3_04_treasure_open,
  L3_05_flag_double,
  L3_06_flag_pattern,
  L3_07_sound_flag,
  L3_08_repeat_flag,
  L3_09_reach_goal,
  L3_10_debug_event,
  L3_11_use_everything,
  L3_12_hard_challenge,
  L4_01_my_dance,
  L4_02_mini_game,
  L4_03_maze,
  L4_04_art,
  L4_05_story,
  L4_06_challenge,
  L4_07_complex_work,
  L4_08_final_challenge,
] as unknown as Lesson[];

export const lessonMap: Record<string, Lesson> = Object.fromEntries(
  lessons.map((l) => [l.id, l])
);
