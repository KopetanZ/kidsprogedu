# 改良仕様書（v1）

本書は「proposal.md」に基づき、競合調査と最新のプログラミング教育動向を踏まえた改良方針と具体仕様をまとめたものです。実装は既存リポジトリ構成（app/core/content/test/scripts/docs）とインポート境界（core → app）を遵守します。

## 1. 背景と目的
- 目的: 現行のドリル中心の学習体験を、理解深化・転移・創造へ拡張する。
- 目標: 学習継続率、理解度、自己効力感を高め、学校/家庭双方で使いやすい製品にする。
- 対象: 小学校中学年〜中学生（保護者・教員も二次対象）。

## 2. 競合調査サマリ（強み/示唆）
- Scratch（MIT）
  - 強み: ブロックベース×創作コミュニティ、リミックス文化、低障壁で高い表現力。
  - 示唆: ドリル後に「作品化」へ橋渡しする仕組み（テンプレ＋公開/共有）を用意。
- Code.org（CS Fundamentals/CSP）
  - 強み: 段階的カリキュラム、教師向け資料、パーソンズ問題やペア学習など多様な活動。
  - 示唆: 教員向け資料・評価指標・アクティビティ多様化（Parsons/Debug/Project）。
- Microsoft MakeCode（Arcade/Minecraft）
  - 強み: ブロック↔テキスト移行、デバイス連携、即時シミュレータ。
  - 示唆: 実行/デバッグの即時性、可視化（変数/状態）と段階的テキスト導入。
- Tynker / CodeCombat / CodeMonkey
  - 強み: 物語進行型、ゲーミフィケーション、アダプティブ課題、保護者向けレポート。
  - 示唆: ストーリー/バッジ/スキルマップ、進捗可視化、難易度自動調整。
- 日本発: Viscuit / Springin' / QUREO
  - 強み: 低学年でも扱える直感的UI、作品共有や長期モチベーション施策。
  - 示唆: 低障壁UI＋創作導線、ローカライズ済ボイス/字幕、保護者体験の最適化。

結論: ドリルだけでなく「Debug/Parsons/Challenge/Project/Remix」を併設し、短時間の理解→応用→創作へと導く多面学習が有効。変数など概念導入は段階化し、動画/音声での前提形成と可視デバッグで定着を促進。

## 3. 教育指針（最新動向の反映）
- Constructionism/制作的学習: 学びは作品づくりを通じて深まる。ドリル→小作品→公開/振り返りの循環。
- PRIMM / Use–Modify–Create: 予測→実行→調査→改変→制作。各段階をコンテンツ型で支援（例: Parsons→Debug→Modify→Project）。
- Worked Examples/パーソンズ問題: 初学者の認知負荷を下げ、誤概念を矯正。
- Subgoal Labeling/可視化: ブロック群に小目標ラベルを付与し、分割統治を体感。
- Retrieval/Spacing/Mastery: 復習間隔と到達基準で長期保持を狙う（スキル別マスタリー）。
- UDL/アクセシビリティ: 音声/字幕/キーボード操作/色覚配慮、読み上げ対応。

## 4. 学習モード（ドリル依存からの拡張）
1) Drill（既存強化）
   - 明確な到達条件、ヒント段階制、誤りに応じたフィードバック。
2) Parsons（並べ替え）
   - 正しいブロック断片を並べ替えてロジック理解を促す。低負荷で概念導入。
3) Debug（デバッグ）
   - 既存の誤りを見つけて修正。デバッグ観点（条件の否、オフバイワン等）をタグ化。
4) Challenge（制約付き課題）
   - 限定ブロック/手数制限などで発想を促す。達成でバッジ付与。
5) Project（創作）
   - テンプレートから制作。変数/ループ/関数の実用例を提示。公開/共有/リミックス。
6) Video Micro-Lessons（動画）
   - 各概念に2–3分の導入動画＋インタラクティブ設問（予測/理解チェック）。

## 5. 概念導入の段階（変数など）
- 低学年: 逐次・繰り返し（ループ）・条件分岐の直感的理解。数・座標・角度の可視化。
- 中学年: 変数（カウンタ/スコア）・入力（キーボード/クリック）・合成イベント。
- 高学年: 複数変数の関係、関数/手続き、乱数、単純な状態機械、テキスト移行の導入。
- ブロック→テキストのブリッジ: サイドバイサイド表示、名称対応表、選択的な表示切替。

