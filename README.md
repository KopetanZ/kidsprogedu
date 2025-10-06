# kidsprogedu

子ども向けのビジュアルプログラミング学習アプリケーション。Next.js (App Router) + TypeScript をベースに、学習カリキュラム（レッスン）を JSON で管理し、独自の実行エンジン（VM）でブロック操作を評価します。

## 特長
- 学習レッスン: `content/lessons/*.json` で定義し Zod で検証
- 実行エンジン: `core/engine` に VM/ランタイム/物理・音声などを実装
- UI: Next.js App Router 構成（エディタ、キャンバス、音声、テレメトリ、保存機能）
- 型安全: TypeScript strict、スキーマ駆動で入力を検証
- テスト: Vitest + Testing Library によるコア/スキーマ/主要フローの検証

## 技術スタック
- Next.js / React 18
- TypeScript（strict）
- Zustand（アプリ状態）
- Zod（レッスンスキーマ検証）
- Vitest / @testing-library/react（テスト）
- ESLint / Prettier（コード品質）

## ディレクトリ構成
```
app/        # Next.js App Router UI（components, editor, canvas, audio, telemetry, save, (routes)）
core/       # ドメイン・ランタイム（engine, blocks, infra）※ 依存方向は core → app のみ
content/    # カリキュラム資産（lessons/*.json, voice/）
test/       # Vitest のテスト（*.spec.ts）
scripts/    # ユーティリティスクリプト（例: lintLesson.ts）
docs/       # エンジニアリング規約/アーキテクチャ
```

TypeScript パスエイリアス（`tsconfig.json`）:
- `@core/*`, `@app/*`, `@content/*`

例: `import { LessonSchema } from "@core/blocks/schemas";`

## セットアップ
前提: Node.js 18 以降を推奨、npm 使用。

```bash
npm install
npm run dev
```

- 開発サーバ: `npm run dev`
- 本番ビルド: `npm run build`
- 本番サーブ: `npm start`

## スクリプト一覧
- `npm test`: テスト実行（Vitest）
- `npm run lint`: ESLint（import/order や hooks ルールを含む）
- `npm run format`: Prettier（書き込み）
- `npm run schema:check`: `content/lessons/*.json` を Zod で検証

## コーディング規約
- フォーマット: Prettier（printWidth 100, semi true, singleQuote false）
- Lint: `@typescript-eslint`, `react`, `react-hooks`, `import/order`（アルファベット順 + スペース）
- 命名: UI コンポーネントは `PascalCase.tsx`、ロジック/ユーティリティは `kebab-case.ts`
- 値: `null` ではなく `undefined` を優先
- 入力検証: 外部入力は Zod で必ず検証
- 状態管理: Zustand に集約
- 描画: Canvas アニメーションは `requestAnimationFrame`
- アーキテクチャ境界: `app` から `core` への import を禁止（依存は `core → app` のみ）

## テスト方針
- フレームワーク: `vitest` + `@testing-library/react`
- 位置: `test/*.spec.ts`（例: `editor-store.spec.ts`, `schemas.spec.ts`）
- 優先: コア VM/ブロック、スキーマ検証、主要 UI フロー
- 注意: Canvas の生描画は避け、ロジック関数をテスト
- 実行: `npm test`（CI でもテストとスキーマ検証を実行）

## レッスン（コンテンツ）
- 追加: `content/lessons/*.json` として作成
- 検証: `npm run schema:check` で Zod スキーマ検証
- 文字列: UI 向け文言は `content/voice/` に集約（多言語対応を想定）

## セキュリティ/品質の注意
- レッスンは `LessonSchema` で検証してから使用
- 非 null 断定（`!`）は避け、型ガードで安全に扱う
- UI 直書きの文字列は避け、`content/voice/` へ
- `app → core` の依存を持ち込まない（境界を保つ）

## コントリビューション
- コミット規約: Conventional Commits（`feat:`, `fix:`, `docs:`, `test:`, `chore:`）
  - 例: `feat(editor): highlight active block`
- PR ポリシー: 1 PR 1 目的、説明/関連 Issue、UI の場合はスクショ/動画、検証手順を記載
- CI: Lint/テスト/スキーマ検証が走ります。ローカルでも `lint`/`test`/`schema:check` を通してください。

## デプロイ
- Vercel を想定（`vercel.json` あり）
- 本番ビルド: `npm run build` → `npm start`（静的出力やホスティング環境に応じて調整）

## ライセンス
このリポジトリのライセンスはリポジトリのルートにあるファイルに従います（未設定の場合は別途合意に従います）。

---
ご不明点や追加要望（README の英語版、スクリーンショット、チュートリアルの追記など）があればお知らせください。
