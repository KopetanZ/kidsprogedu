import type { Block } from '../blocks/schemas';
import { VM, type VMState } from './vm';
import { createMemoryAudioSink, type AudioSink } from './audio';

export type RuntimeOptions = {
  goal: { x: number; y: number };
  audio?: AudioSink;
  maxInstructionsPerTick?: number;
};

export class Runtime {
  private vm: VM;
  private audio: AudioSink;
  constructor(opts: RuntimeOptions) {
    this.audio = opts.audio ?? createMemoryAudioSink();
    this.vm = new VM({ goal: opts.goal, audio: this.audio, maxInstructionsPerTick: opts.maxInstructionsPerTick });
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
}
