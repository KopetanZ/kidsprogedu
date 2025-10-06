# 08_Deploy.md — 運用・デプロイ手順（Vercel）（初版）

## 環境
- Preview：PRごとに自動
- Production：`main` マージで自動

## ビルド
- Node LTS / pnpm
- コマンド：`pnpm install && pnpm build && pnpm export`

## 監視
- Vercel Analytics 有効化
- 重要エラー：Sentry等は将来導入

## ロールバック
- Vercelの`Redeploy from previous`で1クリック

---

## 実装に向けた追補（Implementation-Ready）

- Vercel 設定:
  - Framework: Next.js。Build Command: `pnpm build && pnpm export`。Output: `out/`。
  - Env: `NEXT_TELEMETRY_DISABLED=1`。Node: LTS。
- vercel.json（静的エクスポート想定）
```json
{ "cleanUrls": true, "trailingSlash": false }
```
- デプロイ後チェックリスト:
  - Home→LessonList→Editor遷移OK。音声再生とテキスト代替OK。IndexedDB保存/復帰OK。
  - FPS計測（目視/DevTools）。
- セキュリティ/プライバシー注意:
  - クッキー/PIIなし。外部送信なし。Vercel Analyticsは匿名/集計のみ。
