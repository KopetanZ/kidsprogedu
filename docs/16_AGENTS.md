# 16_AGENTS.md — Codex実装エージェント運用要領（初版）

> 目的：Codex（コード生成AI）を複数の役割エージェントとして運用し、迷いなく着工→検証→反復できるようにする。各エージェントのミッション／入出力／プロンプト雛形／合格基準（DoD）／ハンドオフを定義。

## A. 全体像（役割とハンドオフ）
```
[PM-AGENT]  →  要件の整形・タスク分解・受入基準提示
   │
   ├─▶ [UI-AGENT]     画面・コンポーネントの実装
   ├─▶ [ENGINE-AGENT] ブロックVM/実行系の実装
   ├─▶ [CONTENT-AGENT]レッスンJSON生成・整備（#14参照）
   ├─▶ [QA-AGENT]     lint/test/UX受入の自動確認
   └─▶ [DEVOPS-AGENT] CI/Vercel/設定ファイル整備
         ▲                                         │
         └───────────────フィードバック──────────────┘
```

## B. 共通ルール（Guardrails）
- 出力は必ず差分 or 完全ファイル：どちらかを明記（例：「`/core/engine/vm.ts`の完全内容」）。
- プロジェクト規約遵守：`docs/00_Engineering_Conventions.md` と一貫。
- MVP境界を超えない：未定義ライブラリ導入やAPI設計を勝手に拡張しない。
- DoDに紐付ける：各出力に「合格基準」を自己宣言してから提出。
- iPad前提：44pxタップ、18pxフォント、音声OFF代替の配慮を常に記載。

## C. エージェント別仕様

### C-1. PM-AGENT（要件整形・タスク分解）
ミッション：PRD/UX/BlockSpecを読み、実装タスクを最小ステップに分解。各タスクにDoDを付与。
- 入力：`01_PRD.md`, `03_UX.md`, `04_BlockSpec.md`, `05_Architecture.md`, `07_TestPlan.md`
- 出力：`/docs/TASKS_MVP.md`（チェックリスト化）
- DoD：Phase1→2→3の流れで1PR=1目的、依存関係が明記。
- プロンプト雛形：
```
あなたはPM-AGENTです。以下の文書をもとにMVPタスク分解とDoDを作成。
- 01_PRD, 03_UX, 04_BlockSpec, 05_Architecture, 07_TestPlan
制約：最小PRで進むチェックリスト。各タスクにDoD（受入基準）を1–3行で付与。
出力：/docs/TASKS_MVP.md の完全内容のみ。
```

### C-2. UI-AGENT（画面・UI実装）
ミッション：Home/LessonList/Editor/ClearのReact実装。タッチ領域・音声UIの導線。
- 入力：`03_UX.md`, `10_UI_DesignSystem.md`
- 出力：`/app/components/*`, `/app/(routes)/*` の完全ファイル
- DoD：
  - 5タップで実行到達（U-01）
  - 当たり≥44px、文字直書き禁止（/content/voice/ja.json使用）
  - ESLint & unit test クリア
- プロンプト雛形：
```
あなたはUI-AGENTです。03_UXと10_UIを満たすReactをNext.jsで実装。
要件：iPad横向き最適、Canvasは上、コードレーン中、ブロック下。
出力：/app/components/{Button.tsx,Card.tsx,TopBar.tsx} と
       /app/(routes)/{page.tsx,lessons/page.tsx,editor/page.tsx,clear/page.tsx} の完全内容。
注意：i18n文字列はpropsまたは/content/voice/ja.jsonから。
```

### C-3. ENGINE-AGENT（ブロックVM・実行系）
ミッション：BlockSpecに基づく命令実行・イベント・ループ・衝突判定の最小ランタイム。
- 入力：`04_BlockSpec.md`, `05_Architecture.md`, `06_DataAPI.md`
- 出力：`/core/engine/{vm.ts,runtime.ts,physics.ts,audio.ts}` の完全内容
- DoD：
  - `when_flag`→move系→`repeat_n`→`play_sound` が実行可能
  - 1tick≤16命令、深さ≤3、到達判定API提供
  - vitestで基本ユースケースがGREEN
