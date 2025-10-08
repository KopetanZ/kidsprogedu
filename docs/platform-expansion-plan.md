# プラットフォーム拡張計画

## 🎯 目的

現在のマス目移動システムの制約を超えて、レッスンタイトルに合った多様な学習体験を提供する。

---

## 📋 現状の問題点

### 1. **レッスンタイトルと内容の不一致**

| レッスンID | タイトル | 現状の問題 | 必要な機能 |
|-----------|---------|-----------|-----------|
| L2_06_spiral | らせんで すすもう | 経路検証なし、ゴール到達のみ | 経路パターン検証 |
| L4_01_my_dance | じぶんの ダンスを つくろう | マス目移動のみ、ダンスではない | ロボット関節制御 |
| L3_01_when_flag | 旗を つかおう | 旗イベント未実装 | 複数when_flag並列実行 |
| L3_02_touch_escape | 触ったら 戻ろう | タッチイベント未実装 | when_touchイベント |
| L4_03_maze | 迷路を とおろう | 障害物なし | 壁/障害物システム |

### 2. **プラットフォームの制約**
- マス目(8x5)移動のみ
- ゴール到達の成否判定のみ
- 経路やパターンを評価できない
- 自由な表現ができない

---

## 🚀 実装計画（優先度順）

## Phase 1: ダンス・アニメーションモード 🤖

### 目的
マス目移動から脱却し、ロボットの関節を制御する創作活動を可能にする

### 新しいレッスンタイプ: `dance`

```typescript
type: 'dance'
```

### 新しいブロック

```typescript
BlockId に追加:
- 'move_right_arm'   // 右手を動かす (0-180度)
- 'move_left_arm'    // 左手を動かす (0-180度)
- 'move_right_leg'   // 右足を動かす (0-90度)
- 'move_left_leg'    // 左足を動かす (0-90度)
- 'move_head'        // 頭を動かす (-45〜45度)
- 'pose_reset'       // ポーズをリセット
```

### ブロックスキーマ拡張

```typescript
BlockSchema に追加フィールド:
- angle: z.number().optional()  // 角度 (度数法)
- duration: z.number().optional() // アニメーション時間 (ms)
```

### 新しいゴールタイプ

```typescript
GoalSchema 拡張:
type: z.enum(['reach', 'dance', 'path'])

// dance型の場合
{
  type: 'dance',
  minMoves: number,  // 最低限必要な動作数
  requireSound: boolean // 音も必要か
}
```

### 新しいステージコンポーネント

- `RobotStage.tsx` ✅ (作成済み)
  - ロボットの描画
  - 関節の角度を反映
  - アニメーション対応

### 新しいランタイム: `RobotRuntime`

```typescript
type RobotState = {
  pose: {
    rightArm: number;
    leftArm: number;
    rightLeg: number;
    leftLeg: number;
    head: number;
  };
  moves: number; // 実行した動作数
  soundPlayed: boolean;
}

class RobotRuntime {
  executeNode(node: Block) {
    switch (node.block) {
      case 'move_right_arm':
        this.state.pose.rightArm = node.angle ?? 90;
        this.state.moves++;
        break;
      // ... 他の動作
    }
  }

  checkComplete(goal: DanceGoal): boolean {
    return this.state.moves >= goal.minMoves
      && (!goal.requireSound || this.state.soundPlayed);
  }
}
```

### レッスン例: L4_01_my_dance 改修

```json
{
  "id": "L4_01_my_dance",
  "title": "じぶんの ダンスを つくろう",
  "type": "dance",
  "goal": {
    "type": "dance",
    "minMoves": 5,
    "requireSound": true
  },
  "toolbox": [
    "when_flag",
    "move_right_arm",
    "move_left_arm",
    "move_right_leg",
    "move_left_leg",
    "move_head",
    "play_sound",
    "repeat_n"
  ],
  "hints": [
    "うでや あしを うごかして ダンスを つくろう",
    "おとも いれると もっと たのしいよ",
    "くりかえしを つかうと リズムが できるよ"
  ],
  "instruction": "じぶんだけの ダンスを つくろう！💃"
}
```

