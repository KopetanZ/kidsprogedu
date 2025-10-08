"use client";
import React, { useEffect, useRef } from 'react';
import { useMobile } from '../hooks/useMobile';

type RobotPose = {
  rightArm: number;  // 0-180 degrees
  leftArm: number;   // 0-180 degrees
  rightLeg: number;  // 0-90 degrees
  leftLeg: number;   // 0-90 degrees
  head: number;      // -45 to 45 degrees
};

type Props = {
  pose: RobotPose;
  instruction?: string;
};

export default function RobotStage({ pose, instruction }: Props) {
  const isMobile = useMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = isMobile ? Math.min(window.innerWidth - 32, 400) : 500;
  const height = isMobile ? Math.floor(width * 1.2) : 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Robot center position
    const centerX = width / 2;
    const centerY = height / 2;
    const bodyWidth = 80;
    const bodyHeight = 120;

    // Draw body
    ctx.fillStyle = '#4F8EF7';
    ctx.fillRect(centerX - bodyWidth / 2, centerY - bodyHeight / 2, bodyWidth, bodyHeight);

    // Draw head
    ctx.save();
    ctx.translate(centerX, centerY - bodyHeight / 2 - 30);
    ctx.rotate((pose.head * Math.PI) / 180);
    ctx.fillStyle = '#FFB74D';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(-10, -5, 8, 8);
    ctx.fillRect(2, -5, 8, 8);
    // Smile
    ctx.beginPath();
    ctx.arc(0, 5, 15, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Draw right arm
    ctx.save();
    ctx.translate(centerX + bodyWidth / 2, centerY - bodyHeight / 2 + 20);
    ctx.rotate((pose.rightArm * Math.PI) / 180);
    ctx.fillStyle = '#4F8EF7';
    ctx.fillRect(0, 0, 15, 60);
    ctx.restore();

    // Draw left arm
    ctx.save();
    ctx.translate(centerX - bodyWidth / 2, centerY - bodyHeight / 2 + 20);
    ctx.rotate((-pose.leftArm * Math.PI) / 180);
    ctx.fillStyle = '#4F8EF7';
    ctx.fillRect(-15, 0, 15, 60);
    ctx.restore();

    // Draw right leg
    ctx.save();
    ctx.translate(centerX + 20, centerY + bodyHeight / 2);
    ctx.rotate((pose.rightLeg * Math.PI) / 180);
    ctx.fillStyle = '#4F8EF7';
    ctx.fillRect(0, 0, 15, 70);
    ctx.restore();

    // Draw left leg
    ctx.save();
    ctx.translate(centerX - 20, centerY + bodyHeight / 2);
    ctx.rotate((-pose.leftLeg * Math.PI) / 180);
    ctx.fillStyle = '#4F8EF7';
    ctx.fillRect(-15, 0, 15, 70);
    ctx.restore();

  }, [pose, width, height]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          borderRadius: 16,
          boxShadow: '0 2px 6px rgba(0,0,0,.08)',
        }}
        aria-label="ロボット ステージ"
      />
      {instruction && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '3px solid #4F8EF7',
          borderRadius: 16,
          padding: '8px 16px',
          fontSize: isMobile ? 14 : 16,
          fontWeight: 'bold',
          color: '#1F2430',
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          maxWidth: isMobile ? 200 : 300,
          textAlign: 'center',
        }}>
          {instruction}
        </div>
      )}
    </div>
  );
}
