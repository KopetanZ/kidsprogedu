"use client";
import React from 'react';

type Variable = {
  name: string;
  value: number | string;
  type: 'number' | 'string';
};

type Props = {
  variables: Variable[];
  isRunning: boolean;
};

export default function VariableInspector({ variables, isRunning }: Props) {
  if (variables.length === 0) return null;

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 6px rgba(0,0,0,.08)',
      border: isRunning ? '2px solid #4F8EF7' : 'none',
      transition: 'border 0.3s',
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2430',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>📦 へんすう</span>
        {isRunning && (
          <span style={{
            fontSize: 14,
            color: '#4F8EF7',
            animation: 'pulse 1s infinite',
          }}>
            ● じっこうちゅう
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {variables.map((variable, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderRadius: 8,
              background: '#F5F7FB',
              transition: 'all 0.3s',
            }}
          >
            {/* 変数名 */}
            <div style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#666',
              fontFamily: 'monospace',
            }}>
              {variable.name}
            </div>

            {/* 変数の値 */}
            <div style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: variable.type === 'number' ? '#4F8EF7' : '#9C27B0',
              fontFamily: 'monospace',
              padding: '4px 12px',
              borderRadius: 8,
              background: '#fff',
              minWidth: 60,
              textAlign: 'center',
            }}>
              {variable.value}
            </div>
          </div>
        ))}
      </div>

      {/* 説明 */}
      {!isRunning && (
        <div style={{
          marginTop: 12,
          fontSize: 14,
          color: '#999',
          textAlign: 'center',
        }}>
          ▶ボタンを おすと へんすうの うごきが みられるよ
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
