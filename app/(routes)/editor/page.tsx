"use client";
import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import Stage from '../../canvas/Stage';
import { lessonMap } from '../../../content/lessons';
import { useEditorStore } from '../../editor/store';
import { useSaveStore } from '../../save/store';
import { useTelemetry } from '../../telemetry/store';
import { useAudioStore } from '../../audio/store';
import type { Block } from '../../../core/blocks/schemas';
import voice from '../../../content/voice/ja.json';

const moveBlocks: Block[] = [
  { block: 'move_right', times: 1 },
  { block: 'move_right', times: 3 },
  { block: 'move_right', times: 5 },
  { block: 'move_up', times: 1 },
  { block: 'move_down', times: 1 },
  { block: 'play_sound' },
];

function EditorInner() {
  const params = useSearchParams();
  const router = useRouter();
  const lessonId = params.get('lessonId') ?? 'L1_01_go_right';
  const lesson = lessonMap[lessonId];
  const { setLesson, program, addBlock, removeLast, undo, run, reset, hint, pos, hintText, runAnimated } = useEditorStore();
  const { startLesson, runPressed, hintTap, clearLesson } = useTelemetry();
  const saveStore = useSaveStore;
  const { muted, toggle } = useAudioStore();

  useEffect(() => {
    if (!lesson) router.push('/lessons');
    else { setLesson(lesson); startLesson(lesson.id); }
  }, [lessonId]);

  const palette = useMemo(() => moveBlocks, []);

  return (
    <main style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      <TopBar muted={muted} onToggleMute={toggle} onRun={async () => {
        if (!lesson) return;
        runPressed(lesson.id);
        const cleared = await runAnimated();
        if (cleared) {
          clearLesson(lesson.id);
          try { saveStore.getState().markCleared(lesson.id); } catch {}
          router.push('/clear');
        }
      }} onReset={reset} onHint={() => { if (lesson) hintTap(lesson.id); hint(voice.common.how_to_run); }} />

      {/* Stage */}
      <section style={{ padding: 16 }}>
        <Stage pos={pos} goal={lesson?.goal ?? { x: 4, y: 1 }} />
        {hintText && (
          <div style={{ marginTop: 8, fontSize: 18, color: '#1F2430' }}>{hintText}</div>
        )}
      </section>

      {/* Code lane */}
      <section style={{ padding: '8px 16px' }}>
        <div style={{ fontSize: 18, margin: '8px 0' }}>こーど</div>
        <div style={{
          height: 140,
          borderRadius: 12,
          background: '#fff',
          boxShadow: 'inset 0 0 0 2px #E5EAF3',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          gap: 8,
          padding: 8,
        }}>
          {program.map((b, i) => (
            <div key={i} style={{
              minWidth: 120,
              height: 56,
              borderRadius: 12,
              background: '#DDEBFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1F2430', fontSize: 18,
            }}>
              {labelOf(b)}
            </div>
          ))}
          <Button aria-label="けす" variant="ghost" onClick={removeLast}>
            けす
          </Button>
          <Button aria-label="とりけし" variant="ghost" onClick={undo}>
            ⟲
          </Button>
        </div>
      </section>

      {/* Palette */}
      <section style={{ padding: '8px 16px 24px' }}>
        <div style={{ fontSize: 18, margin: '8px 0' }}>ぶろっく</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
          {palette.map((b, idx) => (
            <Button key={idx} aria-label={labelOf(b)} onClick={() => addBlock(b)}>
              {labelOf(b)}
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={null}>
      <EditorInner />
    </Suspense>
  );
}

function labelOf(b: Block): string {
  switch (b.block) {
    case 'move_right':
      return `みぎへ ${b.times ?? 1}`;
    case 'move_left':
      return `ひだりへ ${b.times ?? 1}`;
    case 'move_up':
      return `うえへ ${b.times ?? 1}`;
    case 'move_down':
      return `したへ ${b.times ?? 1}`;
    case 'repeat_n':
      return `くりかえす ${b.n ?? 2}`;
    case 'play_sound':
      return 'おと';
    default:
      return b.block;
  }
}
