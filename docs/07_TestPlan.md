# 07_TestPlan.md — テスト計画 & 受入基準（初版）

## 体験テスト（ユーザビリティ）
- **U-01** 初見の子が**5タップ以内**で実行できる
- **U-02** 誤タップ時、2手以内にアンドゥ可能
- **U-03** ヒント1回でL1課題を10分以内に80%以上が完了

## デバイス
- iPad（最新iOS）Safari／横・縦

## 機能
- 保存：ブラウザ再起動で進捗が保持
- クリア判定：ゴール衝突・イベント起動が確実
- 音声OFF時：テキストヒントで代替

## 非機能
- パフォーマンス：L2-4で60fps目標（大量ブロック時≥30fps）
- 安定性：連続30分操作でエラー0（コンソール）

---

## 実装に向けた追補（Implementation-Ready）

- 自動テスト（vitest）:
  - `test/vm.spec.ts`: when_flag→move_right×3でx=4到達。repeat_nで3回繰返し。命令上限と深さ制限を検証。
  - `test/ux.spec.ts`: 5タップ導線の存在（Home→LessonList→Editor→Run）。Undoが2手以内。音声OFFでテキストヒント表示。
- 手動チェックリスト:
  - iPad SafariでL1-1〜L1-4を10分以内に80%以上の児童がクリア（保護者同席なし想定）。
  - ブロック0個で実行→ガイド表示。ヒント押下→再挑戦の行動率≥70%（ローカル計測）。
- パフォーマンス計測手順:
  - DevTools Performanceで`step()`コスト<1ms/avg、`render()`<8ms/avg。60fps目標（最低30）。
- 受入DoD（テスト）:
  - CIで`pnpm test && pnpm lint`がGREEN。主要ブラウザ（iPad Safari）で1セッション30分エラー0。
