"use client";
import React from 'react';

type Props = {
  title: string;
  onClick?: () => void;
  children?: React.ReactNode;
};

export default function Card({ title, onClick, children }: Props) {
  return (
    <div
      role="button"
      aria-label={title}
      onClick={onClick}
      style={{
        width: 240,
        height: 180,
        borderRadius: 16,
        boxShadow: '0 2px 6px rgba(0,0,0,.08)',
        background: '#fff',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 18, color: '#1F2430' }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

