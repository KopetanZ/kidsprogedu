"use client";
import Card from '../../components/Card';
import Link from 'next/link';
import { useEffect } from 'react';
import { lessons } from '../../../content/lessons';
import { useSaveStore } from '../../save/store';

export default function LessonsPage() {
  const { load, clearIds } = useSaveStore();
  useEffect(() => { load(); }, []);
  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh' }}>
      <h2 style={{ fontSize: 22, marginBottom: 16 }}>れっすん</h2>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {lessons.map((l) => {
          const cleared = clearIds.includes(l.id);
          return (
            <Link key={l.id} href={`/editor?lessonId=${encodeURIComponent(l.id)}`}>
              <Card title={`${l.title}${cleared ? ' ✅' : ''}`} />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
