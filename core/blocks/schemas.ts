import { z } from 'zod';

export const BlockId = z.enum([
  'when_flag',
  'move_right',
  'move_left',
  'move_up',
  'move_down',
  'repeat_n',
  'play_sound',
  'say',
  'if_touch_goal',
]);

export type BlockId = z.infer<typeof BlockId>;

export const BlockSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    block: BlockId,
    times: z.union([z.literal(1), z.literal(3), z.literal(5)]).optional(),
    n: z.union([z.literal(2), z.literal(3), z.literal(5)]).optional(),
    textId: z.string().optional(),
    children: z.array(BlockSchema).optional(),
  })
);

export const GoalSchema = z.object({
  type: z.literal('reach'),
  x: z.number().int().min(1).max(8),
  y: z.number().int().min(1).max(5),
});

export const AcceptSchema = z
  .object({
    maxBlocks: z.number().int().min(1).max(128),
    allowLinearSolution: z.boolean().optional(),
  })
  .optional();

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  goal: GoalSchema,
  toolbox: z.array(BlockId),
  hints: z.array(z.string()).min(1),
  starterCode: z.array(BlockSchema),
  accept: AcceptSchema,
  instruction: z.string().optional(), // ゴール地点の吹き出しメッセージ
});

export const CreationSchema = z.object({
  id: z.string(),
  title: z.string(),
  program: z.array(BlockSchema),
  createdAt: z.number().int(),
});

export const SaveDataSchema = z.object({
  profileId: z.string(),
  clearedLessonIds: z.array(z.string()),
  creations: z.array(CreationSchema),
});

export type Block = z.infer<typeof BlockSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type SaveData = z.infer<typeof SaveDataSchema>;

export type TelemetryEvent =
  | { type: 'lesson_start'; lessonId: string; ts: number }
  | { type: 'hint_tap'; lessonId: string; ts: number }
  | { type: 'run_pressed'; lessonId: string; ts: number }
  | { type: 'undo'; lessonId: string; ts: number }
  | { type: 'lesson_clear'; lessonId: string; durationSec: number };

export function checkBlockDepth(blocks: Block[], maxDepth: number = 3): boolean {
  const walk = (bs: Block[], d: number): boolean => {
    if (d > maxDepth) return false;
    for (const b of bs) {
      if (b.children && !walk(b.children, d + 1)) return false;
    }
    return true;
  };
  return walk(blocks, 1);
}

