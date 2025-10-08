"use client";
import React from 'react';
import type { Block } from '../../core/blocks/schemas';
import { useMobile } from '../hooks/useMobile';

type Props = {
  block: Block;
  onClick?: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  onDropToRepeat?: (child: Block) => void;
  isDraggable?: boolean;
  onDrop?: (droppedBlock: Block) => void;
  index?: number;
};

export default function BlockItem({ block, onClick, onRemove, showRemove = false, onDropToRepeat, isDraggable = false, onDrop, index }: Props) {
  const isMobile = useMobile();
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const labelOf = (b: Block): string => {
    switch (b.block) {
      case 'move_right':
        return `みぎへ ${b.times ?? 1}`;
      case 'move_left':
        return `ひだりへ ${b.times ?? 1}`;
      case 'move_up':
        return `うえへ ${b.times ?? 1}`;
      case 'move_down':
        return `したへ ${b.times ?? 1}`;
      case 'repeat_n':
        return `くりかえす ${b.n ?? 2}`;
      case 'play_sound':
        return 'おと';
      default:
        return b.block;
    }
  };

  const colorOf = (b: Block): string => {
    switch (b.block) {
      case 'move_right':
      case 'move_left':
      case 'move_up':
      case 'move_down':
        return '#DDEBFF'; // 青系（動き）
      case 'repeat_n':
        return '#FFE5CC'; // オレンジ系（制御）
      case 'play_sound':
        return '#D4F4DD'; // 緑系（音）
      default:
        return '#E5EAF3';
    }
  };

  // repeat_n ブロックの場合は縦並びで子ブロックを表示
  if (block.block === 'repeat_n') {
    const hasChildren = block.children && block.children.length > 0;

    return (
      <div
        style={{
          minWidth: isMobile ? 100 : 140,
          borderRadius: isMobile ? 8 : 12,
          background: colorOf(block),
          color: '#1F2430',
          position: 'relative',
          padding: isMobile ? 6 : 8,
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            fontSize: isMobile ? 16 : 18,
            fontWeight: 'bold',
            marginBottom: isMobile ? 6 : 8,
            textAlign: 'center',
          }}
        >
          {labelOf(block)}
        </div>

        {/* ドロップゾーン */}
        <div
          onDragOver={(e) => {
            if (onDropToRepeat) {
              e.preventDefault();
              setIsDragOver(true);
            }
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (onDropToRepeat) {
              try {
                const blockData = e.dataTransfer.getData('application/json');
                const droppedBlock = JSON.parse(blockData) as Block;
                onDropToRepeat(droppedBlock);
              } catch (err) {
                console.error('Drop error:', err);
              }
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 6,
            background: isDragOver ? 'rgba(79, 142, 247, 0.2)' : 'rgba(255, 255, 255, 0.4)',
            borderRadius: 8,
            minHeight: hasChildren ? 'auto' : 60,
            border: isDragOver ? '2px dashed #4F8EF7' : '2px dashed transparent',
          }}
        >
          {hasChildren ? (
            block.children!.map((child: Block, idx: number) => (
              <div
                key={idx}
                style={{
                  minWidth: 100,
                  height: 44,
                  borderRadius: 8,
                  background: colorOf(child),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                {labelOf(child)}
              </div>
            ))
          ) : (
            <div
              style={{
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
                padding: 12,
              }}
            >
              ぶろっくを ここに いれてね
            </div>
          )}
        </div>

        {showRemove && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#E5484D',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="削除"
          >
            ×
          </button>
        )}
      </div>
    );
  }

  // 通常のブロック表示
  return (
    <div
      onClick={onClick}
      draggable={!isMobile && isDraggable}
      onDragStart={(e) => {
        if (!isMobile && isDraggable) {
          setIsDragging(true);
          e.dataTransfer.effectAllowed = 'copy';
          e.dataTransfer.setData('application/json', JSON.stringify(block));
        }
      }}
      onDragEnd={() => {
        setIsDragging(false);
      }}
      style={{
        minWidth: isMobile ? 90 : 120,
        height: isMobile ? 48 : 56,
        borderRadius: isMobile ? 8 : 12,
        background: colorOf(block),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1F2430',
        fontSize: isMobile ? 16 : 18,
        cursor: onClick || isDraggable ? 'pointer' : 'default',
        position: 'relative',
        padding: isMobile ? '0 6px' : '0 8px',
        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease-out',
        opacity: isDragging ? 0.8 : 1,
        touchAction: isMobile ? 'manipulation' : 'auto',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {labelOf(block)}
      {showRemove && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#E5484D',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="削除"
        >
          ×
        </button>
      )}
    </div>
  );
}
