"use client";
import React, { useEffect, useRef } from 'react';

type Props = {
  width?: number;
  height?: number;
  gridW?: number; // default 8
  gridH?: number; // default 5
  pos: { x: number; y: number };
  goal: { x: number; y: number };
};

export default function Stage({ width = 960, height = 380, gridW = 8, gridH = 5, pos, goal }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // grid
    const pad = 16;
    const gw = gridW;
    const gh = gridH;
    const cellW = (width - pad * 2) / gw;
    const cellH = (height - pad * 2) / gh;
    ctx.strokeStyle = '#E5EAF3';
    for (let ix = 0; ix <= gw; ix++) {
      const x = pad + ix * cellW;
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x, height - pad);
      ctx.stroke();
    }
    for (let iy = 0; iy <= gh; iy++) {
      const y = pad + iy * cellH;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(width - pad, y);
      ctx.stroke();
    }

    // helper to center of cell (1-indexed)
    const toCenter = (gx: number, gy: number) => ({
      x: pad + (gx - 0.5) * cellW,
      y: pad + (gy - 0.5) * cellH,
    });

    // draw goal
    const g = toCenter(goal.x, goal.y);
    ctx.fillStyle = '#4CC38A';
    ctx.beginPath();
    ctx.arc(g.x, g.y, Math.min(cellW, cellH) * 0.25, 0, Math.PI * 2);
    ctx.fill();

    // draw character
    const p = toCenter(pos.x, pos.y);
    ctx.fillStyle = '#4F8EF7';
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.min(cellW, cellH) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }, [pos.x, pos.y, goal.x, goal.y, width, height, gridW, gridH]);

  return (
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
  );
}

