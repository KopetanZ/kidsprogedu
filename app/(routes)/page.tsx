"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import Modal from '../components/Modal';
import voice from '../../content/voice/ja.json';

export default function HomePage() {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    // 初回起動チェック
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const nextStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
    } else {
      closeTutorial();
    }
  };

  const tutorialContent = [
    {
      title: voice.tutorial.app_intro,
      text: voice.tutorial.app_description,
    },
    {
      title: voice.tutorial.step1_title,
      text: voice.tutorial.step1_text,
    },
    {
      title: voice.tutorial.step2_title,
      text: voice.tutorial.step2_text,
    },
    {
      title: voice.tutorial.step3_title,
      text: voice.tutorial.step3_text,
    },
  ];

  return (
    <main style={{ padding: 24, background: '#F5F7FB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        {/* タイトル */}
        <h1 style={{ fontSize: 48, marginBottom: 32, textAlign: 'center', color: '#1F2430' }}>
          プログラミング がくしゅう
        </h1>

        {/* キャラクター紹介カード */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,.08)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🐱</div>
          <p style={{ fontSize: 22, lineHeight: 1.6, color: '#1F2430', marginBottom: 8 }}>
            {voice.home.character_intro}
          </p>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: '#4F8EF7', fontWeight: 'bold' }}>
            {voice.home.story_intro}
          </p>
        </div>

        {/* 説明カード */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: 32,
          marginBottom: 32,
          boxShadow: '0 4px 12px rgba(0,0,0,.08)',
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 16, color: '#4F8EF7' }}>
            {voice.home.what_is_this}
          </h2>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: '#1F2430', marginBottom: 16 }}>
            {voice.home.description}
          </p>
          <p style={{ fontSize: 20, lineHeight: 1.6, color: '#1F2430', fontWeight: 'bold' }}>
            {voice.home.lets_start}
          </p>
        </div>

        {/* ボタンエリア */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/lessons">
            <Button aria-label="れっすん">
              <div style={{ fontSize: 32 }}>📚</div>
              <div style={{ marginTop: 8 }}>れっすん</div>
            </Button>
          </Link>
          <Link href="/editor">
            <Button aria-label="さくひん" variant="ghost">
              <div style={{ fontSize: 32 }}>🎨</div>
              <div style={{ marginTop: 8 }}>さくひん</div>
            </Button>
          </Link>
          <Button aria-label="ちゅーとりある" variant="ghost" onClick={() => setShowTutorial(true)}>
            <div style={{ fontSize: 32 }}>❓</div>
            <div style={{ marginTop: 8 }}>つかいかた</div>
          </Button>
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 18, color: '#1F2430' }}>
          {voice.common.welcome}
        </div>
      </div>

      {/* チュートリアルモーダル */}
      <Modal isOpen={showTutorial} onClose={closeTutorial} showCloseButton={false}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, marginBottom: 24, color: '#4F8EF7' }}>
            {tutorialContent[tutorialStep].title}
          </h2>
          <p style={{ fontSize: 22, lineHeight: 1.6, marginBottom: 32, color: '#1F2430' }}>
            {tutorialContent[tutorialStep].text}
          </p>
          <div style={{ fontSize: 18, color: '#999', marginBottom: 24 }}>
            {tutorialStep + 1} / {tutorialContent.length}
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button variant="ghost" onClick={closeTutorial} aria-label="スキップ">
              スキップ
            </Button>
            <Button onClick={nextStep} aria-label={tutorialStep < 3 ? "つぎへ" : "はじめる"}>
              {tutorialStep < 3 ? 'つぎへ →' : voice.tutorial.ready}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
