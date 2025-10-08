"use client";
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import BlockItem from '../../components/BlockItem';
import Stage from '../../canvas/Stage';
import RobotStage from '../../canvas/RobotStage';
import SubgoalList from '../../components/SubgoalList';
import ParsonsEditor from '../../components/ParsonsEditor';
import DebugEditor from '../../components/DebugEditor';
import ChallengeConstraints from '../../components/ChallengeConstraints';
import StepExecutionControls from '../../components/StepExecutionControls';
import { lessonMap } from '../../../content/lessons';
import { useEditorStore } from '../../editor/store';
import { useSaveStore } from '../../save/store';
import { useTelemetry } from '../../telemetry/store';
import { useAudioStore } from '../../audio/store';
import { useMobile } from '../../hooks/useMobile';
import type { Block } from '../../../core/blocks/schemas';
import voice from '../../../content/voice/ja.json';

// ブロック数をカウントする関数（再帰的に子ブロックもカウント）
const countBlocks = (blocks: Block[]): number => {
  let count = 0;
  for (const block of blocks) {
    if (block.block === 'when_flag') continue; // when_flagはカウントしない
    count += 1;
    if (block.block === 'repeat_n' && block.children) {
      count += countBlocks(block.children);
    }
  }
  return count;
};

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
    // Dance blocks
    case 'move_right_arm':
      return [
        { block: 'move_right_arm', angle: 45 },
        { block: 'move_right_arm', angle: 90 },
        { block: 'move_right_arm', angle: 135 },
      ];
    case 'move_left_arm':
      return [
        { block: 'move_left_arm', angle: 45 },
        { block: 'move_left_arm', angle: 90 },
        { block: 'move_left_arm', angle: 135 },
      ];
    case 'move_right_leg':
      return [
        { block: 'move_right_leg', angle: 30 },
        { block: 'move_right_leg', angle: 60 },
      ];
    case 'move_left_leg':
      return [
        { block: 'move_left_leg', angle: 30 },
        { block: 'move_left_leg', angle: 60 },
      ];
    case 'move_head':
      return [
        { block: 'move_head', angle: -30 },
        { block: 'move_head', angle: 0 },
        { block: 'move_head', angle: 30 },
      ];
    case 'pose_reset':
      return [{ block: 'pose_reset' }];
    default:
      return [];
  }
};

