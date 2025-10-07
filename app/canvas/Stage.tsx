"use client";
import React, { useEffect, useRef, useMemo } from 'react';

type Props = {
  width?: number;
  height?: number;
  gridW?: number; // default 8
  gridH?: number; // default 5
  pos: { x: number; y: number };
  goal: { x: number; y: number };
  instruction?: string; // ゴール地点の吹き出しメッセージ
  direction?: 'right' | 'left' | 'up' | 'down'; // ネコの向き
};

export default function Stage({ width = 960, height = 380, gridW = 8, gridH = 5, pos, goal, instruction, direction = 'right' }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const prevPosRef = useRef(pos);
  const [showInstruction, setShowInstruction] = React.useState(false);

  // 吹き出しのアニメーション
  React.useEffect(() => {
    const timer = setTimeout(() => setShowInstruction(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // メモ化: グリッド計算を事前に実行
  const gridLayout = useMemo(() => {
    const pad = 16;
    const cellW = (width - pad * 2) / gridW;
    const cellH = (height - pad * 2) / gridH;
    return { pad, cellW, cellH, gridW, gridH };
  }, [width, height, gridW, gridH]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // DPR設定
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // レンダリング関数（最適化版）
    const render = () => {
      const { pad, cellW, cellH, gridW: gw, gridH: gh } = gridLayout;

      // 背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // グリッド（1回のパス描画で最適化）
      ctx.strokeStyle = '#E5EAF3';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let ix = 0; ix <= gw; ix++) {
        const x = pad + ix * cellW;
        ctx.moveTo(x, pad);
        ctx.lineTo(x, height - pad);
      }
      for (let iy = 0; iy <= gh; iy++) {
        const y = pad + iy * cellH;
        ctx.moveTo(pad, y);
        ctx.lineTo(width - pad, y);
      }
      ctx.stroke();

      // セル中心計算（1-indexed）
      const toCenter = (gx: number, gy: number) => ({
        x: pad + (gx - 0.5) * cellW,
        y: pad + (gy - 0.5) * cellH,
      });

      // ゴール描画（旗の絵文字）
      const g = toCenter(goal.x, goal.y);
      const goalSize = Math.min(cellW, cellH) * 0.6;
      ctx.font = `${goalSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚩', g.x, g.y);

      // キャラクター描画（絵文字）
      const p = toCenter(pos.x, pos.y);
      const charSize = Math.min(cellW, cellH) * 0.6;
      ctx.font = `${charSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 影を追加
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 移動方向を判定してネコの絵文字を選択
      const prevPos = prevPosRef.current;
      let catEmoji = '🐱'; // デフォルト（右向き）

      if (pos.x > prevPos.x) {
        catEmoji = '🐱'; // 右向き
      } else if (pos.x < prevPos.x) {
        catEmoji = '🐈'; // 左向き（反転）
      } else if (pos.y < prevPos.y) {
        catEmoji = '😺'; // 上向き
      } else if (pos.y > prevPos.y) {
        catEmoji = '😸'; // 下向き
      }

      // ゴールに到達したら喜ぶネコ
      if (pos.x === goal.x && pos.y === goal.y) {
        catEmoji = '😻'; // 喜ぶネコ
      }

      prevPosRef.current = pos;

      // 猫の絵文字を描画
      ctx.fillText(catEmoji, p.x, p.y);

      // 影をリセット
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // 初回描画
    render();

    // クリーンアップ
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [pos.x, pos.y, goal.x, goal.y, width, height, gridLayout]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={ref}
        style={{
          width,
          height,
          borderRadius: 16,
          boxShadow: '0 2px 6px rgba(0,0,0,.08)'
        }}
        aria-label="すてーじ"
      />

      {/* ゴール地点の吹き出し */}
      {instruction && (
        <div style={{
          position: 'absolute',
          left: `${gridLayout.pad + (goal.x - 0.5) * gridLayout.cellW + gridLayout.cellW * 0.7}px`,
          top: `${gridLayout.pad + (goal.y - 0.5) * gridLayout.cellH - 70}px`,
          background: '#fff',
          border: '3px solid #4F8EF7',
          borderRadius: 16,
          padding: '8px 16px',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1F2430',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          maxWidth: 200,
          pointerEvents: 'none',
          zIndex: 10,
          opacity: showInstruction ? 1 : 0,
          transform: showInstruction ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.9)',
          transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        }}>
          {instruction}
          {/* 吹き出しの三角形 */}
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: 20,
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: '10px solid #4F8EF7',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: 22,
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #fff',
          }} />
        </div>
      )}
    </div>
  );
}

