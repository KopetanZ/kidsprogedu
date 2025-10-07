"use client";
import React, { useEffect, useState } from 'react';
import { BADGES } from '../../core/badges/schemas';
import { useBadgeStore } from '../badges/store';
import BadgeComponent from './Badge';

export default function BadgeNotification() {
  const { newBadges, clearNewBadges } = useBadgeStore();
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (newBadges.length > 0 && !currentBadge) {
      // 新しいバッジを表示
      const badgeId = newBadges[0];
      setCurrentBadge(badgeId);
      setShow(true);

      // 3秒後に非表示
      setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setCurrentBadge(null);
          // 残りのバッジがあれば次を表示
          clearNewBadges();
        }, 500);
      }, 3000);

      // 効果音を再生
      if (typeof window !== 'undefined') {
        import('../audio/sink').then(({ createWebAudioSink }) => {
          const audio = createWebAudioSink();
          audio.play('goal');
          setTimeout(() => audio.play('goal'), 200);
        }).catch(() => {});
      }
    }
  }, [newBadges, currentBadge, clearNewBadges]);

  if (!currentBadge) return null;

  const badge = BADGES.find(b => b.id === currentBadge);
  if (!badge) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          padding: 40,
          maxWidth: 400,
          textAlign: 'center',
          transform: show ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
          transition: 'all 0.5s ease-out',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4F8EF7', marginBottom: 24 }}>
          🎉 バッジを ゲット！
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <BadgeComponent badge={badge} earned={true} size="large" />
        </div>
      </div>
    </div>
  );
}
