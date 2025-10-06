# 14_Lesson_Authoring_Pipeline.md — レッスン量産の道筋（Codex運用指針・雛形込み）

> 目的：**人手で個別に書かず**、Codexに「安全・一貫・短時間」でレッスンJSONを量産させるための**手順・評価・自動検証**を定義。

## A. レッスンの型（テンプレ）
### A-1. 学習目的タグ
- `tags.stage`: `L1|L2|L3|L4`
- `tags.concepts`: `sequence` / `repeat` / `event` / `decomposition` / `debug`
- `tags.skill`: `motor-drag`（ドラッグ練習）/ `planning` / `timing`
- `tags.fun`: `maze` / `dance` / `collect` / `avoid` / `music`

### A-2. JSONテンプレ
```json
{
  "id": "L{stage}_{nn}_{slug}",
  "title": "",
  "tags": {"stage":"L1","concepts":["sequence"],"skill":["planning"],"fun":["maze"]},
  "goal": {"type":"reach","x":5,"y":1},
  "toolbox": ["when_flag","move_right","move_left","play_sound"],
  "hints": [""],
  "starterCode": [{"block":"when_flag"}],
  "accept": {"maxBlocks": 10, "allowLinearSolution": true, "requiredBlocks": []},
  "grid": {"w":10, "h":6, "walls": [[3,1],[3,2]], "spawn": [0,1], "goal":[5,1]}
}
```
- **必須**: `id,title,tags,goal,toolbox,hints,starterCode,accept`
- **任意**: `grid`（迷路など空間系課題に利用）
- **制約**: `toolbox`はBlockSpecのIDのみ／`hints`は**ひらがな短文**／数値はプリセット（1/2/3/5）

## B. 難易度設計（自動判定可能な指標）
- **D0（体験）**：`maxBlocks ≥ 12`、toolbox ≤ 3種、解は直線で達成
- **D1（基礎）**：`maxBlocks ≤ 10`、軽い分岐（壁1枚）
- **D2（効率）**：線形で可能だが**repeat推奨**、`requiredBlocks:["repeat_n"]`
- **D3（統合）**：イベント＋ループの組合せ、`toolbox`にイベント1種

## C. 生成ワークフロー（Codex手順）
1. **ブリーフ入力**（人間）：「L2 / くりかえし / collect / 5分課題 / ひらがなヒント1行」
2. **候補生成**（Codex）: 下記`G-Prompt`で**3案**生成（JSON）
3. **自動Lint**（スクリプト）: スキーマ・BlockID・値域を検証
4. **自己レビュー**（Codex）: `S-Checklist`で**改善案の差分JSON**を返す
5. **スモーク実行**（エンジン）: ゴール到達可能性チェッカ（簡易）
6. **採用**: 1案採用→`content/lessons/`に保存、`LessonList`に追加

## D. プロンプト雛形
### D-1. G-Prompt（レッスン生成）
```
あなたは小1向けプログラミング教材のレベルデザイナーです。次の制約を厳守して、
MVP仕様（BlockSpec/カリキュラム）に合致する**JSONレッスン**を3案提案してください。

【入力ブリーフ】
- ステージ: {stage}
- 概念: {concepts}
- 楽しさ: {fun}
- 難易度: {difficulty}
- 所要時間: 5–10分

【厳守ルール】
- BlockSpecのIDのみ使用。数値は 1/2/3/5。
- ひらがな短文。外字・漢字を避ける。
- `starterCode`に`when_flag`を含める。
- `hints`は1–2行、ネガティブ表現禁止。
- JSONのみ出力。前後説明なし。
```

### D-2. S-Checklist（自己レビュー）
```
次のJSONレッスンを、MVPの受入基準と難易度規定で**検査**し、
必要なら**最小差分**だけを適用した修正版JSONを返してください。
- 5タップ以内に実行ボタンへ到達可能？
- 直線解でクリア不可にしていないか（ステージに応じて）？
- `toolbox`が多すぎないか（3–5内）？
- `hints`がひらがな短文か？
- `requiredBlocks`指定が過剰でないか？
- ゴール座標・壁配置に矛盾は？
**出力：修正版JSONのみ**
```