### 実装タスク
- [ ] BlockId に dance用ブロック追加
- [ ] BlockSchema に angle/duration フィールド追加
- [ ] GoalSchema に dance型追加
- [ ] RobotRuntime クラス作成
- [ ] RobotStage の完成（関節アニメーション）
- [ ] エディタページでdance型レッスンの分岐処理
- [ ] createBlockFromToolbox に dance用ブロック追加
- [ ] L4_01, L4_02 などをdance型に変更

**想定工数**: 6-8時間

---

## Phase 2: 経路検証システム 🌀

### 目的
「らせん」「ジグザグ」など特定の経路パターンを検証できるようにする

### 新しいゴールタイプ: `path`

```typescript
{
  type: 'path',
  endPosition: { x: number, y: number },
  requiredPath?: Array<{ x: number, y: number }>,  // 必須通過点
  pathPattern?: 'spiral' | 'zigzag' | 'square' | 'custom',
  minPathLength?: number
}
```

### Runtime拡張: 経路記録

```typescript
type VMState 拡張:
{
  // 既存フィールド...
  path: Array<{ x: number, y: number }>, // 移動履歴
}

VM クラス拡張:
private recordMove(newPos: Position) {
  this.state.path.push({ ...newPos });
}

// 経路検証
validatePath(goal: PathGoal): boolean {
  // 必須通過点チェック
  if (goal.requiredPath) {
    for (const point of goal.requiredPath) {
      if (!this.state.path.some(p => p.x === point.x && p.y === point.y)) {
        return false;
      }
    }
  }

  // パターン検証
  if (goal.pathPattern === 'spiral') {
    return this.isSpiralPattern(this.state.path);
  }

  // 長さチェック
  if (goal.minPathLength && this.state.path.length < goal.minPathLength) {
    return false;
  }

  return true;
}

private isSpiralPattern(path: Position[]): boolean {
  // らせんパターンの判定ロジック
  // 例: 移動方向が右→上→右→上... のパターン
}
```

### Stage拡張: 経路可視化

```typescript
Stage コンポーネント追加:
- props.showPath: boolean
- props.path: Position[]

描画処理:
if (showPath && path.length > 1) {
  ctx.strokeStyle = '#4F8EF7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < path.length - 1; i++) {
    const from = toCenter(path[i]);
    const to = toCenter(path[i + 1]);
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  }
  ctx.stroke();
}
```

### レッスン例: L2_06_spiral 改修

```json
{
  "id": "L2_06_spiral",
  "title": "らせんで すすもう",
  "type": "drill",
  "goal": {
    "type": "path",
    "endPosition": { "x": 5, "y": 4 },
    "pathPattern": "spiral",
    "requiredPath": [
      { "x": 2, "y": 1 },
      { "x": 2, "y": 2 },
      { "x": 3, "y": 2 },
      { "x": 3, "y": 3 },
      { "x": 4, "y": 3 },
      { "x": 4, "y": 4 },
      { "x": 5, "y": 4 }
    ]
  },
  "toolbox": ["when_flag", "move_right", "move_up", "repeat_n"],
  "hints": [
    "みぎ→うえ→みぎ→うえ の じゅんばんで うごくよ",
    "とおる みちが らせんの かたちに なるように がんばろう"
  ],
  "instruction": "らせんの みちを とおって ゴールしてね！🌀",
  "showPath": true
}
```

### 実装タスク
- [ ] GoalSchema に path型追加
- [ ] VMState に path配列追加
- [ ] VM.recordMove() 実装
- [ ] VM.validatePath() 実装
- [ ] パターン判定関数 (spiral, zigzag等) 実装
- [ ] Stage に経路描画機能追加
- [ ] LessonSchema に showPath フィールド追加
- [ ] L2_06, L1_05 などを path型に変更

