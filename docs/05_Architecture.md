# 05_Architecture.md — アーキテクチャ & 技術仕様（初版）

## スタック
- Next.js（App Router）/ React / TypeScript / Canvas 2D
- デプロイ：Vercel（SSR不要、静的エクスポート中心）

## レイヤ
- **UI**：ページ・コンポーネント（ボタン、カード、モーダル）
- **Application**：シーン管理、レッスン進行、ヒント制御
- **Domain（Engine）**：ブロックVM、実行スケジューラ、衝突判定
- **Infra**：保存（LocalStorage/IndexedDB）、テレメトリ

## ディレクトリ
```
/app (pages, components, canvas, editor, ui)
/core
  /engine (vm.ts, runtime.ts, physics.ts, audio.ts)
  /blocks (definitions.ts, toolbox.ts)
/content
  /lessons (L*.json)
  /voice (ja.json)
/public (icons, images, sounds)
/test
```

## パフォーマンス方針
- 目標60fps（最低30）
- ブロック実行は1tickに最大命令数を制限（例：16命令）

## 対応デバイス
- iPad（最新Safari）横向き推奨。ビューポートmin 1024×768。

---

## 実装に向けた追補（Implementation-Ready）

- モジュール境界:
  - `core/engine`: 純粋ロジック（DOM非依存）。APIは`load/step/runUntilIdle/getState/collideGoal`。
  - `core/blocks`: 定義/バリデーション（`zod`）とツールボックス構築。
  - `app/editor`: VMへプログラムを渡す/実行する薄いアプリ層。
- ストア（zustand）形:
  - `editorStore`: { program: Block[], isRunning: boolean, history: Block[][], hintMuted: boolean }
  - アクション: addBlock, removeBlock, moveBlock, undo, run, reset, playHint
- Canvasレンダラ:
  - `app/canvas/renderer.ts`: `render(state: VMState, ctx:CanvasRenderingContext2D)`
  - 30–60fpsで`requestAnimationFrame`ループ。ステートは読み取りのみ。
- 保存（IndexedDB）:
  - DB名 `kidsprogedu`, store `saveData`（key: profileId）。自動スナップショットは5秒間隔/変更時のみ。
- 例外/エラー方針:
  - 例外はUIに出さずトースト表示（簡易）。シリアライズ/ロード失敗は復帰案内。
- パフォーマンス予算:
  - `step()`は<1ms（平均）。`render()`は<8ms（平均）。GCスパイクを避けるため配列再利用。
- 統合API（UI→アプリ層）:
  - `compile(program: Block[]): VMProgram | Error`（検証＋最適化）
  - `execute(vm, maxTicks?: number): Result`（学習用スモーク実行）