## E. 自動Lint & 迅速チェック（TypeScript）
```ts
import { z } from "zod";
const BlockId = z.enum([
  "when_flag","move_right","move_left","move_up","move_down",
  "repeat_n","play_sound","say","if_touch_goal"
]);
const LessonSchema = z.object({
  id: z.string().regex(/^L[1-4]_[0-9]{1,2}_[a-z0-9_]+$/),
  title: z.string().min(1),
  tags: z.object({
    stage: z.enum(["L1","L2","L3","L4"]),
    concepts: z.array(z.enum(["sequence","repeat","event","decomposition","debug"])) ,
    skill: z.array(z.enum(["motor-drag","planning","timing"])) ,
    fun: z.array(z.enum(["maze","dance","collect","avoid","music"]))
  }),
  goal: z.object({ type:z.enum(["reach"]), x:z.number().int().min(0), y:z.number().int().min(0) }),
  toolbox: z.array(BlockId).min(2).max(6),
  hints: z.array(z.string()).min(1).max(2),
  starterCode: z.array(z.any()).min(1),
  accept: z.object({
    maxBlocks: z.number().int().min(5).max(20),
    allowLinearSolution: z.boolean().optional(),
    requiredBlocks: z.array(BlockId).optional()
  }),
  grid: z.object({
    w:z.number().int().min(6).max(16), h:z.number().int().min(4).max(12),
    walls:z.array(z.tuple([z.number().int(),z.number().int()])).optional(),
    spawn:z.tuple([z.number().int(),z.number().int()]).optional(),
    goal:z.tuple([z.number().int(),z.number().int()]).optional()
  }).optional()
});

export const lintLesson = (json:unknown) => {
  const p = LessonSchema.safeParse(json);
  if(!p.success) return { ok:false, errors: p.error.issues.map(i=>i.message) };
  const L = p.data;
  // 追加規則：数値はプリセット
  const checkPreset = (b:any):boolean => {
    if(!b) return true; const ok = [1,2,3,5];
    if(typeof b.times!=="undefined" && !ok.includes(b.times)) return false;
    if(typeof b.n!=="undefined" && !ok.includes(b.n)) return false;
    return (b.children||[]).every(checkPreset);
  };
  if(!(L.starterCode||[]).every(checkPreset)) return { ok:false, errors:["数値は1/2/3/5のみ"] };
  return { ok:true, errors:[] };
};
```

## F. スモーク実行チェッカ（到達可能性の近似）
- 直線探索（右・左・上・下）を **max 20手**で幅優先。
- `toolbox`に存在する移動のみで`goal`まで到達可かを判定。
- 直線で到達できるかのフラグ→難易度D2以上のときは**true**だと要再検討。

## G. 具体例（種レッスンの「ブリーフ」だけを用意）
- **例1（L1/sequence/maze/D1）**：「まっすぐ すすんで ゴール」（壁1枚、直線解あり）
- **例2（L2/repeat/collect/D2）**：「くだものを 3つ あつめよう」（repeat必須）
- **例3（L3/event/avoid/D3）**：「おばけに ふれたら にげる」（イベント＋移動）
→ これらの**ブリーフ**をG-Promptへ与え、3案→Lint→自己レビュー→採用、の運用。

## H. 品質ゲート（人間レビュー最小チェック）
- ひらがなチェック（漢字混入なし）
- ヒントが**行動**を促す文になっている（×抽象的助言）
- 1画面内で完結（スクロール不要）

## I. 保存とバージョニング
- 採用したJSONに`version`（例：`1`）を付与
- 既存IDの修正は`revision`を++し履歴保存（`L2_1_walk_repeat@r2.json`）

## J. Codexワークフローテキスト（短縮版）
```
[Step1] Briefを与える
[Step2] G-Promptで3案JSON生成
[Step3] lintLesson()に通す→NGなら再生成
[Step4] S-Checklistで自己レビュー→修正版へ
[Step5] 到達スモーク→OKなら採用
[Step6] content/lessons/ に配置
```

---

## K. 実装に向けた追補（Implementation-Ready）

- 命名規則/配置:
  - `content/lessons/L{stage}_{nn}_{slug}.json` 例: `L1_01_go_right.json`
  - `id`は拡張子なしの同名。タイトルはひらがな短文。
- 追加Lint（実装）:
  - toolboxにないBlockをstarterCodeが使っていないか
  - ネスト深さ≤3・ブロック総数≤128・hints 1–2行
  - `when_flag`が先頭に最低1つ存在
- 執筆S-Checklist:
  1) 目標/到達点一文化 2) ゴール座標設定 3) toolbox最小化 4) starterCode線形解 5) ヒント2本 6) accept設定 7) lint & スモーク
- DoD（レッスン単位）:
  - 線形解/短縮解の双方でスモーク到達  - `LessonSchema`準拠  - ヒントが行動指示である
