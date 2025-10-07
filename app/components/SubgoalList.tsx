"use client";
import React from 'react';
import type { Subgoal } from '../../core/blocks/schemas';

type Props = {
  subgoals: Subgoal[];
  completedIds: string[];
};

export default function SubgoalList({ subgoals, completedIds }: Props) {
  if (subgoals.length === 0) return null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    }}>
      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2430' }}>
        📋 もくひょう
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {subgoals.map((subgoal) => {
          const completed = completedIds.includes(subgoal.id);
          return (
            <div
              key={subgoal.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: completed ? '#E8F5E9' : '#F5F7FB',
                transition: 'all 0.3s ease-out',
              }}
            >
              {/* チェックボックス */}
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: completed ? 'none' : '2px solid #E5EAF3',
                background: completed ? '#4CAF50' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
                transition: 'all 0.3s ease-out',
              }}>
                {completed && '✓'}
              </div>

              {/* ラベル */}
              <div style={{
                fontSize: 16,
                color: completed ? '#4CAF50' : '#1F2430',
                textDecoration: completed ? 'line-through' : 'none',
                transition: 'all 0.3s ease-out',
              }}>
                {subgoal.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* 進捗表示 */}
      <div style={{ marginTop: 12, fontSize: 14, color: '#666', textAlign: 'right' }}>
        {completedIds.length} / {subgoals.length} かんりょう
      </div>
    </div>
  );
}
