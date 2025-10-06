# 00_Engineering_Conventions.md — コーディング規約 & プロジェクト初期化（Codex最適化）

> 目的：Codexが迷わず実装でき、品質が自動で担保されるように**ルール・設定ファイル・スクリプト**を先置きする。

## 1) 技術方針（要約）
- 言語：TypeScript 5 / Next.js (App Router) / React 18 / Canvas 2D
- 依存：zustand（状態）、zod（バリデーション）
- スタイル：Tailwind（将来導入可。MVPは最小CSSでも可）
- 単位：ピクセル、タッチ領域≥44px

## 2) ディレクトリ規約（再掲＋細則）
```
/app          # ページ・UI・画面遷移
  /(routes)
  /components
  /editor
  /canvas
/core         # ドメイン（VM）とアプリ層
  /engine     # runtime/physics/audio
  /blocks     # definitions/toolbox
/content      # lessons & voice
/public       # 画像・音・アイコン
/test         # vitest
```
- import順：`core -> app` の一方向。UIはVMへ依存、逆は不可。

## 3) コーディング規約（React/TS）
- **命名**：ファイル`PascalCase.tsx`（UI）/ `kebab-case.ts`（ロジック）
- **props**：UIは`onAction`/`value`の二軸で受ける（双方向禁止）。
- **状態**：VM状態は`zustand`ストア1つに集約。UIは副作用を持たない。
- **null禁止**：undefined優先。`!` 非推奨。
- **ガード**：外部入力は**zodでパース**→VMに渡す。
- **描画**：Canvas更新は`requestAnimationFrame`。setInterval禁止。
- **i18n**：表示文字列は`/content/voice/ja.json`に集約（UI直書き禁止）。

## 4) アクセシビリティ/UX規約
- タップ領域44px以上、フォント最小18px。
- 音声OFF時はテキストヒントを必ず表示。
- フォーカス可能要素に`role`/`aria-label`（将来PWAで必要）。

## 5) テスト規約
- ランタイム：`vitest + @testing-library/react`
- 優先テスト：
  - VM：ブロック実行（sequence/repeat/event）
  - 受入：5タップ到達、アンドゥ、保存復帰
- スナップショットは最小限。Canvasはロジック分離して関数テスト。

## 6) Lint/Format 設定
- ESLint（strict + react-hooks + import-order）
- Prettier（printWidth 100 / semi true / singleQuote false）
- EditorConfig（インデント2）

### .eslintrc.cjs（抜粋）
```js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint','react','react-hooks','import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'import/order': ['error', { 'newlines-between':'always','alphabetize':{order:'asc'} }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/prop-types': 'off'
  }
}
```

### .prettierrc
```json
{ "printWidth": 100, "singleQuote": false, "semi": true }
```

### .editorconfig
```
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

## 7) TypeScript/Next 設定
### tsconfig.json（抜粋）
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022","DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@core/*": ["core/*"], "@app/*": ["app/*"] }
  }
}
```

### next.config.ts（抜粋）
```ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = { reactStrictMode: true, swcMinify: true };
export default nextConfig;
```

## 8) パッケージとスクリプト
### package.json（抜粋）
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "lint": "eslint .",
    "format": "prettier --write .",
    "schema:check": "ts-node scripts/lintLesson.ts"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "eslint": "^9.9.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "prettier": "^3.3.3",
    "vitest": "^2.0.5",
    "@testing-library/react": "^16.0.0"
  }
}
```

## 9) Git運用・コミット規約
- Conventional Commits：`feat:`, `fix:`, `chore:`, `docs:`, `test:`
- 1PR＝1目的。PRテンプレを利用。

### .github/PULL_REQUEST_TEMPLATE.md
```
## 目的

## 変更点

## 動作確認
- [ ] iPad Safari 実機
- [ ] 5タップ到達可能
- [ ] fps >= 30
```

## 10) CI（Vercel + GitHub Actions）
- Vercel：PRでPreview、自動デプロイ。
- Actions：`lint`と`test`をPR時に実行。

### .github/workflows/ci.yml
```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: pnpm i --frozen-lockfile || npm i
      - run: npm run lint
      - run: npm run test
```

## 11) Codex運用ガイド（短文プロンプト集）
- **実装要求（UI）**
```
次のワイヤ仕様に沿って、iPad向けタッチUIのReactコンポーネントを実装。
当たり44px以上。文字列はpropsから受取り、直書きしない。
```
- **VM実装**
```
BlockSpecの定義に沿って、`repeat_n`の実行器を実装。
1tickあたり最大16命令。childrenを深さ3まで実行。
```
- **レッスン生成**：#14のG-Prompt/S-Checklistを参照。

## 12) DoD（Definition of Done）
- 受入：U-01/U-02/U-03を満たす
- Lint/テスト/TypeCheckパス
- iPad Safari 実機でレッスン1件プレイ確認

## 13) README Quickstart（貼り付け用）
```
pnpm i
pnpm dev
# http://localhost:3000 へ。Home→LessonList→Editorの遷移確認
```

---

## 14) VSCode 設定（推奨）
`.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.format.enable": true,
  "eslint.validate": ["typescript","typescriptreact","javascript","javascriptreact"]
}
```

## 15) DoD（この規約の達成条件）
- `pnpm lint` / `pnpm test` / `pnpm build` がローカルでGREEN。
- 主要設定ファイル（eslint/prettier/editorconfig/tsconfig/next）が配置済み。
- 5タップ導線/44pxルール/テキスト直書き禁止をPRテンプレで確認。
