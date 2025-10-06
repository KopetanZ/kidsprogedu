# 13_Roadmap.md — 将来ロードマップ（初版）

## v0.1（MVP）
- レッスン14／作品／音声（タップ再生）／ローカル保存

## v0.2
- PWA対応（オフライン）、誤タップ保護強化、アンドゥ履歴拡張

## v0.3
- 作品シェア（QRエクスポート→保護者端末へ）
- 保護者ビュー（進捗一覧）

## v1.0
- クラウド保存、簡易ギャラリー、教員向け配布モード

---

## 付録：最小ディレクトリ & コマンド
```
pnpm create next-app my-kids-coding
cd my-kids-coding && pnpm add zustand
mkdir -p core/engine core/blocks content/lessons content/voice public/{icons,images,sounds}
```

### 雛形レッスン（同梱サンプル）
```json
{
  "id":"L1_1_go_right",
  "title":"みぎへ いこう",
  "goal":{"type":"reach","x":3,"y":1},
  "toolbox":["when_flag","move_right","play_sound"],
  "hints":["みぎの ぶろっくを 3こ おいて ためしてみよう"],
  "starterCode":[{"block":"when_flag"}],
  "accept":{"maxBlocks":8}
}
```

---

## 実装に向けた追補（Implementation-Ready）

- マイルストーン/ゲート:
  - v0.1 Gate: L1×4動作、Undo/保存/音声ガイド、U-01/U-02/U-03達成。
  - v0.2 Gate: PWA+オフライン。操作保護（長押し無効/タップ領域更改）。
  - v0.3 Gate: QRシェア（作品JSONのURL化）と保護者ビュー（ローカル）。
- リスクと対策:
  - パフォーマンス: 命令上限/タイル移動の最適化、描画領域の差分更新。
  - 読字差: 音声充実/短文テキストの併記/アイコン強化。
  - 継続率: 連続ログインボーナスではなく、自由制作の動機付けをUIで演出。
- 計測（ローカル）:
  - 5タップ到達、ヒント後再挑戦、完了時間、離脱位置（画面）。




---