- プロンプト雛形：
```
あなたはENGINE-AGENTです。BlockSpecのMVPブロックが動作するVMを実装。
API:
- run(program: Block[]): Iterator<Step>
- step(): void  // 1tick進める
- collideGoal(x,y): boolean
制約：深さ3、命令16/ tick。Zod型は06_DataAPIに合わせる。
出力：/core/engine/{vm.ts,runtime.ts,physics.ts,audio.ts} の完全内容。
```

### C-4. CONTENT-AGENT（レッスン生成）
ミッション：`docs/14_Lesson_Authoring_Pipeline.md`で定義したパイプラインで生成。
- 入力：`02_Curriculum.md`, `04_BlockSpec.md`, `14_Lesson_Authoring_Pipeline.md`
- 出力：`/content/lessons/L{stage}_{nn}_{slug}.json`（1PR=3件）
- DoD：`lintLesson()` PASS、スモーク到達OK、U-03達成見込みのヒント文。
- プロンプト雛形：
```
あなたはCONTENT-AGENTです。#14のG-Prompt/S-Checklistに従い、
L1×2, L2×1 の3件を生成。lintLesson()を通し、必要なら自己修正。
出力：3つのJSONファイルの完全内容のみ。
```

### C-5. QA-AGENT（自動検証・受入）
ミッション：ESLint/TypeCheck/test実行、U-01/U-02/U-03の自動化可能部をチェック。
- 入力：リポジトリ全体、`07_TestPlan.md`
- 出力：`/test/*.spec.ts`, レポート `/docs/QA_REPORT.md`
- DoD：主要テストGREEN、iPad実機想定の操作ログ検証スクリプトOK。
- プロンプト雛形：
```
あなたはQA-AGENTです。07_TestPlanのUケースに合わせたテストを追加し、
vitestでGREENにします。出力：/test/{vm.spec.ts,ux.spec.ts}と /docs/QA_REPORT.md。
```

### C-6. DEVOPS-AGENT（CI/Vercel）
ミッション：Vercel連携、PRでPreview、mainで本番。GitHub Actionsでlint/test。
- 入力：`08_Deploy.md`, `00_Engineering_Conventions.md`
- 出力：`.github/workflows/ci.yml`, `vercel.json`（必要時）
- DoD：PR作成でPreview URL自動発行、CI成功でマージ可能。
- プロンプト雛形：
```
あなたはDEVOPS-AGENTです。08/00に従い、CIとVercel設定を実装。
出力：.github/workflows/ci.yml と vercel.json の完全内容のみ。
```

## D. ハンドオフ・ルール
1. PM→各AGENT：`docs/TASKS_MVP.md`の番号でPR名を指定（例：`feat(ui-01): Home画面`）。
2. 各AGENT→QA：PRにDoDチェックリストを添付。
3. QA→DEVOPS：CIがGREENならPreview確認→承認→mainへ。
4. 失敗時：QAがNG理由を`/docs/QA_REPORT.md`に追記→元AGENTが再実装。

## E. メモリ（Artifact）運用
- 生成物は完全ファイルとして提示し、差分はPRで可視化。
- 生成・テストログは`/docs/logs/yyyymmdd_agent.log`に残す（任意）。

## F. 例：最初の3PR（サンプル）
1. `feat(ui-01): Home/LessonListのUI骨格` — UI-AGENT（DoD: 5タップ導線到達）
2. `feat/engine-01: VM最小命令（when_flag/move/repeat/audio）` — ENGINE-AGENT（DoD: vitest green）
3. `feat/content-01: L1×2, L2×1 追加` — CONTENT-AGENT（DoD: lintLesson pass）

## G. 停止条件・エスカレーション
- ESLint/TypeCheckエラーが3回連続で発生→PM-AGENTが仕様簡素化を提案。
- パフォーマンス<30fps常態→ENGINE-AGENTが命令1tick上限を調整し再評価。

---

以上で、Codexが役割ごとに即着工→検証→反復できるAGENTS.mdの初版です。必要なら、各AGENTの「最初の出力ファイルの完全ひな形」まで展開します。

