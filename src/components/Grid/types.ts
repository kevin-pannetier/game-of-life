import type { CellType } from '../Cell/types';

export type GridType = CellType[][];

export type GridProps = {
  grid: GridType;
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
  onInteractionStart: () => void;
  cellSize?: number;
};
