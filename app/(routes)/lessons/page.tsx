"use client";
import Card from '../../components/Card';
import Link from 'next/link';
import { useEffect } from 'react';
import { lessons } from '../../../content/lessons';
import { useSaveStore } from '../../save/store';
import voice from '../../../content/voice/ja.json';

export default function LessonsPage() {
  const { load, clearIds } = useSaveStore();
  useEffect(() => { load(); }, []);

  // レベル判定
  const getLevel = (id: string) => {
    if (id.startsWith('L1')) return 1;
    if (id.startsWith('L2')) return 2;
    if (id.startsWith('L3')) return 3;
    return 1;
  };

  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh' }}>
      {/* ガイドヘッダー */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        boxShadow: '0 2px 8px rgba(0,0,0,.08)',
      }}>
        <h1 style={{ fontSize: 32, marginBottom: 12, color: '#1F2430' }}>
          {voice.lessons_guide.title}
        </h1>
        <p style={{ fontSize: 20, color: '#666', marginBottom: 8 }}>
          {voice.lessons_guide.subtitle}
        </p>
        <p style={{ fontSize: 18, color: '#4F8EF7', fontWeight: 'bold' }}>
          ⭐ {voice.lessons_guide.recommended}
        </p>
      </div>

      {/* レッスンカード */}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {lessons.map((l) => {
          const cleared = clearIds.includes(l.id);
          const level = getLevel(l.id);
          const stars = '⭐'.repeat(level);
          return (
            <Link key={l.id} href={`/editor?lessonId=${encodeURIComponent(l.id)}`}>
              <Card title={`${l.title}${cleared ? ' ✅' : ''}`}>
                <div style={{ fontSize: 16, color: '#999' }}>
                  {stars}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 戻るボタン */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link href="/">
          <button style={{
            padding: '12px 32px',
            fontSize: 20,
            borderRadius: 12,
            border: '2px solid #E5EAF3',
            background: '#fff',
            color: '#1F2430',
            cursor: 'pointer',
          }}>
            ← ホームに もどる
          </button>
        </Link>
      </div>
    </main>
  );
}
