# 02_Curriculum.md — 学習デザイン仕様（初版）

## 学習観
- 「遊び→発見→言語化（音声）→再挑戦」。正解1つではなく、多様な解。

## 単元構成
- **L1: じゅんばん（シーケンス）** — 4課題
  - L1-1 みぎへいこう（右×3）
  - L1-2 はこをはこぼう（上→右→下）
  - L1-3 おとをならそう（動き＋音）
  - L1-4 ゴールまでいけるかな？（最短3手）
- **L2: くりかえし（ループ）** — 4課題
  - L2-1 〇かい あるこう（右×3→repeat_n）
  - L2-2 おはなに みずやり（3回スプリンクル）
  - L2-3 ステップで おどろう（動きパターン反復）
  - L2-4 はしごのぼり（回数選択2/3/5）
- **L3: できごと（イベント）** — 4課題
  - L3-1 はたが おされたら
  - L3-2 ふれたら にげよう（壁・敵）
  - L3-3 ぶつかったら もどる
  - L3-4 たからばこを ひらく（トリガ→音→踊る）
- **L4: さくひん（自由制作）** — 2課題
  - L4-1 じぶんのダンス
  - L4-2 ちいさな げーむ（めいろ or おいかけっこ）

## 到達目標
- L1：命令の**順序**で結果が変わると理解
- L2：同じ動作は**まとめて繰り返せる**と理解
- L3：「おきたら○○する」の**因果**を体験
- L4：**自分の意図**をブロックで表現

## 誤概念と対策
- ループの中身が毎回初期化される誤解→実演アニメで強調
- イベントは常時待ち受け→ヘッド（旗）点灯で可視化

## 課題フォーマット
```json
{
  "id": "L2_1_walk_repeat",
  "title": "〇かい あるこう",
  "goal": {"type":"reach","x":6,"y":1},
  "toolbox": ["when_flag","move_right","repeat_n"],
  "hints": ["おなじ うごきは まとめよう"],
  "starterCode": [
    {"block":"when_flag"},
    {"block":"move_right","times":3}
  ],
  "accept": {"maxBlocks":10, "allowLinearSolution": true}
}
```

---

## 実装に向けた追補（Implementation-Ready）

- 共通ルール:
  - ステージはグリッド 8×5（x:1..8, y:1..5）。初期位置は(1,1)想定。
  - ゴール座標は各課題の`goal`で指定（type:"reach"）。
  - `toolbox`は04_BlockSpecにあるIDのみ。引数は選択式。
  - `starterCode`は線形解または半分解までを提示し、短縮解（repeat）を誘導。
- 受入（課題単位）:
  - 最大ブロック数`accept.maxBlocks`を超えない。
  - `allowLinearSolution`がtrueのとき、repeat未使用でもクリア可。
  - クリア条件は`reach`/`event`のいずれか達成で`lesson_clear`。
- 各レッスンの具体仕様（先行6件）:
  - L1-1 みぎへいこう: goal(4,1)。toolbox=[when_flag,move_right,play_sound]。starter: when_flag。
  - L1-2 はこをはこぼう: 迷路1段。toolbox=[when_flag,move_up,move_right,move_down]。starter: when_flag。
  - L1-3 おとをならそう: move_right×2の後にplay_sound。toolbox=[when_flag,move_right,play_sound]。
  - L1-4 ゴールまでいけるかな?: 最短3手（右×3）。toolbox=[when_flag,move_right,repeat_n]。短縮解をヒントで示唆。
  - L2-1 〇かい あるこう: 右×3→`repeat_n`で置換。toolbox=[when_flag,move_right,repeat_n]。
  - L3-1 はたが おされたら: when_flagで開始、右×3でゴールに到達。
- ヒント作法（短文・音声化可能）:
  - 一文7〜10語/3–5秒。否定語は避け、肯定/提案で再挑戦促進。
  - 例: 「おなじ うごきは まとめよう」「みどりの ぼたんを おしてみよう」
