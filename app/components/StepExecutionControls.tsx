"use client";
import React from 'react';
import Button from './Button';

type Props = {
  isRunning: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
};

export default function StepExecutionControls({
  isRunning,
  isPaused,
  currentStep,
  totalSteps,
  onStepForward,
  onStepBackward,
  onPlay,
  onPause,
  onReset,
}: Props) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 2px 6px rgba(0,0,0,.08)',
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1F2430',
      }}>
        🎮 ステップ じっこう
      </div>

      {/* プログレス表示 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
          fontSize: 14,
          color: '#666',
        }}>
          <span>ステップ {currentStep} / {totalSteps}</span>
          <span>{Math.round((currentStep / Math.max(totalSteps, 1)) * 100)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: 8,
          background: '#E5EAF3',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(currentStep / Math.max(totalSteps, 1)) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4F8EF7, #00BCD4)',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* コントロールボタン */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}>
        {/* 1ステップ戻る */}
        <button
          onClick={onStepBackward}
          disabled={!isRunning || currentStep === 0}
          style={{
            padding: '12px',
            fontSize: 20,
            border: 'none',
            borderRadius: 8,
            background: currentStep === 0 ? '#E5EAF3' : '#fff',
            border: '2px solid #E5EAF3',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
          }}
          title="1ステップ戻る"
        >
          ⏮
        </button>

        {/* 再生/一時停止 */}
        <button
          onClick={isPaused ? onPlay : onPause}
          disabled={!isRunning}
          style={{
            padding: '12px',
            fontSize: 20,
            border: 'none',
            borderRadius: 8,
            background: isRunning ? '#4F8EF7' : '#E5EAF3',
            color: isRunning ? '#fff' : '#999',
            cursor: isRunning ? 'pointer' : 'not-allowed',
          }}
          title={isPaused ? '再生' : '一時停止'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>

        {/* 1ステップ進む */}
        <button
          onClick={onStepForward}
          disabled={!isRunning || currentStep >= totalSteps}
          style={{
            padding: '12px',
            fontSize: 20,
            border: 'none',
            borderRadius: 8,
            background: currentStep >= totalSteps ? '#E5EAF3' : '#fff',
            border: '2px solid #E5EAF3',
            cursor: currentStep >= totalSteps ? 'not-allowed' : 'pointer',
          }}
          title="1ステップ進む"
        >
          ⏭
        </button>

        {/* リセット */}
        <button
          onClick={onReset}
          style={{
            gridColumn: '1 / -1',
            padding: '12px',
            fontSize: 16,
            border: '2px solid #E5EAF3',
            borderRadius: 8,
            background: '#fff',
            color: '#1F2430',
            cursor: 'pointer',
          }}
        >
          ↺ リセット
        </button>
      </div>

      {/* 説明 */}
      <div style={{
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        lineHeight: 1.6,
      }}>
        <div>⏮⏭ 1ステップずつ じっこう</div>
        <div>▶⏸ れんぞく じっこう</div>
      </div>
    </div>
  );
}
