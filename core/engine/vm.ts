import type { Block } from '../blocks/schemas';
import { clampToGrid, type Grid, type Position } from './physics';
import type { AudioSink } from './audio';

export type VMOptions = {
  grid?: Grid; // default 8x5
  start?: Position; // default {1,1}
  goal: Position;
  maxInstructionsPerTick?: number; // default 16
  audio?: AudioSink;
};

type SeqFrame = { kind: 'seq'; nodes: Block[]; index: number };
type RepeatFrame = { kind: 'repeat'; nodes: Block[]; remaining: number; index: number };
type Frame = SeqFrame | RepeatFrame;

export type VMState = {
  pos: Position;
  goal: Position;
  grid: Grid;
  running: boolean;
  frames: Frame[];
  executedThisTick: number;
};

export class VM {
  private program: Block[] = [];
  private state: VMState;
  private maxPerTick: number;
  private audio?: AudioSink;

  constructor(opts: VMOptions) {
    const grid = opts.grid ?? { width: 8, height: 5 };
    const start = opts.start ?? { x: 1, y: 1 };
    this.maxPerTick = opts.maxInstructionsPerTick ?? 16;
    this.audio = opts.audio;
    this.state = {
      pos: clampToGrid(start, grid),
      goal: opts.goal,
      grid,
      running: false,
      frames: [],
      executedThisTick: 0,
    };
  }

  load(program: Block[]) {
    this.program = program.slice();
    // Start execution after first when_flag in top-level sequence.
    const startIndex = this.program.findIndex((b) => b.block === 'when_flag');
    const seq = startIndex >= 0 ? this.program.slice(startIndex + 1) : [];
    this.state.frames = [{ kind: 'seq', nodes: seq, index: 0 }];
    this.state.running = true;
  }

  getState(): Readonly<VMState> {
    return this.state;
  }

  collideGoal(x: number, y: number): boolean {
    return x === this.state.goal.x && y === this.state.goal.y;
  }

  step(): void {
    if (!this.state.running) return;
    this.state.executedThisTick = 0;

    while (this.state.executedThisTick < this.maxPerTick && this.state.running) {
      if (this.state.frames.length === 0) {
        this.state.running = false;
        break;
      }

      const frame = this.state.frames[this.state.frames.length - 1]!;
      if (frame.kind === 'seq') {
        const node = frame.nodes[frame.index];
        if (!node) {
          // end of sequence
          this.state.frames.pop();
          continue;
        }
        // advance index by default; some nodes push frames
        frame.index += 1;
        this.executeNode(node);
      } else if (frame.kind === 'repeat') {
        const node = frame.nodes[frame.index];
        if (!node) {
          // reached end of child sequence
          frame.remaining -= 1;
          if (frame.remaining > 0) {
            frame.index = 0; // repeat again
          } else {
            this.state.frames.pop(); // done with repeat
          }
          continue;
        }
        frame.index += 1;
        this.executeNode(node);
      }
    }
  }

  runUntilIdle(maxTicks = 1024): 'ok' | 'limit' {
    let ticks = 0;
    while (this.state.running && ticks < maxTicks) {
      this.step();
      ticks += 1;
    }
    return this.state.running ? 'limit' : 'ok';
  }

  private executeNode(node: Block) {
    switch (node.block) {
      case 'move_right':
        this.moveNTimes({ dx: 1, dy: 0 }, node.times ?? 1);
        break;
      case 'move_left':
        this.moveNTimes({ dx: -1, dy: 0 }, node.times ?? 1);
        break;
      case 'move_up':
        this.moveNTimes({ dx: 0, dy: -1 }, node.times ?? 1);
        break;
      case 'move_down':
        this.moveNTimes({ dx: 0, dy: 1 }, node.times ?? 1);
        break;
      case 'repeat_n': {
        const n = node.n ?? 2;
        const children = node.children ?? [];
        if (children.length > 0 && n > 0) {
          this.state.frames.push({ kind: 'repeat', nodes: children, remaining: n, index: 0 });
        }
        break;
      }
      case 'play_sound':
        this.audio?.play();
        this.state.executedThisTick += 1; // counts as one instruction
        break;
      case 'if_touch_goal': {
        // Execute next one node only if currently at goal; we consume one more instruction if we execute child
        // In this simplified model, if_touch_goal should be represented as a node followed immediately by the target node in the same sequence
        // We cannot easily peek next here because we lost context; therefore, support only inside repeat/seq frames via a shim:
        // Implement as no-op here; this will be enhanced later when parser flattens pairs.
        // For MVP scope, this block is out-of-scope of DoD.
        this.state.executedThisTick += 1;
        break;
      }
      case 'say':
        // Non-blocking UI effect; count as one instruction
        this.state.executedThisTick += 1;
        break;
      case 'when_flag':
        // Runtime ignore (handled at load)
        break;
      default:
        this.state.executedThisTick += 1;
    }
  }

  private moveNTimes(delta: { dx: number; dy: number }, times: number) {
    const steps = Math.max(0, times | 0);
    for (let i = 0; i < steps && this.state.executedThisTick < this.maxPerTick; i++) {
      const next = { x: this.state.pos.x + delta.dx, y: this.state.pos.y + delta.dy };
      this.state.pos = clampToGrid(next, this.state.grid);
      this.state.executedThisTick += 1;
    }
  }
}
