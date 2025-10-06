"use client";
import React from 'react';
import Button from './Button';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
};

export default function Modal({ isOpen, onClose, children, showCloseButton = true }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          maxWidth: 640,
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,.16)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {showCloseButton && (
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
            <Button onClick={onClose} aria-label="とじる">
              とじる
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
