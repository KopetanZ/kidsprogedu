"use client";
import React from 'react';
import type { Badge } from '../../core/badges/schemas';

type Props = {
  badge: Badge;
  earned: boolean;
  size?: 'small' | 'medium' | 'large';
};

export default function BadgeComponent({ badge, earned, size = 'medium' }: Props) {
  const sizeMap = {
    small: { container: 80, emoji: 32, title: 12 },
    medium: { container: 120, emoji: 48, title: 16 },
    large: { container: 160, emoji: 64, title: 20 },
  };

  const dims = sizeMap[size];

  return (
    <div
      style={{
        width: dims.container,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: earned ? 1 : 0.3,
        filter: earned ? 'none' : 'grayscale(100%)',
        transition: 'all 0.3s ease-out',
      }}
    >
      {/* バッジアイコン */}
      <div
        style={{
          width: dims.emoji,
          height: dims.emoji,
          borderRadius: '50%',
          background: earned ? badge.color : '#E5EAF3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: dims.emoji * 0.6,
          boxShadow: earned ? `0 4px 12px ${badge.color}40` : 'none',
        }}
      >
        {badge.emoji}
      </div>

      {/* バッジタイトル */}
      <div
        style={{
          fontSize: dims.title,
          fontWeight: 'bold',
          color: earned ? '#1F2430' : '#999',
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {badge.title}
      </div>

      {/* バッジ説明 */}
      {size !== 'small' && (
        <div
          style={{
            fontSize: dims.title * 0.75,
            color: '#666',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          {badge.description}
        </div>
      )}
    </div>
  );
}
