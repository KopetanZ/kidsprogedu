export type Grid = { width: number; height: number };

export type Position = { x: number; y: number };

export function clampToGrid(p: Position, grid: Grid): Position {
  return {
    x: Math.max(1, Math.min(grid.width, p.x)),
    y: Math.max(1, Math.min(grid.height, p.y)),
  };
}

