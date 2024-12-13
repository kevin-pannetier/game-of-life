import { useCallback, useEffect, useRef, useState } from 'react';

import { CELL_EMPTY_COLOR } from '../../utils/colorUtils';
import { GridProps } from './types';
import { isPlaywrightExecutionContext } from '../../utils/playwright';
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Adjust cell size for large grids
  const adjustedCellSize = grid.length === 1000 ? cellSize / 2 : cellSize;

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

  const drawGridLines = useCallback(
    (context: CanvasRenderingContext2D, width: number, height: number) => {
      context.beginPath();
      context.strokeStyle = '#333333';
      context.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x <= width; x += adjustedCellSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += adjustedCellSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }

      context.stroke();
    },
    [adjustedCellSize],
  );

  const drawGrid = useCallback(
    (context: CanvasRenderingContext2D) => {
      const width = grid[0].length * adjustedCellSize;
      const height = grid.length * adjustedCellSize;

      // Clear canvas with background color
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);

      // Draw grid lines first
      drawGridLines(context, width, height);

      if (isPlaywrightExecutionContext()) {
        context.canvas.setAttribute('data-grid-size', grid.length.toString());
      }

      // Draw alive cells
      for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < grid[0].length; columnIndex++) {
          const cell = grid[rowIndex][columnIndex];

          // Store test attributes if needed
          if (isPlaywrightExecutionContext()) {
            const cellState = { alive: cell.alive, color: cell.color || CELL_EMPTY_COLOR };
            context.canvas.setAttribute(
              `data-cell-${rowIndex}-${columnIndex}`,
              JSON.stringify(cellState),
            );
          }

          if (cell.alive) {
            const x = columnIndex * adjustedCellSize;
            const y = rowIndex * adjustedCellSize;

            context.fillStyle = cell.color || '#ffffff';
            context.fillRect(x + 1, y + 1, adjustedCellSize - 1, adjustedCellSize - 1);
          }
        }
      }
    },
    [grid, adjustedCellSize, drawGridLines],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const columnIndex = Math.floor(x / adjustedCellSize);
      const rowIndex = Math.floor(y / adjustedCellSize);

      throttledMouseDown(
        rowIndex,
        columnIndex,
        setIsMouseDown,
        onInteractionStart,
        onCellClick,
        lastToggledCell,
      );
    },
    [adjustedCellSize, throttledMouseDown, onInteractionStart, onCellClick],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isMouseDown) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const columnIndex = Math.floor(x / adjustedCellSize);
      const rowIndex = Math.floor(y / adjustedCellSize);

      throttledMouseEnter(rowIndex, columnIndex, isMouseDown, onCellDrag, lastToggledCell);
    },
    [adjustedCellSize, isMouseDown, throttledMouseEnter, onCellDrag],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    const width = grid[0].length * adjustedCellSize;
    const height = grid.length * adjustedCellSize;

    canvas.width = width;
    canvas.height = height;

    // Optimize canvas
    context.imageSmoothingEnabled = false;

    drawGrid(context);
  }, [drawGrid, grid, adjustedCellSize]);

  return (
    <div
      ref={containerRef}
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
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        data-testid="grid-canvas"
      />
    </div>
  );
};
