"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import BadgeComponent from '../../components/Badge';
import { BADGES } from '../../../core/badges/schemas';
import { useBadgeStore } from '../../badges/store';

export default function BadgesPage() {
  const { earnedBadges } = useBadgeStore();

  useEffect(() => {
    // BGMを再生
    if (typeof window !== 'undefined') {
      import('../../audio/bgm').then(({ getBGMPlayer }) => {
        const bgm = getBGMPlayer();
        const muted = localStorage.getItem('audioMuted') === 'true';
        bgm.play('menu', muted);
      });
    }

    return () => {
      // ページを離れる時にBGMを停止
      if (typeof window !== 'undefined') {
        import('../../audio/bgm').then(({ getBGMPlayer }) => {
          getBGMPlayer().stop();
        });
      }
    };
  }, []);

  const earnedCount = earnedBadges.length;
  const totalCount = BADGES.length;
  const percentage = Math.round((earnedCount / totalCount) * 100);

  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,.08)',
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 12, color: '#1F2430' }}>
          バッジコレクション
        </h1>
        <p style={{ fontSize: 20, color: '#666', marginBottom: 16 }}>
          レッスンを クリアして バッジを あつめよう！
        </p>
        <div
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#4F8EF7',
            marginBottom: 8,
          }}
        >
          {earnedCount} / {totalCount} ({percentage}%)
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
              background: 'linear-gradient(90deg, #4F8EF7, #00BCD4)',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
      </div>

      {/* バッジグリッド */}
      <div
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          marginBottom: 32,
        }}
      >
        {BADGES.map((badge) => {
          const earned = earnedBadges.includes(badge.id);
          return (
            <div
              key={badge.id}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 20,
                boxShadow: earned
                  ? `0 4px 12px ${badge.color}40`
                  : '0 2px 6px rgba(0,0,0,.08)',
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease-out',
              }}
            >
              <BadgeComponent badge={badge} earned={earned} size="large" />
            </div>
          );
        })}
      </div>

      {/* 戻るボタン */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/lessons">
          <button
            style={{
              padding: '12px 32px',
              fontSize: 20,
              borderRadius: 12,
              border: '2px solid #E5EAF3',
              background: '#fff',
              color: '#1F2430',
              cursor: 'pointer',
            }}
          >
            ← レッスンに もどる
          </button>
        </Link>
      </div>
    </main>
  );
}
