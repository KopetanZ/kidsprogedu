import { describe, it, expect } from 'vitest';
import { Runtime } from '../core/engine/runtime';

describe('VM basic execution', () => {
  it('runs when_flag -> move_right x3 to reach x=4', () => {
    const r = new Runtime({ goal: { x: 4, y: 1 } });
    const program = [
      { block: 'when_flag' },
      { block: 'move_right', times: 3 },
    ];
    r.load(program as any);
    const res = r.runUntilIdle(100);
    expect(res).toBe('ok');
    const s = r.getState();
    expect(s.pos.x).toBe(4);
    expect(s.pos.y).toBe(1);
  });

  it('repeat_n executes children n times', () => {
    const r = new Runtime({ goal: { x: 6, y: 1 } });
    const program = [
      { block: 'when_flag' },
      { block: 'repeat_n', n: 3, children: [{ block: 'move_right', times: 1 }] },
    ];
    r.load(program as any);
    r.runUntilIdle(100);
    const s = r.getState();
    expect(s.pos.x).toBe(4); // start 1 + 3 = 4
  });

  it('play_sound emits audio event', () => {
    const r = new Runtime({ goal: { x: 1, y: 1 } });
    const program = [
      { block: 'when_flag' },
      { block: 'play_sound' },
    ];
    r.load(program as any);
    r.runUntilIdle(10);
    const audio = r.getAudio();
    expect(audio.events.length).toBeGreaterThanOrEqual(1);
    expect(audio.events[0].type).toBe('play_sound');
  });
});

