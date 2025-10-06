"use client";
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import BlockItem from '../../components/BlockItem';
import Stage from '../../canvas/Stage';
import { lessonMap } from '../../../content/lessons';
import { useEditorStore } from '../../editor/store';
import { useSaveStore } from '../../save/store';
import { useTelemetry } from '../../telemetry/store';
import { useAudioStore } from '../../audio/store';
import type { Block } from '../../../core/blocks/schemas';
import voice from '../../../content/voice/ja.json';

// ブロック定義（toolbox ID から Block への変換）
const createBlockFromToolbox = (id: string): Block[] => {
  switch (id) {
    case 'move_right':
      return [
        { block: 'move_right', times: 1 },
        { block: 'move_right', times: 3 },
        { block: 'move_right', times: 5 },
      ];
    case 'move_left':
      return [
        { block: 'move_left', times: 1 },
        { block: 'move_left', times: 3 },
      ];
    case 'move_up':
      return [
        { block: 'move_up', times: 1 },
        { block: 'move_up', times: 3 },
      ];
    case 'move_down':
      return [
        { block: 'move_down', times: 1 },
        { block: 'move_down', times: 3 },
      ];
    case 'repeat_n':
      return [
        { block: 'repeat_n', n: 2, children: [] },
        { block: 'repeat_n', n: 3, children: [] },
        { block: 'repeat_n', n: 5, children: [] },
      ];
    case 'play_sound':
      return [{ block: 'play_sound' }];
    case 'when_flag':
      return []; // when_flag は自動追加されるので不要
    default:
      return [];
  }
};

function EditorInner() {
  const params = useSearchParams();
  const router = useRouter();
  const lessonId = params.get('lessonId') ?? 'L1_01_go_right';
  const lesson = lessonMap[lessonId];
  const { setLesson, program, addBlock, addBlockToRepeat, removeBlock, removeLast, undo, run, reset, hint, pos, hintText, runAnimated, isRunning } = useEditorStore();
  const { startLesson, runPressed, hintTap, clearLesson } = useTelemetry();
  const saveStore = useSaveStore;
  const { muted, toggle } = useAudioStore();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!lesson) router.push('/lessons');
    else {
      setLesson(lesson);
      startLesson(lesson.id);
      // 初回レッスン時のみガイドを表示
      const hasSeenEditorGuide = localStorage.getItem('hasSeenEditorGuide');
      if (!hasSeenEditorGuide && lessonId === 'L1_01_go_right') {
        setShowGuide(true);
      }
    }
  }, [lessonId]);

  const closeGuide = () => {
    localStorage.setItem('hasSeenEditorGuide', 'true');
    setShowGuide(false);
  };

  // レッスンのtoolboxに基づいてパレットを動的生成
  const palette = useMemo(() => {
    if (!lesson) return [];
    const blocks: Block[] = [];
    for (const toolboxId of lesson.toolbox) {
      blocks.push(...createBlockFromToolbox(toolboxId));
    }
    return blocks;
  }, [lesson]);

  return (
    <main style={{ background: '#F5F7FB', minHeight: '100vh' }}>
      <TopBar muted={muted} onToggleMute={toggle} onRun={async () => {
        if (!lesson) return;

        // ブロック0個チェック
        const filteredProgram = program.filter((b) => b.block !== 'when_flag');
        if (filteredProgram.length === 0) {
          hint(voice.common.empty_program);
          return;
        }

        runPressed(lesson.id);
        const cleared = await runAnimated();
        if (cleared) {
          clearLesson(lesson.id);
          try { saveStore.getState().markCleared(lesson.id); } catch {}
          router.push(`/clear?lessonId=${encodeURIComponent(lesson.id)}`);
        } else {
          // クリアできなかった場合のヒント
          hint(voice.common.no_movement);
        }
      }} onReset={reset} onHint={() => {
        if (!lesson) return;
        hintTap(lesson.id);
        // レッスン固有のヒントがあれば表示
        const lessonHints = voice.lessons[lesson.id as keyof typeof voice.lessons];
        if (lessonHints && 'start' in lessonHints) {
          hint(lessonHints.start);
        } else {
          hint(voice.common.how_to_run);
        }
      }} />

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
            <BlockItem
              key={i}
              block={b}
              showRemove={true}
              onRemove={() => removeBlock(i)}
              onDropToRepeat={b.block === 'repeat_n' ? (child) => addBlockToRepeat(i, child) : undefined}
            />
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
            <BlockItem key={idx} block={b} onClick={() => addBlock(b)} isDraggable={true} />
          ))}
        </div>
      </section>

      {/* 実行中オーバーレイ */}
      {isRunning && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 32,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 24, color: '#4F8EF7', fontWeight: 'bold' }}>
              じっこうちゅう...
            </p>
          </div>
        </div>
      )}

      {/* 操作ガイドオーバーレイ */}
      {showGuide && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={closeGuide}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 32,
              maxWidth: 600,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 28, marginBottom: 24, color: '#4F8EF7' }}>
              つかいかた
            </h2>
            <div style={{ textAlign: 'left', fontSize: 20, lineHeight: 1.8, marginBottom: 24 }}>
              <p style={{ marginBottom: 16 }}>{voice.editor_guide.step1}</p>
              <p style={{ marginBottom: 16 }}>{voice.editor_guide.step2}</p>
              <p style={{ marginBottom: 16 }}>{voice.editor_guide.step3}</p>
              <p style={{ color: '#4F8EF7', fontWeight: 'bold' }}>{voice.editor_guide.hint_button}</p>
            </div>
            <Button onClick={closeGuide} aria-label="わかった">
              わかった！
            </Button>
          </div>
        </div>
      )}
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