**想定工数**: 4-5時間

---

## Phase 3: 障害物・迷路システム 🧱

### 目的
壁や障害物を配置して、より複雑な問題解決を可能にする

### Lesson拡張: obstacles フィールド

```typescript
LessonSchema 拡張:
{
  obstacles?: Array<{ x: number, y: number }>,
  walls?: Array<{
    from: { x: number, y: number },
    to: { x: number, y: number }
  }>
}
```

### VM拡張: 衝突判定

```typescript
VM クラス拡張:
private obstacles: Set<string> = new Set();

load(program: Block[], obstacles?: Array<Position>) {
  if (obstacles) {
    this.obstacles = new Set(
      obstacles.map(p => `${p.x},${p.y}`)
    );
  }
  // ...
}

private moveOnce(delta: { dx: number; dy: number }) {
  const next = {
    x: this.state.pos.x + delta.dx,
    y: this.state.pos.y + delta.dy
  };

  // 障害物チェック
  const key = `${next.x},${next.y}`;
  if (this.obstacles.has(key)) {
    // 移動できない
    this.state.executedThisTick += 1;
    return;
  }

  this.state.pos = clampToGrid(next, this.state.grid);
  this.state.executedThisTick += 1;
  this.audio?.play('move');
}
```

### Stage拡張: 障害物描画

```typescript
Stage コンポーネント追加:
- props.obstacles?: Array<{ x: number, y: number }>

描画処理:
if (obstacles) {
  for (const obstacle of obstacles) {
    const center = toCenter(obstacle.x, obstacle.y);
    ctx.fillStyle = '#666';
    ctx.fillRect(
      center.x - cellW/2 + 4,
      center.y - cellH/2 + 4,
      cellW - 8,
      cellH - 8
    );
  }
}
```

### レッスン例: L4_03_maze 改修

```json
{
  "id": "L4_03_maze",
  "title": "迷路を とおろう",
  "type": "drill",
  "goal": {
    "type": "reach",
    "x": 7,
    "y": 5
  },
  "obstacles": [
    { "x": 2, "y": 2 },
    { "x": 2, "y": 3 },
    { "x": 3, "y": 3 },
    { "x": 4, "y": 2 },
    { "x": 5, "y": 3 },
    { "x": 5, "y": 4 }
  ],
  "toolbox": ["when_flag", "move_right", "move_left", "move_up", "move_down", "repeat_n"],
  "hints": [
    "かべを さけて すすもう",
    "いきどまりに なったら もどってね"
  ],
  "instruction": "迷路を とおって ゴールしてね！🏰"
}
```

### 実装タスク
- [ ] LessonSchema に obstacles/walls フィールド追加
- [ ] VM に障害物セット管理追加
- [ ] VM.moveOnce() に衝突判定追加
- [ ] Stage に障害物描画追加
- [ ] Runtime に obstacles 渡す処理追加
- [ ] L4_03 などを障害物付きに変更

**想定工数**: 3-4時間

---

## Phase 4: イベントシステム 🚩

### 目的
複数の when_flag や when_touch など、イベント駆動プログラミングを実現

### 新しいブロック

```typescript
BlockId に追加:
- 'when_clicked'      // クリックされたら
- 'when_touch_sprite' // スプライトに触れたら
- 'when_key_pressed'  // キーが押されたら
```

### Runtime拡張: イベントハンドラ

```typescript
type EventHandler = {
  event: 'flag' | 'click' | 'touch' | 'key';
  program: Block[];
  runtime: Runtime;
}

class EventSystem {
  private handlers: EventHandler[] = [];

  register(event: string, program: Block[]) {
    const runtime = new Runtime({ goal: this.goal });
    runtime.load(program);
    this.handlers.push({ event, program, runtime });
  }

  trigger(event: string) {
    for (const handler of this.handlers) {
      if (handler.event === event) {
        handler.runtime.step();
      }
    }
  }

  // 並列実行
  stepAll() {
    for (const handler of this.handlers) {
      if (handler.runtime.getState().running) {
        handler.runtime.step();
      }
    }
  }
}
```

