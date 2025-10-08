"use client";
import React from 'react';
import Button from './Button';
import { useMobile } from '../hooks/useMobile';

type Props = {
  onRun?: () => void;
  onReset?: () => void;
  onHint?: () => void;
  onGuide?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
};

export default function TopBar({ onRun, onReset, onHint, onGuide, muted, onToggleMute }: Props) {
  const isMobile = useMobile();

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: isMobile ? 8 : 12,
        padding: isMobile ? 8 : 12,
        background: '#F5F7FB',
        zIndex: 100,
      }}
    >
      <Button aria-label={muted ? "おと きる" : "おと だす"} variant="ghost" onClick={onToggleMute}>
        {muted ? '🔇' : '🔈'}
      </Button>
      <Button aria-label="リセット" variant="ghost" onClick={onReset}>
        ↺
      </Button>
      <Button aria-label="ヒント" variant="ghost" onClick={onHint}>
        💡
      </Button>
      {onGuide && (
        <Button aria-label="つかいかた" variant="ghost" onClick={onGuide}>
          📖
        </Button>
      )}
      <Button aria-label="じっこう" onClick={onRun}>
        ▶︎
      </Button>
    </div>
  );
}
