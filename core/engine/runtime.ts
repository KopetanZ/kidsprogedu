import type { Block } from '../blocks/schemas';
import { VM, type VMState } from './vm';
import { createMemoryAudioSink, type AudioSink } from './audio';

export type RuntimeOptions = {
  goal: { type: 'reach'; x: number; y: number } | { type: 'path'; endPosition: { x: number; y: number }; requiredPath?: { x: number; y: number }[]; pathPattern?: 'spiral' | 'zigzag' | 'square' | 'custom' };
  audio?: AudioSink;
  maxInstructionsPerTick?: number;
};

export class Runtime {
  private vm: VM;
  private audio: AudioSink;
  private goalConfig: RuntimeOptions['goal'];

  constructor(opts: RuntimeOptions) {
    this.audio = opts.audio ?? createMemoryAudioSink();
    this.goalConfig = opts.goal;
    // Pass the appropriate position to VM based on goal type
    const goalPos = opts.goal.type === 'reach' ? { x: opts.goal.x, y: opts.goal.y } : opts.goal.endPosition;
    this.vm = new VM({ goal: goalPos, audio: this.audio, maxInstructionsPerTick: opts.maxInstructionsPerTick });
  }

  load(program: Block[]) {
    this.vm.load(program);
  }

  step() {
    this.vm.step();
  }

  runUntilIdle(maxTicks?: number) {
    return this.vm.runUntilIdle(maxTicks);
  }

  getState(): Readonly<VMState> {
    return this.vm.getState();
  }

  getAudio(): AudioSink { return this.audio; }

  /**
   * Check if the goal is complete (position reached + path validation if required)
   */
  checkComplete(): boolean {
    const state = this.vm.getState();
    const reachedGoal = state.pos.x === state.goal.x && state.pos.y === state.goal.y;

    if (this.goalConfig.type === 'reach') {
      return reachedGoal;
    }

    if (this.goalConfig.type === 'path') {
      if (!reachedGoal) return false;

      // If required path is specified, check exact match
      if (this.goalConfig.requiredPath && this.goalConfig.requiredPath.length > 0) {
        return this.validateRequiredPath(state.visitedPath ?? [], this.goalConfig.requiredPath);
      }

      // If pattern is specified, validate pattern
      if (this.goalConfig.pathPattern && this.goalConfig.pathPattern !== 'custom') {
        return this.validatePathPattern(state.visitedPath ?? [], this.goalConfig.pathPattern);
      }

      // Otherwise just reaching the end is enough
      return true;
    }

    return false;
  }

  private validateRequiredPath(visited: { x: number; y: number }[], required: { x: number; y: number }[]): boolean {
    if (visited.length !== required.length) return false;
    return visited.every((pos, i) => pos.x === required[i]!.x && pos.y === required[i]!.y);
  }

  private validatePathPattern(visited: { x: number; y: number }[], pattern: 'spiral' | 'zigzag' | 'square'): boolean {
    if (visited.length < 2) return false;

    switch (pattern) {
      case 'spiral': {
        // Spiral pattern: gradually expanding outward from center
        // Check that distance from starting point generally increases
        const start = visited[0]!;
        let maxDist = 0;
        let decreaseCount = 0;

        for (let i = 1; i < visited.length; i++) {
          const pos = visited[i]!;
          const dist = Math.abs(pos.x - start.x) + Math.abs(pos.y - start.y);
          if (dist < maxDist) {
            decreaseCount++;
          } else {
            maxDist = dist;
          }
        }

        // Allow some backtracking but not too much
        return decreaseCount < visited.length * 0.3;
      }

      case 'zigzag': {
        // Zigzag pattern: alternating direction changes
        // Count direction changes
        let directionChanges = 0;
        for (let i = 1; i < visited.length - 1; i++) {
          const prev = visited[i - 1]!;
          const curr = visited[i]!;
          const next = visited[i + 1]!;

          const dir1 = { x: curr.x - prev.x, y: curr.y - prev.y };
          const dir2 = { x: next.x - curr.x, y: next.y - curr.y };

          // Check if direction changed
          if (dir1.x !== dir2.x || dir1.y !== dir2.y) {
            directionChanges++;
          }
        }

        // Zigzag should have frequent direction changes (at least 30% of moves)
        return directionChanges >= (visited.length - 2) * 0.3;
      }

      case 'square': {
        // Square pattern: forms a rectangular path
        // Check that we return close to starting position and have 4 corners
        const start = visited[0]!;
        const end = visited[visited.length - 1]!;
        const distToStart = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);

        // Should return close to start
        if (distToStart > 2) return false;

        // Count 90-degree turns (corners)
        let corners = 0;
        for (let i = 1; i < visited.length - 1; i++) {
          const prev = visited[i - 1]!;
          const curr = visited[i]!;
          const next = visited[i + 1]!;

          const dir1 = { x: curr.x - prev.x, y: curr.y - prev.y };
          const dir2 = { x: next.x - curr.x, y: next.y - curr.y };

          // Check for 90-degree turn (perpendicular directions)
          if ((dir1.x !== 0 && dir2.y !== 0) || (dir1.y !== 0 && dir2.x !== 0)) {
            corners++;
          }
        }

        // Square should have at least 3-4 corners
        return corners >= 3;
      }

      default:
        return true;
    }
  }
}
