"use client";
import React from 'react';
import type { Skill } from '../../core/blocks/schemas';

type SkillProgress = {
  skill: Skill;
  completed: number;
  total: number;
  mastery: number; // 0-100%
};

type Props = {
  skillProgress: SkillProgress[];
};

const skillLabels: Record<Skill, { name: string; emoji: string; color: string }> = {
  sequence: { name: 'じゅんばん', emoji: '➡️', color: '#4F8EF7' },
  loop: { name: 'くりかえし', emoji: '🔄', color: '#FF9800' },
  condition: { name: 'じょうけん', emoji: '🔀', color: '#9C27B0' },
  variable: { name: 'へんすう', emoji: '📦', color: '#00BCD4' },
  function: { name: 'かんすう', emoji: '⚙️', color: '#4CAF50' },
  event: { name: 'イベント', emoji: '⚡', color: '#E91E63' },
};

export default function SkillMap({ skillProgress }: Props) {
  if (skillProgress.length === 0) return null;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,.08)',
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1F2430' }}>
        🎯 スキル マスタリー
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {skillProgress.map((progress) => {
          const info = skillLabels[progress.skill];
          const percentage = Math.round(progress.mastery);

          return (
            <div key={progress.skill} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* スキル名 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{info.emoji}</span>
                  <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2430' }}>
                    {info.name}
                  </span>
                </div>
                <div style={{ fontSize: 16, color: info.color, fontWeight: 'bold' }}>
                  {progress.completed} / {progress.total} ({percentage}%)
                </div>
              </div>

              {/* プログレスバー */}
              <div
                style={{
                  width: '100%',
                  height: 12,
                  background: '#E5EAF3',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${info.color}, ${info.color}CC)`,
                    transition: 'width 0.5s ease-out',
                  }}
                />
              </div>

              {/* マスタリーレベル */}
              {percentage === 100 && (
                <div
                  style={{
                    fontSize: 14,
                    color: info.color,
                    fontWeight: 'bold',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  ✨ マスター！
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
