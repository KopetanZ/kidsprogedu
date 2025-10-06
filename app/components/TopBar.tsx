"use client";
import React from 'react';
import Button from './Button';

type Props = {
  onRun?: () => void;
  onReset?: () => void;
  onHint?: () => void;
  muted?: boolean;
  onToggleMute?: () => void;
};

export default function TopBar({ onRun, onReset, onHint, muted, onToggleMute }: Props) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        padding: 12,
        background: '#F5F7FB',
      }}
    >
      <Button aria-label={muted ? "おと きる" : "おと だす"} variant="ghost" onClick={onToggleMute}>
        {muted ? '🔇' : '🔈'}
      </Button>
      <Button aria-label="リセット" variant="ghost" onClick={onReset}>
        ↺
      </Button>
      <Button aria-label="ヒント" variant="ghost" onClick={onHint}>
        ?
      </Button>
      <Button aria-label="じっこう" onClick={onRun}>
        ▶︎
      </Button>
    </div>
  );
}
