"use client";
import React from 'react';

type Props = {
  message?: string;
};

export default function Loading({ message = 'よみこみちゅう...' }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(245, 247, 251, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* スピナー */}
      <div
        style={{
          width: 60,
          height: 60,
          border: '6px solid #E5EAF3',
          borderTop: '6px solid #4F8EF7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* メッセージ */}
      <p
        style={{
          marginTop: 24,
          fontSize: 24,
          color: '#1F2430',
          fontWeight: 'bold',
        }}
      >
        {message}
      </p>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
