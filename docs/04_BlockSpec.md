# 04_BlockSpec.md — ブロック言語仕様（初版）

## 実行モデル
- イベントキュー → 命令列実行（1tick=16ms目安）→ 衝突判定 → 描画

## ブロック一覧（MVP）
|ID|表示|カテゴリ|引数|接続|説明|
|---|---|---|---|---|---|
|when_flag|はたが おされたら|イベント|-|ヘッド|開始トリガ|
|move_right|みぎへ いく|うごき|times:(1/3/5)|文中|X+1 を times 回|
|move_left|ひだりへ いく|うごき|times:(1/3/5)|文中|X-1 を times 回|
|move_up|うえへ いく|うごき|times:(1/3/5)|文中|Y-1 を times 回|
|move_down|したへ いく|うごき|times:(1/3/5)|文中|Y+1 を times 回|
|repeat_n|〇かい くりかえす|せいぎょ|n:(2/3/5)|文中(子)|子ブロックをn回|
|play_sound|おとを ならす|おと|-|文中|SE再生|
|say|しゃべる|あそび|text:("やったー！"等プリセット)|文中|吹き出し表示|
|if_touch_goal|ゴールに ふれたら|できごと|-|文中（次の1ブロック）|次の1命令を実行|

## 禁止・制限
- 数値自由入力なし／選択肢のみ
- ネスト深さ：最大3

## シリアライズ（JSON）
```json
{"block":"repeat_n","n":3,"children":[{"block":"move_right","times":1}]}
```

---

## 実装に向けた追補（Implementation-Ready）

- 形式定義（TypeScript）:
  - `type BlockId = 'when_flag'|'move_right'|'move_left'|'move_up'|'move_down'|'repeat_n'|'play_sound'|'say'|'if_touch_goal'`
  - `type Block = { block: BlockId; times?:1|3|5; n?:2|3|5; textId?: string; children?: Block[] }`
- 実行セマンティクス:
  - when_flag: 実行開始時にキューへ挿入。エディタ内1つ以上必須。
  - move_*: `times`回、1タイルずつ移動（1tick=1命令、1命令で1タイル）。
  - repeat_n: 子列を`n`回繰返し。深さは子側で+1、最大3。
  - play_sound: 非同期再生をトリガ。実行は1tickで即完了。
  - say: テキスト吹き出し3秒表示（非ブロッキング）。
  - if_touch_goal: 直後の1命令のみ条件実行（true時のみ消費）。
- バリデーション（zod想定）:
  - timesは1|3|5、nは2|3|5のみ受理。自由入力不可。
  - ネスト深さ>3 は拒否。総ブロック数>128は読み込み拒否。
- パレット/接続ルール:
  - `when_flag`はヘッド専用（先頭）。複数可。その他は文中。
  - `if_touch_goal`の直後は文1命令のみ。repeatの子に配置可。
- ランタイムAPI（05_Architectureと整合）:
  - `step(): void` 1tick実行（最大16命令/ tick）。
  - `load(program: Block[]): void` 検証後VMへロード。
  - `runUntilIdle(maxTicks=1024): 'ok'|'limit'` スモーク用。
  - `getState(): { x:number,y:number, goal:{x:number,y:number} }`。
- エラー/制限時の挙動:
  - 命令上限超過: そのtickの残りをスキップ（次tickへ）。
  - 深さ超過: ロード拒否（UIにトースト表示）。
