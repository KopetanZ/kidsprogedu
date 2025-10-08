"use client";
import Card from '../../components/Card';
import Link from 'next/link';
import { useEffect } from 'react';
import { lessons } from '../../../content/lessons';
import { useSaveStore } from '../../save/store';
import { useBadgeStore } from '../../badges/store';
import { useMobile } from '../../hooks/useMobile';
import BadgeNotification from '../../components/BadgeNotification';
import SkillMap from '../../components/SkillMap';
import type { Skill } from '../../../core/blocks/schemas';
import voice from '../../../content/voice/ja.json';

export default function LessonsPage() {
  const isMobile = useMobile();
  const { load, clearIds } = useSaveStore();
  const { earnedBadges } = useBadgeStore();

  useEffect(() => {
    load();

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

  // スキル別の進捗を計算
  const calculateSkillProgress = () => {
    const skillMap = new Map<Skill, { completed: number; total: number }>();

    for (const lesson of lessons) {
      const skills = lesson.skills || ['sequence'];
      for (const skill of skills) {
        const current = skillMap.get(skill as Skill) || { completed: 0, total: 0 };
        current.total += 1;
        if (clearIds.includes(lesson.id)) {
          current.completed += 1;
        }
        skillMap.set(skill as Skill, current);
      }
    }

    return Array.from(skillMap.entries()).map(([skill, data]) => ({
      skill,
      completed: data.completed,
      total: data.total,
      mastery: (data.completed / data.total) * 100,
    }));
  };

  const skillProgress = calculateSkillProgress();

  return (
    <main style={{ padding: isMobile ? 12 : 24, background: '#F5F7FB', minHeight: '100vh' }}>
      <BadgeNotification />

      {/* ガイドヘッダー */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? 16 : 24,
        marginBottom: isMobile ? 20 : 32,
        boxShadow: '0 2px 8px rgba(0,0,0,.08)',
      }}>
        <h1 style={{ fontSize: isMobile ? 24 : 32, marginBottom: isMobile ? 8 : 12, color: '#1F2430' }}>
          {voice.lessons_guide.title}
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 20, color: '#666', marginBottom: isMobile ? 6 : 8 }}>
          {voice.lessons_guide.subtitle}
        </p>
        <p style={{ fontSize: isMobile ? 16 : 18, color: '#4F8EF7', fontWeight: 'bold' }}>
          ⭐ {voice.lessons_guide.recommended}
        </p>
        {/* バッジへのリンク */}
        <Link href="/badges">
          <button
            style={{
              marginTop: isMobile ? 12 : 16,
              padding: isMobile ? '6px 16px' : '8px 20px',
              fontSize: isMobile ? 16 : 18,
              borderRadius: isMobile ? 8 : 12,
              border: '2px solid #4F8EF7',
              background: '#fff',
              color: '#4F8EF7',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🏅 バッジコレクション ({earnedBadges.length})
          </button>
        </Link>
      </div>

      {/* スキルマップ */}
      <div style={{ marginBottom: 32 }}>
        <SkillMap skillProgress={skillProgress} />
      </div>

      {/* レベル別セクション */}
      {levelGroups.map((group) => {
        const levelLessons = getLessonsByLevel(group.level);
        const { cleared, total } = getClearCount(group.level);

        return (
          <section key={group.level} style={{ marginBottom: isMobile ? 20 : 32 }}>
            {/* セクションヘッダー */}
            <div style={{
              background: group.color,
              borderRadius: isMobile ? 8 : 12,
              padding: isMobile ? 12 : 16,
              marginBottom: isMobile ? 12 : 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ fontSize: isMobile ? 18 : 24, margin: 0, color: '#1F2430' }}>
                {group.title}
              </h2>
              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 'bold', color: '#4F8EF7' }}>
                {cleared}/{total}
              </div>
            </div>

            {/* レッスンカード */}
            <div style={{ display: 'grid', gap: isMobile ? 12 : 16, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))' }}>
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
