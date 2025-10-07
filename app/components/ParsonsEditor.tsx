"use client";
import React, { useState } from 'react';
import type { Block } from '../../core/blocks/schemas';
import BlockItem from './BlockItem';

type Props = {
  fragments: Block[];
  correctOrder: number[];
  onCheck: (currentOrder: number[]) => void;
  onComplete: () => void;
};

export default function ParsonsEditor({ fragments, correctOrder, onCheck, onComplete }: Props) {
  const [shuffledFragments] = useState(() => {
    // 初期状態でシャッフル
    const indices = fragments.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.map(i => ({ block: fragments[i], originalIndex: i }));
  });

  const [workArea, setWorkArea] = useState<typeof shuffledFragments>([]);
  const [palette, setPalette] = useState(shuffledFragments);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const moveToWork = (index: number) => {
    const item = palette[index];
    setWorkArea([...workArea, item]);
    setPalette(palette.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const moveToPalette = (index: number) => {
    const item = workArea[index];
    setPalette([...palette, item]);
    setWorkArea(workArea.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newWork = [...workArea];
    [newWork[index - 1], newWork[index]] = [newWork[index], newWork[index - 1]];
    setWorkArea(newWork);
    setFeedback(null);
  };

  const moveDown = (index: number) => {
    if (index === workArea.length - 1) return;
    const newWork = [...workArea];
    [newWork[index], newWork[index + 1]] = [newWork[index + 1], newWork[index]];
    setWorkArea(newWork);
    setFeedback(null);
  };

  const checkAnswer = () => {
    const currentOrder = workArea.map(item => item.originalIndex);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctOrder);

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    onCheck(currentOrder);

    if (isCorrect) {
      // 効果音再生
      if (typeof window !== 'undefined') {
        import('../audio/sink').then(({ createWebAudioSink }) => {
          const audio = createWebAudioSink();
          audio.play('goal');
        }).catch(() => {});
      }

      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 説明 */}
      <div style={{
        background: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        fontSize: 18,
        color: '#1F2430',
      }}>
        📝 ブロックを ただしい じゅんばんに ならべてね！
      </div>

      {/* 作業エリア */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        minHeight: 200,
        boxShadow: feedback === 'correct' ? '0 0 0 3px #4CAF50' :
                   feedback === 'incorrect' ? '0 0 0 3px #E5484D' :
                   'inset 0 0 0 2px #E5EAF3',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2430' }}>
          ⬇️ ここに ならべよう
        </div>
        {workArea.length === 0 ? (
          <div style={{ fontSize: 16, color: '#999', textAlign: 'center', padding: 32 }}>
            したから ブロックを えらんでね
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workArea.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 20, color: '#666', minWidth: 30 }}>{idx + 1}.</div>
                <div style={{ flex: 1 }}>
                  <BlockItem block={item.block} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    style={{
                      padding: '8px 12px',
                      fontSize: 16,
                      border: 'none',
                      borderRadius: 8,
                      background: idx === 0 ? '#E5EAF3' : '#4F8EF7',
                      color: idx === 0 ? '#999' : '#fff',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === workArea.length - 1}
                    style={{
                      padding: '8px 12px',
                      fontSize: 16,
                      border: 'none',
                      borderRadius: 8,
                      background: idx === workArea.length - 1 ? '#E5EAF3' : '#4F8EF7',
                      color: idx === workArea.length - 1 ? '#999' : '#fff',
                      cursor: idx === workArea.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => moveToPalette(idx)}
                    style={{
                      padding: '8px 12px',
                      fontSize: 16,
                      border: 'none',
                      borderRadius: 8,
                      background: '#E5484D',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* パレット */}
      <div style={{
        background: '#F5F7FB',
        borderRadius: 12,
        padding: 16,
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2430' }}>
          🧩 ブロック
        </div>
        {palette.length === 0 ? (
          <div style={{ fontSize: 16, color: '#999', textAlign: 'center', padding: 16 }}>
            すべて つかったよ！
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {palette.map((item, idx) => (
              <div key={idx} onClick={() => moveToWork(idx)} style={{ cursor: 'pointer' }}>
                <BlockItem block={item.block} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* チェックボタン */}
      <button
        onClick={checkAnswer}
        disabled={workArea.length === 0}
        style={{
          padding: '16px 32px',
          fontSize: 20,
          fontWeight: 'bold',
          border: 'none',
          borderRadius: 12,
          background: workArea.length === 0 ? '#E5EAF3' : '#4F8EF7',
          color: workArea.length === 0 ? '#999' : '#fff',
          cursor: workArea.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        ✓ チェック
      </button>

      {/* フィードバック */}
      {feedback && (
        <div style={{
          padding: 16,
          borderRadius: 12,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
          background: feedback === 'correct' ? '#E8F5E9' : '#FFEBEE',
          color: feedback === 'correct' ? '#4CAF50' : '#E5484D',
        }}>
          {feedback === 'correct' ? '🎉 せいかい！' : '❌ もういちど やってみよう'}
        </div>
      )}
    </div>
  );
}
