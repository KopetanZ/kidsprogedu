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
    if (id.startsWith('L4')) return 4;
    return 1;
  };

  // レベル別にグループ化
  const levelGroups = [
    { level: 1, title: 'レベル1 - きほんの うごき', color: '#E3F2FD' },
    { level: 2, title: 'レベル2 - くりかえし', color: '#FFF3E0' },
    { level: 3, title: 'レベル3 - イベント', color: '#F3E5F5' },
    { level: 4, title: 'レベル4 - じゆうな さくひん', color: '#E8F5E9' },
  ];

  const getLessonsByLevel = (level: number) => {
    return lessons.filter(l => getLevel(l.id) === level);
  };

  const getClearCount = (level: number) => {
    const levelLessons = getLessonsByLevel(level);
    const clearedCount = levelLessons.filter(l => clearIds.includes(l.id)).length;
    return { cleared: clearedCount, total: levelLessons.length };
  };

  // 次に挑戦すべきレッスンを見つける
  const getNextLesson = () => {
    for (const lesson of lessons) {
      if (!clearIds.includes(lesson.id)) {
        return lesson.id;
      }
    }
    return null;
  };

  const nextLessonId = getNextLesson();

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

      {/* レベル別セクション */}
      {levelGroups.map((group) => {
        const levelLessons = getLessonsByLevel(group.level);
        const { cleared, total } = getClearCount(group.level);

        return (
          <section key={group.level} style={{ marginBottom: 32 }}>
            {/* セクションヘッダー */}
            <div style={{
              background: group.color,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ fontSize: 24, margin: 0, color: '#1F2430' }}>
                {group.title}
              </h2>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#4F8EF7' }}>
                {cleared}/{total} クリア！
              </div>
            </div>

            {/* レッスンカード */}
            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {levelLessons.map((l) => {
                const isCleared = clearIds.includes(l.id);
                const isNext = l.id === nextLessonId;
                const stars = '⭐'.repeat(group.level);

                return (
                  <Link key={l.id} href={`/editor?lessonId=${encodeURIComponent(l.id)}`}>
                    <div style={{
                      background: isCleared ? '#C8E6C9' : '#fff',
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: isNext ? '0 0 0 3px #4F8EF7' : '0 2px 6px rgba(0,0,0,.08)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      {isNext && (
                        <div style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          background: '#4F8EF7',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 'bold',
                        }}>
                          つぎはこれ！
                        </div>
                      )}
                      <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1F2430' }}>
                        {l.title} {isCleared && '✅'}
                      </div>
                      <div style={{ fontSize: 16, color: '#999' }}>
                        {stars}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

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
