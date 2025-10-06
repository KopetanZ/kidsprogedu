import { describe, it, expect } from 'vitest';
import { useEditorStore } from '../app/editor/store';
import { lessonMap } from '../content/lessons';

describe('Editor store run()', () => {
  it('clears L1_01 when adding move_right x3', () => {
    const s = useEditorStore.getState();
    const lesson = lessonMap['L1_01_go_right'];
    expect(lesson).toBeTruthy();
    useEditorStore.getState().setLesson(lesson);
    useEditorStore.getState().addBlock({ block: 'move_right', times: 3 });
    const cleared = useEditorStore.getState().run();
    expect(cleared).toBe(true);
  });
});

