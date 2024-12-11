import type { CellType } from './types';

export type CellProps = CellType & {
  row: number;
  col: number;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
};

export function Cell({ alive, color = 'black', row, col, onMouseDown, onMouseEnter }: CellProps) {
  return (
    <div
      className="w-full h-full transition-colors duration-200 cursor-cell border border-gray-200"
      role="gridcell"
      aria-label={`cell-${alive ? 'alive' : 'dead'}`}
      data-testid={`cell-${row}-${col}`}
      data-alive={alive}
      style={{
        backgroundColor: alive ? color : 'transparent',
      }}
      onMouseDown={() => onMouseDown(row, col)}
      onMouseEnter={() => onMouseEnter(row, col)}
    />
  );
}
