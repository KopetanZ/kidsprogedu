# 06_DataAPI.md — データ & API仕様（初版）

## ローカル保存（MVP）
- `SaveData` を IndexedDB に保存。スナップショットは自動。

```ts
type Block = { block:string; times?:number; n?:number; textId?:string; children?:Block[] };
export type Lesson = {
  id:string; title:string; goal:Goal; toolbox:string[]; hints:string[]; starterCode:Block[]; accept?:Accept;
};
export type SaveData = {
  profileId:string; clearedLessonIds:string[]; creations: Creation[];
};
export type Creation = { id:string; title:string; program: Block[]; createdAt:number };
```

## テレメトリ（匿名・オプトイン）
```ts
type TelemetryEvent =
 | { type:"lesson_start"; lessonId:string; ts:number }
 | { type:"hint_tap"; lessonId:string; ts:number }
 | { type:"lesson_clear"; lessonId:string; durationSec:number };
```

## 将来API（雛形のみ）
- `POST /v1/save` / `GET /v1/save`（Bearer不要、MVPでは未使用）
- スキーマはSaveData準拠

---

## 実装に向けた追補（Implementation-Ready）

- 厳密型 & Zod スキーマ（抜粋）:
```ts
import { z } from 'zod';

export const BlockId = z.enum(['when_flag','move_right','move_left','move_up','move_down','repeat_n','play_sound','say','if_touch_goal']);
export const BlockSchema = z.lazy(() => z.object({
  block: BlockId,
  times: z.union([z.literal(1),z.literal(3),z.literal(5)]).optional(),
  n: z.union([z.literal(2),z.literal(3),z.literal(5)]).optional(),
  textId: z.string().optional(),
  children: z.array(BlockSchema).optional(),
}));

export const GoalSchema = z.object({ type: z.literal('reach'), x: z.number().int().min(1).max(8), y: z.number().int().min(1).max(5) });
export const AcceptSchema = z.object({ maxBlocks: z.number().int().min(1).max(128), allowLinearSolution: z.boolean().optional() }).optional();

export const LessonSchema = z.object({
  id: z.string(), title: z.string(), goal: GoalSchema,
  toolbox: z.array(BlockId), hints: z.array(z.string()).min(1),
  starterCode: z.array(BlockSchema), accept: AcceptSchema
});

export const CreationSchema = z.object({ id: z.string(), title: z.string(), program: z.array(BlockSchema), createdAt: z.number().int() });
export const SaveDataSchema = z.object({ profileId: z.string(), clearedLessonIds: z.array(z.string()), creations: z.array(CreationSchema) });

export type Block = z.infer<typeof BlockSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type SaveData = z.infer<typeof SaveDataSchema>;
```

- IndexedDB 設計:
  - DB: `kidsprogedu@v1`。Object stores: `saveData`(keyPath:`profileId`), `telemetry`(auto-increment)。
  - スナップショット頻度: 変更検知（プログラム変更/クリア時）後に5秒デバウンスで保存。
  - マイグレーション: バージョン+1で`onupgradeneeded`にてスキーマ更新。

- リポジトリAPI（同期版インタフェース案）:
```ts
interface SaveRepo { get(profileId: string): Promise<SaveData|undefined>; put(data: SaveData): Promise<void>; clearAll(): Promise<void>; }
interface TelemetryRepo { enqueue(ev: TelemetryEvent): Promise<void>; all(): Promise<TelemetryEvent[]>; clear(): Promise<void>; }
```

- テレメトリ拡張（ローカルのみ保存）:
  - 追加イベント: `{ type:'run_pressed', lessonId, ts }`, `{ type:'undo', lessonId, ts }`。
  - 送信は未実装（MVP）。`all()`でエクスポート可能にして検証に活用。
