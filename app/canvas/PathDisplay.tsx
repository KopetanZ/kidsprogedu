import React from 'react';

type Position = { x: number; y: number };

type Props = {
  path: Position[];
  gridWidth?: number;
  gridHeight?: number;
  cellSize?: number;
};

/**
 * PathDisplay - Visualizes the path taken by the robot on the grid
 * Shows a trail of semi-transparent circles connecting visited positions
 */
export default function PathDisplay({
  path,
  gridWidth = 8,
  gridHeight = 5,
  cellSize = 60
}: Props) {
  if (path.length === 0) return null;

  const canvasWidth = gridWidth * cellSize;
  const canvasHeight = gridHeight * cellSize;

  // Convert grid position to canvas coordinates (center of cell)
  const toCanvasPos = (pos: Position) => ({
    x: (pos.x - 0.5) * cellSize,
    y: (pos.y - 0.5) * cellSize,
  });

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Draw connecting lines */}
      {path.length > 1 && (
        <g>
          {path.map((pos, i) => {
            if (i === path.length - 1) return null;
            const current = toCanvasPos(pos);
            const next = toCanvasPos(path[i + 1]!);
            return (
              <line
                key={`line-${i}`}
                x1={current.x}
                y1={current.y}
                x2={next.x}
                y2={next.y}
                stroke="#4A90E2"
                strokeWidth={3}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
            );
          })}
        </g>
      )}

      {/* Draw path points */}
      {path.map((pos, i) => {
        const canvasPos = toCanvasPos(pos);
        const isFirst = i === 0;
        const isLast = i === path.length - 1;

        // Opacity fades from start to end for visual depth
        const opacity = 0.3 + (i / path.length) * 0.4;

        return (
          <circle
            key={`point-${i}`}
            cx={canvasPos.x}
            cy={canvasPos.y}
            r={isFirst || isLast ? 8 : 6}
            fill={isFirst ? '#50C878' : isLast ? '#E74C3C' : '#4A90E2'}
            fillOpacity={opacity}
            stroke={isFirst || isLast ? '#FFFFFF' : 'none'}
            strokeWidth={2}
          />
        );
      })}

      {/* Add numbers for sequence visualization (optional, for debugging) */}
      {path.length < 20 && path.map((pos, i) => {
        if (i === 0) return null; // Skip first point number
        const canvasPos = toCanvasPos(pos);
        return (
          <text
            key={`num-${i}`}
            x={canvasPos.x}
            y={canvasPos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fill="#FFFFFF"
            fontWeight="bold"
            style={{ pointerEvents: 'none' }}
          >
            {i}
          </text>
        );
      })}
    </svg>
  );
}
