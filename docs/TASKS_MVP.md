# TASKS_MVP.md — MVPタスク分解（PM-AGENT）

> 目的：proposal.md と各仕様書（01–14）に基づき、最小PR単位で実装を前進させるチェックリストを提示。各タスクにDoD（受入基準）を付与し、依存関係を明示する。

## Phase 0: リポジトリ整備（下準備）
- feat(meta-00): ルール/設定の同期（docs/00_Engineering_Conventions.md 反映）
  - DoD: ESLint/Prettier/EditorConfig/tsconfig/next.config の雛形を配置。`pnpm lint`/`pnpm format`エラー0。

## Phase 1: アーキと型（土台）
- feat(core-01): 型・スキーマ整備（06_DataAPI準拠）
  - DoD: `Block/Lesson/SaveData/TelemetryEvent`型定義を作成。`zod`でパース関数を実装し基本テストGREEN。
- feat(core-02): ディレクトリ/エイリアス初期化（05_Architecture準拠）
  - DoD: `/app,/core,/content,/public,/test`の雛形と`@core/*`,`@app/*`パス解決が動作。`pnpm build`成功。

## Phase 2: エンジンMVP（ブロックVM）
- feat(engine-01): 実行ランタイム（tick/スケジューラ）
  - DoD: 1tick≤16命令、深さ≤3で`step()/run()`が動作。ユニットテストGREEN。
- feat(engine-02): 基本ブロック（when_flag/move_*/repeat_n/play_sound）
  - DoD: 04_BlockSpecのMVPブロックが順次/繰返で実行可。到達判定API提供（`collideGoal(x,y)`）。

## Phase 3: UI骨格（画面/操作）
- feat(ui-01): Home/LessonList骨格（03_UX/10_UI 準拠）
  - DoD: iPad横向き最適。レッスン14カードのダミー表示。タッチ領域≥44px。
- feat(ui-02): Editor/TopBar/Canvasの土台
  - DoD: 上Canvas/中コードレーン/下パレットの3段レイアウト。実行/リセット/ヒントボタン配置。5タップ以内で実行導線到達（U-01）。

## Phase 4: コンテンツ流し込み（レッスンJSON）
- feat(content-01): L1×2, L2×1 追加（02_Curriculum/14_Pipeline）
  - DoD: `/content/lessons`に3件投入。`lintLesson()`PASS。スターターコードで線形解が動作。

## Phase 5: 保存/復帰・テレメトリ（MVP）
- feat(app-01): IndexedDB保存（06_DataAPI: SaveData）
  - DoD: 進捗と作品が自動スナップショット保存。ブラウザ再起動後も復帰（07_TestPlan: 機能）。
- feat(app-02): テレメトリ（オプトイン）最小イベント
  - DoD: lesson_start/hint_tap/lesson_clear をローカルキューに記録（送信未実装）。

## Phase 6: 音声/アクセシビリティ
- feat(ui-03): ヒント音声トリガとテキスト代替
  - DoD: `/content/voice/ja.json`参照でヒント再生。音声OFF時に必ずテキスト表示（03_UX: アクセシビリティ）。

## Phase 7: QA/受入自動化
- feat(qa-01): VMユニット/UX受入テスト追加
  - DoD: `/test/vm.spec.ts`と`/test/ux.spec.ts`でU-01/U-02/U-03の自動化可能部をGREEN（07_TestPlan）。

## Phase 8: CI/デプロイ
- feat(devops-01): GitHub Actions CI（lint/test/build）
  - DoD: PRでCIがGREEN。失敗時レポート生成（/docs/QA_REPORT.md）。
- feat(devops-02): Vercel設定（08_Deploy）
  - DoD: PRごとにPreview。`main`マージでProduction自動反映。ロールバック手順確認。

---

## 依存関係（ハンドオフ）
- core-01 → core-02 → engine-01/02 → ui-02 → content-01 → app-01/02 → qa-01 → devops-01/02

## PR命名規則（例）
- `feat(core-01): Define Block/Lesson schemas`
- `feat(engine-02): Implement repeat_n & play_sound`
- `feat(ui-02): Editor skeleton with Run/Reset`
- `feat/content-01): Add lessons L1x2 L2x1`

## 補足（proposal.md との整合）
- 対象は小学1年生/iPad Safari。文字入力なし・ひらがな中心・音声ガイド重視。
- セッション5–10分、自由制作モードあり、ストーリー性/キャラ導入はMVP後半〜以降で拡張可。

