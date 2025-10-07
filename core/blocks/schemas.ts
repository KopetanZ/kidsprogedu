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
  'set_var',      // 変数を設定
  'change_var',   // 変数を変更
  'repeat_var',   // 変数で繰り返し
]);

export type BlockId = z.infer<typeof BlockId>;

export const BlockSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    block: BlockId,
    times: z.union([z.literal(1), z.literal(3), z.literal(5)]).optional(),
    n: z.union([z.literal(2), z.literal(3), z.literal(5)]).optional(),
    textId: z.string().optional(),
    children: z.array(BlockSchema).optional(),
    // 変数関連
    varName: z.string().optional(), // 変数名
    varValue: z.number().optional(), // 変数の値
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
    requiredBlocks: z.array(BlockId).optional(), // 必須ブロック
  })
  .optional();

// レッスンタイプ
export const LessonTypeEnum = z.enum(['drill', 'parsons', 'debug', 'challenge', 'project']);
export type LessonType = z.infer<typeof LessonTypeEnum>;

// スキル定義
export const SkillEnum = z.enum(['sequence', 'loop', 'condition', 'variable', 'function', 'event']);
export type Skill = z.infer<typeof SkillEnum>;

// サブゴール
export const SubgoalSchema = z.object({
  id: z.string(),
  label: z.string(),
});
export type Subgoal = z.infer<typeof SubgoalSchema>;

// Parsonsモード用のスキーマ
export const ParsonsDataSchema = z.object({
  fragments: z.array(BlockSchema), // 正しいブロック断片
  distractors: z.array(BlockSchema).default([]), // 誤りブロック（気をそらすもの）
  correctOrder: z.array(z.number().int()), // 正解の順序（インデックス配列）
});
export type ParsonsData = z.infer<typeof ParsonsDataSchema>;

// Debugモード用のスキーマ
export const DebugDataSchema = z.object({
  buggyCode: z.array(BlockSchema), // バグのあるコード
  bugType: z.string(), // バグの種類（off-by-one, wrong-condition等）
  bugDescription: z.string(), // バグの説明
  hints: z.array(z.string()).default([]), // デバッグ用のヒント
});
export type DebugData = z.infer<typeof DebugDataSchema>;

// Challengeモード用のスキーマ
export const ChallengeDataSchema = z.object({
  constraints: z.object({
    maxBlocks: z.number().int().min(1).optional(), // 最大ブロック数
    maxOfType: z.record(z.string(), z.number().int().min(0)).optional(), // ブロック種別ごとの上限
    bannedBlocks: z.array(BlockId).default([]), // 使用禁止ブロック
    requiredBlocks: z.array(BlockId).default([]), // 必須ブロック
  }),
  challengeDescription: z.string(), // チャレンジの説明
  rewards: z.object({
    badge: z.string().optional(), // 獲得バッジID
    xp: z.number().int().min(0).default(0), // 獲得XP
  }).optional(),
});
export type ChallengeData = z.infer<typeof ChallengeDataSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: LessonTypeEnum.default('drill'), // デフォルトはドリル
  skills: z.array(SkillEnum).default(['sequence']), // デフォルトは逐次実行
  difficulty: z.number().int().min(1).max(5).default(1), // 難易度1-5
  estimatedTimeMin: z.number().int().min(1).max(60).optional(), // 想定時間
  prerequisites: z.array(z.string()).default([]), // 前提レッスン
  subgoals: z.array(SubgoalSchema).default([]), // サブゴール
  goal: GoalSchema,
  toolbox: z.array(BlockId),
  hints: z.array(z.string()).min(1),
  starterCode: z.array(BlockSchema),
  accept: AcceptSchema,
  instruction: z.string().optional(), // ゴール地点の吹き出しメッセージ
  parsons: ParsonsDataSchema.optional(), // Parsonsモード用データ
  debug: DebugDataSchema.optional(), // Debugモード用データ
  challenge: ChallengeDataSchema.optional(), // Challengeモード用データ
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

