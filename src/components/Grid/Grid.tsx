import { useCallback, useEffect, useRef, useState } from 'react';

import { CELL_EMPTY_COLOR } from '../../utils/colorUtils';
import { GridProps } from './types';
import throttle from '../../utils/throttle';

export const Grid = ({
  grid,
  onCellClick,
  onCellDrag,
  onInteractionStart,
  cellSize = 20,
}: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastToggledCell = useRef<{ row: number; col: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const throttledMouseDown = useRef(
    throttle(
      (
        rowIndex: number,
        columnIndex: number,
        setIsMouseDown: (value: boolean) => void,
        onInteractionStart: () => void,
        onCellClick: (row: number, col: number) => void,
        lastToggledCell: React.MutableRefObject<{ row: number; col: number } | null>,
      ) => {
        setIsMouseDown(true);
        onInteractionStart();
        onCellClick(rowIndex, columnIndex);
        lastToggledCell.current = { row: rowIndex, col: columnIndex };
      },
      16,
    ),
  ).current;

  const throttledMouseEnter = useRef(
    throttle(
      (
        rowIndex: number,
        columnIndex: number,
        isMouseDown: boolean,
        onCellDrag: (row: number, col: number) => void,
        lastToggledCell: React.MutableRefObject<{ row: number; col: number } | null>,
      ) => {
        if (isMouseDown) {
          if (
            !lastToggledCell.current ||
            lastToggledCell.current.row !== rowIndex ||
            lastToggledCell.current.col !== columnIndex
          ) {
            onCellDrag(rowIndex, columnIndex);
            lastToggledCell.current = { row: rowIndex, col: columnIndex };
          }
        }
      },
      16,
    ),
  ).current;

  const drawGrid = useCallback(
    (context: CanvasRenderingContext2D) => {
      const width = grid[0].length * cellSize;
      const height = grid.length * cellSize;

      // Clear and set background
      context.clearRect(0, 0, width, height);
      context.fillStyle = CELL_EMPTY_COLOR;
      context.fillRect(0, 0, width, height);

      // Draw cells and store their state as data attributes
      for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < grid[0].length; columnIndex++) {
          const cell = grid[rowIndex][columnIndex];
          const x = columnIndex * cellSize;
          const y = rowIndex * cellSize;

          // Draw cell
          context.fillStyle = cell.alive ? cell.color || '#fff' : CELL_EMPTY_COLOR;
          context.fillRect(x, y, cellSize, cellSize);

          // Draw grid lines
          context.strokeStyle = '#666';
          context.strokeRect(x, y, cellSize, cellSize);

          // Store cell state for testing
          const cellState = { alive: cell.alive, color: cell.color || CELL_EMPTY_COLOR };
          context.canvas.setAttribute(
            `data-cell-${rowIndex}-${columnIndex}`,
            JSON.stringify(cellState),
          );
        }
      }

      // Store grid size for testing
      context.canvas.setAttribute('data-grid-size', grid.length.toString());
    },
    [grid, cellSize],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const columnIndex = Math.floor(x / cellSize);
      const rowIndex = Math.floor(y / cellSize);

      throttledMouseDown(
        rowIndex,
        columnIndex,
        setIsMouseDown,
        onInteractionStart,
        onCellClick,
        lastToggledCell,
      );
    },
    [cellSize, throttledMouseDown, onInteractionStart, onCellClick],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isMouseDown) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const columnIndex = Math.floor(x / cellSize);
      const rowIndex = Math.floor(y / cellSize);

      throttledMouseEnter(rowIndex, columnIndex, isMouseDown, onCellDrag, lastToggledCell);
    },
    [cellSize, isMouseDown, throttledMouseEnter, onCellDrag],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = grid[0].length * cellSize;
    canvas.height = grid.length * cellSize;

    drawGrid(context);
  }, [drawGrid, grid, cellSize]);

  return (
    <div
      className="w-full h-[80vh] rounded overflow-auto"
      onMouseUp={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
      }}
      onMouseLeave={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
      }}
      data-testid="grid-container"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          backgroundColor: '#000',
          width: `${grid[0].length * cellSize}px`,
          height: `${grid.length * cellSize}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        data-testid="grid-canvas"
      />
    </div>
  );
};
