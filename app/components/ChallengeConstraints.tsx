"use client";
import React from 'react';
import type { Block, ChallengeData } from '../../core/blocks/schemas';

type Props = {
  challenge: ChallengeData;
  currentProgram: Block[];
};

export default function ChallengeConstraints({ challenge, currentProgram }: Props) {
  const { constraints, challengeDescription } = challenge;

  // ブロック数カウント
  const countBlocks = (blocks: Block[]): number => {
    let count = 0;
    for (const block of blocks) {
      if (block.block === 'when_flag') continue;
      count += 1;
      if (block.block === 'repeat_n' && block.children) {
        count += countBlocks(block.children);
      }
    }
    return count;
  };

  // ブロック種別ごとのカウント
  const countByType = (blocks: Block[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    const walk = (bs: Block[]) => {
      for (const block of bs) {
        if (block.block === 'when_flag') continue;
        counts[block.block] = (counts[block.block] || 0) + 1;
        if (block.block === 'repeat_n' && block.children) {
          walk(block.children);
        }
      }
    };
    walk(blocks);
    return counts;
  };

  const totalBlocks = countBlocks(currentProgram);
  const blocksByType = countByType(currentProgram);

  // 制約チェック
  const checkConstraints = () => {
    const violations: string[] = [];

    // 最大ブロック数チェック
    if (constraints.maxBlocks && totalBlocks > constraints.maxBlocks) {
      violations.push(`ブロックが ${totalBlocks}こ / ${constraints.maxBlocks}こ まで`);
    }

    // ブロック種別ごとの上限チェック
    if (constraints.maxOfType) {
      for (const [blockType, maxCount] of Object.entries(constraints.maxOfType)) {
        const currentCount = blocksByType[blockType] || 0;
        if (currentCount > maxCount) {
          violations.push(`${blockType} が おおすぎ (${currentCount}/${maxCount})`);
        }
      }
    }

    // 禁止ブロックチェック
    if (constraints.bannedBlocks && constraints.bannedBlocks.length > 0) {
      for (const bannedBlock of constraints.bannedBlocks) {
        if (blocksByType[bannedBlock]) {
          violations.push(`${bannedBlock} は つかえません`);
        }
      }
    }

    // 必須ブロックチェック
    if (constraints.requiredBlocks && constraints.requiredBlocks.length > 0) {
      for (const requiredBlock of constraints.requiredBlocks) {
        if (!blocksByType[requiredBlock]) {
          violations.push(`${requiredBlock} が ひつようです`);
        }
      }
    }

    return violations;
  };

  const violations = checkConstraints();
  const isValid = violations.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* チャレンジ説明 */}
      <div style={{
        background: '#FFF3E0',
        padding: 16,
        borderRadius: 12,
        border: '2px solid #FF9800',
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#FF9800' }}>
          🏆 チャレンジ
        </div>
        <div style={{ fontSize: 16, color: '#1F2430' }}>
          {challengeDescription}
        </div>
      </div>

      {/* 制約表示 */}
      <div style={{
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,.08)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2430' }}>
          📋 ルール
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* 最大ブロック数 */}
          {constraints.maxBlocks && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              borderRadius: 8,
              background: totalBlocks <= constraints.maxBlocks ? '#E8F5E9' : '#FFEBEE',
            }}>
              <span style={{ fontSize: 20 }}>
                {totalBlocks <= constraints.maxBlocks ? '✓' : '✗'}
              </span>
              <span style={{ fontSize: 16 }}>
                ブロックは {constraints.maxBlocks}こ まで
              </span>
              <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                {totalBlocks} / {constraints.maxBlocks}
              </span>
            </div>
          )}

          {/* 禁止ブロック */}
          {constraints.bannedBlocks && constraints.bannedBlocks.length > 0 && (
            <div style={{
              padding: 8,
              borderRadius: 8,
              background: '#FFEBEE',
            }}>
              <span style={{ fontSize: 16 }}>
                ❌ つかえない：{constraints.bannedBlocks.join(', ')}
              </span>
            </div>
          )}

          {/* 必須ブロック */}
          {constraints.requiredBlocks && constraints.requiredBlocks.length > 0 && (
            <div style={{
              padding: 8,
              borderRadius: 8,
              background: '#E3F2FD',
            }}>
              <span style={{ fontSize: 16 }}>
                ⭐ かならず つかう：{constraints.requiredBlocks.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 違反警告 */}
      {violations.length > 0 && (
        <div style={{
          background: '#FFEBEE',
          padding: 16,
          borderRadius: 12,
          border: '2px solid #E5484D',
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#E5484D' }}>
            ⚠️ ルール いはん
          </div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16 }}>
            {violations.map((v, idx) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 達成表示 */}
      {isValid && currentProgram.length > 1 && (
        <div style={{
          background: '#E8F5E9',
          padding: 16,
          borderRadius: 12,
          border: '2px solid #4CAF50',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>
            ✓ ルールを まもっているよ！
          </div>
        </div>
      )}
    </div>
  );
}
