import { HRMInstruction, HRMProgram } from './schemas';

export type Hand = number | undefined;

export type HrmState = {
  pc: number;
  hand: Hand;
  floor: (number | undefined)[];
  inbox: number[];
  outbox: number[];
  halted: boolean;
  steps: number;
  labels: Map<string, number>;
};

export function buildLabels(program: HRMProgram): Map<string, number> {
  const map = new Map<string, number>();
  program.instructions.forEach((ins, idx) => {
    if (ins.op === 'label' && ins.label) map.set(ins.label, idx);
  });
  return map;
}

export function createState(program: HRMProgram, inbox: number[], floorSize = 8): HrmState {
  return {
    pc: 0,
    hand: undefined,
    floor: Array.from({ length: floorSize }, () => undefined),
    inbox: [...inbox],
    outbox: [],
    halted: false,
    steps: 0,
    labels: buildLabels(program),
  };
}

export type StepResult = { state: HrmState; done: boolean; reason?: string };

export function step(program: HRMProgram, state: HrmState): StepResult {
  if (state.halted) return { state, done: true, reason: 'halted' };
  if (state.pc < 0 || state.pc >= program.instructions.length)
    return { state: { ...state, halted: true }, done: true, reason: 'pc_oob' };

  const ins: HRMInstruction = program.instructions[state.pc]!;

  const next = { ...state, steps: state.steps + 1 } as HrmState;

  switch (ins.op) {
    case 'label': {
      next.pc += 1;
      break;
    }
    case 'inbox': {
      if (next.inbox.length === 0) return { state: { ...next, halted: true }, done: true, reason: 'empty_inbox' };
      next.hand = next.inbox.shift();
      next.pc += 1;
      break;
    }
    case 'outbox': {
      if (next.hand === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'hand_empty' };
      next.outbox.push(next.hand);
      next.hand = undefined;
      next.pc += 1;
      break;
    }
    case 'copyfrom': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      const v = next.floor[i];
      if (v === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_undefined' };
      next.hand = v;
      next.pc += 1;
      break;
    }
    case 'copyto': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      if (next.hand === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'hand_empty' };
      next.floor = next.floor.slice();
      next.floor[i] = next.hand;
      next.pc += 1;
      break;
    }
    case 'add': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      if (next.hand === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'hand_empty' };
      const v = next.floor[i];
      if (v === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_undefined' };
      next.hand = next.hand + v;
      next.pc += 1;
      break;
    }
    case 'sub': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      if (next.hand === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'hand_empty' };
      const v = next.floor[i];
      if (v === undefined)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_undefined' };
      next.hand = next.hand - v;
      next.pc += 1;
      break;
    }
    case 'bump_up': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      const v = (next.floor[i] ?? 0) + 1;
      next.floor = next.floor.slice();
      next.floor[i] = v;
      next.hand = v;
      next.pc += 1;
      break;
    }
    case 'bump_down': {
      const i = ins.addr ?? -1;
      if (i < 0 || i >= next.floor.length)
        return { state: { ...next, halted: true }, done: true, reason: 'addr_oob' };
      const v = (next.floor[i] ?? 0) - 1;
      next.floor = next.floor.slice();
      next.floor[i] = v;
      next.hand = v;
      next.pc += 1;
      break;
    }
    case 'jump': {
      const t = ins.target ?? '';
      const dst = next.labels.get(t);
      if (dst === undefined) return { state: { ...next, halted: true }, done: true, reason: 'label_undef' };
      next.pc = dst;
      break;
    }
    case 'jump_if_zero': {
      const t = ins.target ?? '';
      const dst = next.labels.get(t);
      if (dst === undefined) return { state: { ...next, halted: true }, done: true, reason: 'label_undef' };
      if (next.hand === 0) next.pc = dst; else next.pc += 1;
      break;
    }
    case 'jump_if_neg': {
      const t = ins.target ?? '';
      const dst = next.labels.get(t);
      if (dst === undefined) return { state: { ...next, halted: true }, done: true, reason: 'label_undef' };
      if ((next.hand ?? 0) < 0) next.pc = dst; else next.pc += 1;
      break;
    }
    default: {
      return { state: { ...next, halted: true }, done: true, reason: 'unknown_op' };
    }
  }

  return { state: next, done: false };
}