### VM拡張: マルチスレッド対応

```typescript
VM クラス拡張:
// 複数のwhen_flagブロックをサポート
load(program: Block[]) {
  const flagIndices = program
    .map((b, i) => b.block === 'when_flag' ? i : -1)
    .filter(i => i >= 0);

  // 各when_flagから独立したフレームを作成
  this.state.frames = flagIndices.map(idx => ({
    kind: 'seq',
    nodes: program.slice(idx + 1, flagIndices[idx + 1] ?? program.length),
    index: 0
  }));
}
```

### レッスン例: L3_01_when_flag 改修

```json
{
  "id": "L3_01_when_flag",
  "title": "旗を つかおう",
  "type": "drill",
  "goal": {
    "type": "multi_goal",
    "goals": [
      { "sprite": "cat", "position": { "x": 3, "y": 1 } },
      { "sprite": "dog", "position": { "x": 5, "y": 3 } }
    ]
  },
  "sprites": [
    { "id": "cat", "start": { "x": 1, "y": 1 } },
    { "id": "dog", "start": { "x": 1, "y": 3 } }
  ],
  "toolbox": ["when_flag", "move_right", "move_up"],
  "hints": [
    "2つの 旗ブロックを つかうよ",
    "それぞれの スプライトが どうごくか かんがえよう"
  ],
  "instruction": "2ひきを どうじに うごかそう！🚩🚩"
}
```

### 実装タスク
- [ ] BlockId にイベントブロック追加
- [ ] EventSystem クラス作成
- [ ] VM のマルチフレーム対応
- [ ] 複数スプライト対応（スキーマ拡張）
- [ ] Stage の複数スプライト描画
- [ ] L3_01〜L3_09 をイベント型に変更

**想定工数**: 8-10時間

---

## 📊 実装優先度まとめ

| Phase | 機能 | 工数 | 優先度 | 影響レッスン数 |
|-------|------|------|--------|---------------|
| 1 | ダンスモード | 6-8h | ⭐⭐⭐ 高 | L4_01, L4_02, L2_03, L2_09 (4件) |
| 2 | 経路検証 | 4-5h | ⭐⭐⭐ 高 | L2_06, L1_05, L1_08, L2_08 (4件) |
| 3 | 障害物システム | 3-4h | ⭐⭐ 中 | L4_03, L1_09 (2件) |
| 4 | イベントシステム | 8-10h | ⭐⭐ 中 | L3_01〜L3_12 (12件) |

**合計想定工数**: 21-27時間

---

## 🎯 実装ロードマップ

### Week 1: ダンスモード
- Day 1-2: スキーマ拡張、RobotRuntime作成
- Day 3: RobotStage完成、アニメーション実装
- Day 4: エディタ統合、L4_01改修、テスト

### Week 2: 経路検証
- Day 1: VMに経路記録追加
- Day 2: パターン判定ロジック実装
- Day 3: Stage経路描画、レッスン改修

### Week 3: 障害物・イベント（必要に応じて）
- Day 1-2: 障害物システム
- Day 3-5: イベントシステム（大規模）

---

## ✅ 次のアクション

1. **Phase 1 (ダンスモード) から着手**
   - 最も独立した機能
   - 既存システムへの影響が少ない
   - 視覚的に面白い成果が出る

2. **段階的にコミット**
   - 各コンポーネントごとにテスト
   - レッスン改修は最後

3. **既存レッスンの互換性維持**
   - 既存の reach型レッスンは影響なし
   - 新しい型は opt-in

---

このドキュメントに基づいて、Phase 1 (ダンスモード) から実装を開始しますか？
