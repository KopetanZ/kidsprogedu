"use client";
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '../../components/Button';
import voice from '../../../content/voice/ja.json';
import { lessons } from '../../../content/lessons';

// 星のパーティクル型
type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

function ClearInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const lessonId = params.get('lessonId');

  useEffect(() => {
    // 花丸アニメーション用
    setTimeout(() => setShow(true), 100);

    // 星のパーティクル生成
    const starArray: Star[] = [];
    for (let i = 0; i < 30; i++) {
      starArray.push({
        id: i,
        x: Math.random() * 100,
        y: -20,
        size: Math.random() * 20 + 15,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2,
      });
    }
    setStars(starArray);

    // クリア音を再生
    if (typeof window !== 'undefined') {
      const playSuccessSound = async () => {
        try {
          const { createWebAudioSink } = await import('../../audio/sink');
          const audio = createWebAudioSink();
          // 連続して音を鳴らす
          setTimeout(() => audio.play('goal'), 0);
          setTimeout(() => audio.play('goal'), 200);
          setTimeout(() => audio.play('goal'), 400);
        } catch (e) {
          console.error('Audio error:', e);
        }
      };
      playSuccessSound();
    }
  }, []);

  // 次のレッスンを提案
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <>
      <style jsx>{`
        @keyframes fallStar {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
      <main style={{
        padding: 24,
        background: '#F5F7FB',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/* 花丸アニメーション */}
      <div style={{
        width: '100%',
        maxWidth: 600,
        height: 360,
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 星のパーティクル */}
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              fontSize: star.size,
              opacity: 0,
              animation: `fallStar ${star.duration}s ease-in ${star.delay}s forwards`,
              pointerEvents: 'none',
            }}
          >
            ⭐
          </div>
        ))}
        {/* 花丸 */}
        <div style={{
          fontSize: 120,
          marginBottom: 24,
          transform: show ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          animation: show ? 'bounce 0.5s ease-in-out 0.8s 2' : 'none',
        }}>
          🌸
        </div>

        {/* メッセージ */}
        <h1 style={{
          fontSize: 36,
          color: '#4CC38A',
          fontWeight: 'bold',
          marginBottom: 16,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.4s ease-in 0.3s',
        }}>
          やったね！
        </h1>
        <p style={{
          fontSize: 24,
          color: '#1F2430',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.4s ease-in 0.5s',
        }}>
          {voice.common.clear}
        </p>

        {/* 次のレッスン提案 */}
        {nextLesson && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: '#F5F7FB',
            borderRadius: 12,
            opacity: show ? 1 : 0,
            transition: 'opacity 0.4s ease-in 0.7s',
          }}>
            <p style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>
              つぎの れっすん:
            </p>
            <p style={{ fontSize: 20, color: '#4F8EF7', fontWeight: 'bold' }}>
              {nextLesson.title}
            </p>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.4s ease-in 0.9s',
      }}>
        {nextLesson ? (
          <Link href={`/editor?lessonId=${encodeURIComponent(nextLesson.id)}`}>
            <Button aria-label="つぎへ">
              <div style={{ fontSize: 24 }}>→</div>
              <div style={{ marginTop: 4 }}>つぎへ</div>
            </Button>
          </Link>
        ) : (
          <Link href="/lessons">
            <Button aria-label="れっすんいちらん">
              <div style={{ fontSize: 24 }}>📚</div>
              <div style={{ marginTop: 4 }}>れっすんいちらん</div>
            </Button>
          </Link>
        )}
        <Link href="/lessons">
          <Button aria-label="べつの れっすん" variant="ghost">
            <div style={{ fontSize: 24 }}>📋</div>
            <div style={{ marginTop: 4 }}>べつの れっすん</div>
          </Button>
        </Link>
        <Link href="/">
          <Button aria-label="ホームへ" variant="ghost">
            <div style={{ fontSize: 24 }}>🏠</div>
            <div style={{ marginTop: 4 }}>ホームへ</div>
          </Button>
        </Link>
      </div>
      </main>
    </>
  );
}

export default function ClearPage() {
  return (
    <Suspense fallback={null}>
      <ClearInner />
    </Suspense>
  );
}

