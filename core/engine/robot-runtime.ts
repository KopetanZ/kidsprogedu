import type { Block } from '../blocks/schemas';
import type { AudioSink } from './audio';
import { createMemoryAudioSink } from './audio';

export type RobotPose = {
  rightArm: number;  // 0-180 degrees
  leftArm: number;   // 0-180 degrees
  rightLeg: number;  // 0-90 degrees
  leftLeg: number;   // 0-90 degrees
  head: number;      // -45 to 45 degrees
};

export type DanceGoal = {
  type: 'dance';
  minMoves: number;
  requireSound: boolean;
};

export type RobotState = {
  pose: RobotPose;
  moves: number;
  soundPlayed: boolean;
  running: boolean;
};

type SeqFrame = { kind: 'seq'; nodes: Block[]; index: number };
type RepeatFrame = { kind: 'repeat'; nodes: Block[]; remaining: number; index: number };
type Frame = SeqFrame | RepeatFrame;

export type RobotRuntimeOptions = {
  goal: DanceGoal;
  audio?: AudioSink;
  maxInstructionsPerTick?: number;
};

export class RobotRuntime {
  private program: Block[] = [];
  private state: RobotState;
  private frames: Frame[] = [];
  private goal: DanceGoal;
  private maxPerTick: number;
  private audio: AudioSink;
  private executedThisTick: number = 0;

  constructor(opts: RobotRuntimeOptions) {
    this.goal = opts.goal;
    this.maxPerTick = opts.maxInstructionsPerTick ?? 16;
    this.audio = opts.audio ?? createMemoryAudioSink();

    this.state = {
      pose: {
        rightArm: 0,
        leftArm: 0,
        rightLeg: 0,
        leftLeg: 0,
        head: 0,
      },
      moves: 0,
      soundPlayed: false,
      running: false,
    };
  }

  load(program: Block[]) {
    this.program = program.slice();
    const startIndex = this.program.findIndex((b) => b.block === 'when_flag');
    const seq = startIndex >= 0 ? this.program.slice(startIndex + 1) : [];
    this.frames = [{ kind: 'seq', nodes: seq, index: 0 }];
    this.state.running = true;
  }

  getState(): Readonly<RobotState> {
    return this.state;
  }

  step(): void {
    if (!this.state.running) return;
    this.executedThisTick = 0;

    while (this.executedThisTick < this.maxPerTick && this.state.running) {
      if (this.frames.length === 0) {
        this.state.running = false;
        break;
      }

      const frame = this.frames[this.frames.length - 1]!;
      if (frame.kind === 'seq') {
        const node = frame.nodes[frame.index];
        if (!node) {
          this.frames.pop();
          continue;
        }
        frame.index += 1;
        this.executeNode(node);
      } else if (frame.kind === 'repeat') {
        const node = frame.nodes[frame.index];
        if (!node) {
          frame.remaining -= 1;
          if (frame.remaining > 0) {
            frame.index = 0;
          } else {
            this.frames.pop();
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
      case 'move_right_arm': {
        const angle = node.angle ?? 90;
        this.state.pose.rightArm = Math.max(0, Math.min(180, angle));
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'move_left_arm': {
        const angle = node.angle ?? 90;
        this.state.pose.leftArm = Math.max(0, Math.min(180, angle));
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'move_right_leg': {
        const angle = node.angle ?? 45;
        this.state.pose.rightLeg = Math.max(0, Math.min(90, angle));
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'move_left_leg': {
        const angle = node.angle ?? 45;
        this.state.pose.leftLeg = Math.max(0, Math.min(90, angle));
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'move_head': {
        const angle = node.angle ?? 0;
        this.state.pose.head = Math.max(-45, Math.min(45, angle));
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'pose_reset': {
        this.state.pose = {
          rightArm: 0,
          leftArm: 0,
          rightLeg: 0,
          leftLeg: 0,
          head: 0,
        };
        this.state.moves++;
        this.executedThisTick++;
        break;
      }
      case 'repeat_n': {
        const n = node.n ?? 2;
        const children = node.children ?? [];
        if (children.length > 0 && n > 0) {
          this.frames.push({ kind: 'repeat', nodes: children, remaining: n, index: 0 });
        }
        break;
      }
      case 'play_sound':
        this.audio?.play();
        this.state.soundPlayed = true;
        this.executedThisTick++;
        break;
      case 'when_flag':
        // Ignore at runtime
        break;
      default:
        this.executedThisTick++;
    }
  }

  checkComplete(): boolean {
    if (this.state.running) return false;

    const meetsMinMoves = this.state.moves >= this.goal.minMoves;
    const meetsSound = !this.goal.requireSound || this.state.soundPlayed;

    return meetsMinMoves && meetsSound;
  }
}