## 6. 情報設計（LessonSchema拡張案）
content/lessons/*.json を下記のように拡張し、Zodで検証（@core/blocks/schemas）。

```jsonc
{
  "id": "loops-01",
  "title": "くりかえしの基本",
  "type": "drill", // "parsons" | "debug" | "challenge" | "project" | "video"
  "skills": ["sequence", "loop"],
  "difficulty": 2,              // 1–5
  "estimatedTimeMin": 8,
  "prerequisites": ["sequence-02"],
  "subgoals": [
    { "id": "sg1", "label": "3回くりかえす" },
    { "id": "sg2", "label": "回数を変数で管理" }
  ],
  "blocks": {                   // 使用可能ブロックや初期配置
    "allowed": ["repeat", "move", "setVar", "changeVar"],
    "starter": [{ "op": "move", "args": { "steps": 10 } }]
  },
  "assessment": {
    "completionCriteria": [
      { "type": "canvas-state", "selector": "#hero.x", "equals": 30 },
      { "type": "var-value", "name": "count", "equals": 3 }
    ],
    "rubric": [
      { "tag": "uses-loop", "weight": 2 },
      { "tag": "no-duplicate", "weight": 1 }
    ]
  },
  "hints": [
    { "tier": 1, "textKey": "hints.loops01.t1" },
    { "tier": 2, "textKey": "hints.loops01.t2", "image": "loops/arrow.png" }
  ],
  "parsons": {
    "fragments": ["repeat 3 times", "move 10 steps", "change count by 1"],
    "distractors": ["repeat 2 times"]
  },
  "debug": {
    "seed": "off-by-one",
    "knownBugs": ["repeat 2 instead of 3"]
  },
  "video": {
    "id": "vid-loops-01",
    "durationSec": 150,
    "transcriptKey": "video.loops01.transcript",
    "quizzes": [
      { "id": "q1", "type": "predict", "promptKey": "video.loops01.q1" }
    ]
  },
  "localization": { "voiceKey": "lesson.loops01.voice", "tags": ["ja"] }
}
```

実装ポイント:
- `LessonSchema` に `type/skills/subgoals/assessment/parsons/debug/video` 等を追加。
- `@content/voice/` に文言・字幕・ヒントテキストを追加し、Zodで参照キー存在を検証。
- 既存の `schema:check` を拡張し、未知キー禁止・必須/依存関係を厳格化。

## 7. UI/UX仕様（App Router）
- エディタ（app/editor）
  - 変数インスペクタ: 実行中に変数リストをライブ表示（ウォッチペイン）。
  - ステップ実行/ブレークポイント: 1ステップ/1ブロック実行、現在位置ハイライト。
  - サブゴールUI: `subgoals` をチェックリスト表示、達成時にトースト＆色替え。
  - Parsonsモード: ドラッグ並べ替え専用ビュー（ブロックは編集不可）。
  - Debugモード: 既知バグのヒント導線（"バグの手がかりを見る"）。
  - アクセシビリティ: キーボード操作、読み上げ対応、コントラスト基準WCAG AA。
- キャンバス（app/canvas）
  - 状態可視化: 軌跡表示、座標/角度/衝突可視化トグル。
  - 自動評価の可視化: クリア条件をUIに明示し、達成の進捗バーを表示。
- 動画（app/audio / app/components）
  - マイクロ動画プレイヤー: 再生速度、字幕、絵とテキストの同時提示（デュアルコーディング）。
  - インタラクティブクイズ: 再生内で予測問題／○×／選択肢を挿入。
- 進捗/ゲーミフィケーション（app/save）
  - スキルマップ: `skills` 別にマスタリー率を表示。バッジ/XP。
  - スペースド復習: 苦手スキルを一定間隔でサジェスト。
- 教員/保護者向け（将来）
  - 簡易レポート: クリア率/ヒント依存度/平均試行回数。CSVエクスポート。

## 8. テレメトリ（@app/telemetry）
イベント例（匿名化前提、個人情報は保有しない）:
- `lesson_opened`: {lessonId}
- `goal_progressed`: {lessonId, subgoalId}
- `run_executed`: {lessonId, blocks, durationMs}
- `hint_viewed`: {lessonId, tier}
- `attempt_result`: {lessonId, success, attempts, errorTags}
- `video_quiz_answered`: {videoId, quizId, correct}
- `difficulty_auto_adjusted`: {from, to, reason}

主要指標:
- 1セッションあたり学習時間、1週間継続率、ヒント利用率、到達2回目の正答率（保持）、プロジェクト提出率。

## 9. コンテンツ運用
- 執筆テンプレ（Video+Drill+Parsons+Debug+Project を1パッケージ化）。
- レビューフロー: `npm run schema:check` + `npm test` を必須。PRテンプレに成果物GIFと検証手順。
- 命名: レッスンIDは `topic-nn`、スキルタグは固定語彙（sequence/loop/condition/variable/function/event）。

## 10. 実装計画（3スプリント）
- Sprint 1: スキーマ拡張（Zod/型）、Parsons/Debugの最小UI、サブゴール表示、基本テレメトリ。
- Sprint 2: 動画プレイヤー＋インタラクティブクイズ、変数インスペクタ、達成可視化、XP/バッジ。
- Sprint 3: アダプティブ難易度（ヒント/制約/手数）、プロジェクトテンプレ/公開、簡易レポート。

## 11. リスクと対応
- 課題: 動画制作コスト
  - 対応: まずは音声＋アニメーション簡易版、字幕重視。外部制作はテンプレ/用語統一。
- 課題: スキーマ拡張の破壊的変更
  - 対応: マイグレーションスクリプト、`version` 付与、後方互換フィールドを許容。
- 課題: 初学者の複雑UI
  - 対応: モード別でUIを簡素化、チュートリアルオーバーレイ、はじめは非表示の上級機能。

## 12. 成果検証（KPI）
- 学習: ドリル→チャレンジ→プロジェクトの到達率、2週間後の保持率、誤概念タグの減少。
- 体験: 1週間継続率 +10pt、1セッションあたり学習時間+20%、ヒント段階2→1の縮小。
- コンテンツ: レッスン制作リードタイム短縮、レビューバグ率の低減。

---

# 付録A: Zodスキーマ拡張の概略
TypeScript（@core/blocks/schemas）例イメージ:

```ts
export const LessonTypeEnum = z.enum(["drill", "parsons", "debug", "challenge", "project", "video"]);
export const SubgoalSchema = z.object({ id: z.string(), label: z.string() });
export const VideoSchema = z.object({ id: z.string(), durationSec: z.number().int().positive(), transcriptKey: z.string(), quizzes: z.array(z.object({ id: z.string(), type: z.enum(["predict","mcq","tf"]), promptKey: z.string() })).default([]) });
export const AssessmentSchema = z.object({ completionCriteria: z.array(z.any()), rubric: z.array(z.object({ tag: z.string(), weight: z.number().int().min(0) })).default([]) });

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: LessonTypeEnum,
  skills: z.array(z.string()).nonempty(),
  difficulty: z.number().int().min(1).max(5),
  estimatedTimeMin: z.number().int().min(1).max(60),
  prerequisites: z.array(z.string()).default([]),
  subgoals: z.array(SubgoalSchema).default([]),
  blocks: z.object({ allowed: z.array(z.string()).default([]), starter: z.array(z.any()).default([]) }).default({ allowed: [], starter: [] }),
  assessment: AssessmentSchema.optional(),
  hints: z.array(z.object({ tier: z.number().int(), textKey: z.string(), image: z.string().optional() })).default([]),
  parsons: z.object({ fragments: z.array(z.string()), distractors: z.array(z.string()).default([]) }).optional(),
  debug: z.object({ seed: z.string().optional(), knownBugs: z.array(z.string()).default([]) }).optional(),
  video: VideoSchema.optional(),
  localization: z.object({ voiceKey: z.string().optional(), tags: z.array(z.string()).default([]) }).default({ tags: [] })
}).strict();
```

# 付録B: UIワイヤ概要
- エディタ右側: 変数インスペクタ/サブゴール/ヒント/実行ログ。
- ヘッダ: モードトグル（Drill/Parsons/Debug/Challenge/Project/Video）。
- フッタ: 実行/ステップ実行/リセット、到達条件の進捗バー。

# 付録C: 動画コンテンツのガイドライン
- 尺: 2–3分/概念。導入→例示（アニメ）→予測→まとめの4部構成。
- 字幕/台本は `content/voice/` に格納。読み上げと同期表示。
- 非言語情報（矢印/色）で視覚支援、色覚多様性配慮（赤緑同値なし）。

# 付録D: 教員向け評価観点（抜粋）
- 概念: 逐次/反復/条件/変数/関数/イベントの習熟。
- 実践: デバッグ戦略の言語化、サブゴール分解、設計→実装→振り返りの循環。
- 態度: 粘り強さ、他者作品のリミックス、フィードバックの受容。