function EditorInner() {
  const params = useSearchParams();
  const router = useRouter();
  const isMobile = useMobile();
  const lessonId = params.get('lessonId') ?? 'L1_01_go_right';
  const lesson = lessonMap[lessonId];
  const { setLesson, program, addBlock, addBlockToRepeat, removeBlock, removeLast, undo, run, reset, hint, pos, hintText, runAnimated, isRunning, isStepMode, isPaused, currentStepIndex, currentBlockIndex, startStepMode, stepNext, stepPrevious, pauseStep, resumeStep, stopStepMode, robotPose, robotMoves, visitedPath } = useEditorStore();
  const { startLesson, runPressed, hintTap, clearLesson } = useTelemetry();
  const saveStore = useSaveStore;
  const { muted, toggle } = useAudioStore();
  const [showGuide, setShowGuide] = useState(false);
  const [codeLaneDragOver, setCodeLaneDragOver] = useState(false);
  const [completedSubgoals, setCompletedSubgoals] = useState<string[]>([]);
  const [selectedRepeatIndex, setSelectedRepeatIndex] = useState<number | null>(null);

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

      // BGMを再生
      if (typeof window !== 'undefined') {
        import('../../audio/bgm').then(({ getBGMPlayer }) => {
          const bgm = getBGMPlayer();
          bgm.play('editor', muted);
        });
      }
    }

    return () => {
      // ページを離れる時にBGMを停止
      if (typeof window !== 'undefined') {
        import('../../audio/bgm').then(({ getBGMPlayer }) => {
          getBGMPlayer().stop();
        });
      }
    };
  }, [lessonId]);

  const closeGuide = () => {
    localStorage.setItem('hasSeenEditorGuide', 'true');
    setShowGuide(false);
  };

  const showGuideAgain = () => {
    setShowGuide(true);
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
      <TopBar muted={muted} onToggleMute={toggle} onGuide={showGuideAgain} onStepMode={startStepMode} onRun={async () => {
        if (!lesson) return;

        // ブロック0個チェック
        const filteredProgram = program.filter((b) => b.block !== 'when_flag');
        if (filteredProgram.length === 0) {
          hint(voice.common.empty_program);
          return;
        }

        // ブロック数チェック
        const blockCount = countBlocks(program);
        const maxBlocks = lesson.accept?.maxBlocks;
        if (maxBlocks && blockCount > maxBlocks) {
          hint(`ブロックが おおすぎるよ！${maxBlocks}こ いかで ゴールしてね（いま ${blockCount}こ）`);
          return;
        }

        // 必須ブロックチェック
        const requiredBlocks = lesson.accept?.requiredBlocks;
        if (requiredBlocks && requiredBlocks.length > 0) {
          const usedBlocks = new Set<string>();
          const collectBlocks = (blocks: Block[]) => {
            for (const block of blocks) {
              usedBlocks.add(block.block);
              if (block.children) {
                collectBlocks(block.children);
              }
            }
          };
          collectBlocks(program);

          for (const required of requiredBlocks) {
            if (!usedBlocks.has(required)) {
              hint(`「${required}」の ブロックを つかってね！`);
              return;
            }
          }
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
      <section style={{ padding: isMobile ? 12 : 16 }}>
        {/* Robot Stage for dance lessons */}
        {lesson?.type === 'dance' && (
          <>
            <RobotStage
              pose={robotPose ?? { rightArm: 0, leftArm: 0, rightLeg: 0, leftLeg: 0, head: 0 }}
              instruction={lesson?.instruction}
              movesCount={robotMoves}
            />
            {hintText && (
              <div style={{ marginTop: 8, fontSize: isMobile ? 16 : 18, color: '#1F2430' }}>{hintText}</div>
            )}
          </>
        )}

        {/* Original Stage for grid-based lessons */}
        {lesson?.type !== 'dance' && (
          <>
            <Stage
              pos={pos}
              goal={{ x: (lesson as any)?.goal?.x ?? (lesson as any)?.goal?.endPosition?.x ?? 4, y: (lesson as any)?.goal?.y ?? (lesson as any)?.goal?.endPosition?.y ?? 1 }}
              instruction={lesson?.instruction}
              visitedPath={visitedPath}
            />
            {hintText && (
              <div style={{ marginTop: 8, fontSize: isMobile ? 16 : 18, color: '#1F2430' }}>{hintText}</div>
            )}
          </>
        )}
      </section>

      {/* Subgoals */}
      {lesson?.subgoals && lesson.subgoals.length > 0 && (
        <section style={{ padding: '0 16px' }}>
          <SubgoalList subgoals={lesson.subgoals} completedIds={completedSubgoals} />
        </section>
      )}

      {/* Challenge Constraints */}
      {lesson?.type === 'challenge' && lesson.challenge && (
        <section style={{ padding: '0 16px' }}>
          <ChallengeConstraints challenge={lesson.challenge} currentProgram={program} />
        </section>
      )}

      {/* Parsonsモード */}
      {lesson?.type === 'parsons' && lesson.parsons && (
        <section style={{ padding: '8px 16px' }}>
          <ParsonsEditor
            fragments={lesson.parsons.fragments}
            correctOrder={lesson.parsons.correctOrder}
            onCheck={(order) => {
              console.log('Current order:', order);
            }}
            onComplete={async () => {
              if (!lesson) return;
              clearLesson(lesson.id);
              try { saveStore.getState().markCleared(lesson.id); } catch {}
              router.push(`/clear?lessonId=${encodeURIComponent(lesson.id)}`);
            }}
          />
        </section>
      )}

      {/* Debugモード */}
      {lesson?.type === 'debug' && lesson.debug && (
        <section style={{ padding: '8px 16px' }}>
          <DebugEditor
            buggyCode={lesson.debug.buggyCode}
            bugType={lesson.debug.bugType}
            bugDescription={lesson.debug.bugDescription}
            onFixAttempt={(code) => {
              console.log('Fix attempt:', code);
            }}
            onComplete={async () => {
              if (!lesson) return;
              clearLesson(lesson.id);
              try { saveStore.getState().markCleared(lesson.id); } catch {}
              router.push(`/clear?lessonId=${encodeURIComponent(lesson.id)}`);
            }}
          />
        </section>
      )}

      {/* Step Execution Controls */}
      {isStepMode && (
        <section style={{ padding: isMobile ? '6px 12px' : '8px 16px' }}>
          <StepExecutionControls
            isRunning={isStepMode}
            isPaused={isPaused}
            currentStep={currentStepIndex}
            totalSteps={program.length}
            onStepForward={stepNext}
            onStepBackward={stepPrevious}
            onPlay={resumeStep}
            onPause={pauseStep}
            onReset={stopStepMode}
          />
        </section>
      )}

      {/* Code lane (drill/danceモード) */}
      {(!lesson?.type || lesson.type === 'drill' || lesson.type === 'dance') && (
        <section style={{ padding: isMobile ? '6px 12px' : '8px 16px' }}>
          <div style={{ fontSize: isMobile ? 16 : 18, margin: isMobile ? '6px 0' : '8px 0' }}>こーど</div>
          <div
          onDragOver={(e) => {
            e.preventDefault();
            setCodeLaneDragOver(true);
          }}
          onDragLeave={() => {
            setCodeLaneDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setCodeLaneDragOver(false);
          }}
          style={{
            height: isMobile ? 100 : 140,
            borderRadius: isMobile ? 8 : 12,
            background: codeLaneDragOver ? '#E3F2FD' : '#fff',
            boxShadow: codeLaneDragOver ? 'inset 0 0 0 3px #4F8EF7' : 'inset 0 0 0 2px #E5EAF3',
            display: 'flex',
            alignItems: 'center',
            overflowX: 'auto',
            gap: isMobile ? 6 : 8,
            padding: isMobile ? 6 : 8,
            transition: 'background 0.2s, box-shadow 0.2s',
          }}>
          {program.map((b, i) => (
            <BlockItem
              key={i}
              block={b}
              showRemove={true}
              onRemove={() => removeBlock(i)}
              onDropToRepeat={b.block === 'repeat_n' ? (child) => addBlockToRepeat(i, child) : undefined}
              isCurrentBlock={isStepMode && currentBlockIndex === i}
              isSelected={selectedRepeatIndex === i}
              onClick={b.block === 'repeat_n' ? () => {
                if (selectedRepeatIndex === i) {
                  setSelectedRepeatIndex(null);
                } else {
                  setSelectedRepeatIndex(i);
                  hint('つぎに タップした ブロックを くりかえしの なかに いれるよ！');
                }
              } : undefined}
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
      )}

      {/* Palette (drill/danceモード) */}
      {(!lesson?.type || lesson.type === 'drill' || lesson.type === 'dance') && (
        <section style={{ padding: isMobile ? '6px 12px 16px' : '8px 16px 24px' }}>
          <div style={{ fontSize: isMobile ? 16 : 18, margin: isMobile ? '6px 0' : '8px 0' }}>
            ぶろっく
            {selectedRepeatIndex !== null && (
              <span style={{ marginLeft: 8, color: '#4F8EF7', fontSize: isMobile ? 14 : 16 }}>
                （くりかえしに いれるモード）
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 6 : 8, overflowX: 'auto', paddingBottom: isMobile ? 6 : 8 }}>
            {palette.map((b, idx) => (
              <BlockItem
                key={idx}
                block={b}
                onClick={() => {
                  if (selectedRepeatIndex !== null && b.block !== 'repeat_n') {
                    addBlockToRepeat(selectedRepeatIndex, b);
                    setSelectedRepeatIndex(null);
                    hint('くりかえしに ブロックを いれたよ！');
                  } else {
                    addBlock(b);
                  }
                }}
                isDraggable={!isMobile}
              />
            ))}
          </div>
        </section>
      )}

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
              📖 つかいかた
            </h2>
            <div style={{ textAlign: 'left', fontSize: 20, lineHeight: 1.8, marginBottom: 24 }}>
              <div style={{ marginBottom: 20, padding: 16, background: '#E3F2FD', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1F2430' }}>
                  1️⃣ {voice.editor_guide.step1.split('。')[0]}
                </div>
                <div style={{ fontSize: 18, color: '#666' }}>
                  したの「ぶろっく」から すきな ブロックを えらんで タップしてね
                </div>
              </div>
              <div style={{ marginBottom: 20, padding: 16, background: '#FFF3E0', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1F2430' }}>
                  2️⃣ {voice.editor_guide.step2.split('。')[0]}
                </div>
                <div style={{ fontSize: 18, color: '#666' }}>
                  ▶ボタンを おして プログラムを うごかそう
                </div>
              </div>
              <div style={{ marginBottom: 20, padding: 16, background: '#E8F5E9', borderRadius: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#1F2430' }}>
                  3️⃣ {voice.editor_guide.step3.split('。')[0]}
                </div>
                <div style={{ fontSize: 18, color: '#666' }}>
                  ネコさんが ゴールに ついたら クリア！🎉
                </div>
              </div>
              <div style={{ padding: 16, background: '#F3E5F5', borderRadius: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#9C27B0' }}>
                  💡 こまったら
                </div>
                <div style={{ fontSize: 18, color: '#666' }}>
                  みぎうえの 💡ボタンを おすと ヒントが でるよ！<br/>
                  📖ボタンを おすと いつでも この がめんに もどれるよ
                </div>
              </div>
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
