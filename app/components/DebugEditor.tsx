"use client";
import React, { useState } from 'react';
import type { Block } from '../../core/blocks/schemas';
import BlockItem from './BlockItem';

type Props = {
  buggyCode: Block[];
  bugType: string;
  bugDescription: string;
  onFixAttempt: (fixedCode: Block[]) => void;
  onComplete: () => void;
};

export default function DebugEditor({ buggyCode, bugType, bugDescription, onFixAttempt, onComplete }: Props) {
  const [code, setCode] = useState<Block[]>(buggyCode);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const removeBlock = (index: number) => {
    setCode(code.filter((_, i) => i !== index));
    setFeedback(null);
  };

  const checkFix = () => {
    onFixAttempt(code);

    // 簡易的な検証（実際はもっと複雑なロジックが必要）
    const hasBug = checkForBug(code);

    setFeedback(hasBug ? 'incorrect' : 'correct');

    if (!hasBug) {
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

  const checkForBug = (blocks: Block[]): boolean => {
    // バグタイプに応じた検証ロジック
    // ここでは簡易実装
    return blocks.length === buggyCode.length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 説明 */}
      <div style={{
        background: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        fontSize: 18,
        color: '#1F2430',
      }}>
        🐛 バグが あるよ！なおして あげよう
      </div>

      {/* バグの説明 */}
      <div style={{
        background: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        border: '2px solid #E5484D',
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#E5484D' }}>
          ⚠️ もんだい
        </div>
        <div style={{ fontSize: 16, color: '#1F2430' }}>
          {bugDescription}
        </div>
      </div>

      {/* コードエリア */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 16,
        boxShadow: feedback === 'correct' ? '0 0 0 3px #4CAF50' :
                   feedback === 'incorrect' ? '0 0 0 3px #E5484D' :
                   'inset 0 0 0 2px #E5EAF3',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2430' }}>
          📝 コード
        </div>
        {code.length === 0 ? (
          <div style={{ fontSize: 16, color: '#999', textAlign: 'center', padding: 32 }}>
            ブロックが なくなっちゃった！
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {code.map((block, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ fontSize: 20, color: '#666', minWidth: 30 }}>{idx + 1}.</div>
                <div style={{ flex: 1 }}>
                  <BlockItem block={block} showRemove={true} onRemove={() => removeBlock(idx)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ヒントボタン */}
      <button
        onClick={() => setShowHint(!showHint)}
        style={{
          padding: '12px 24px',
          fontSize: 18,
          border: '2px solid #4F8EF7',
          borderRadius: 12,
          background: '#fff',
          color: '#4F8EF7',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        💡 {showHint ? 'ヒントを とじる' : 'ヒントを みる'}
      </button>

      {/* ヒント表示 */}
      {showHint && (
        <div style={{
          background: '#E3F2FD',
          padding: 16,
          borderRadius: 12,
          fontSize: 16,
          color: '#1F2430',
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>💡 ヒント：</div>
          バグの しゅるい：<strong>{bugType}</strong>
          <br />
          よく みて おかしな ブロックを さがそう！
        </div>
      )}

      {/* チェックボタン */}
      <button
        onClick={checkFix}
        style={{
          padding: '16px 32px',
          fontSize: 20,
          fontWeight: 'bold',
          border: 'none',
          borderRadius: 12,
          background: '#4F8EF7',
          color: '#fff',
          cursor: 'pointer',
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
          {feedback === 'correct' ? '🎉 バグを なおせたね！' : '❌ まだ バグが あるみたい'}
        </div>
      )}
    </div>
  );
}
