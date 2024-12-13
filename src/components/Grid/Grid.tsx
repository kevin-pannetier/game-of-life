import { useCallback, useEffect, useRef, useState } from 'react';

import { CELL_EMPTY_COLOR } from '../../utils/colorUtils';
import { GridProps } from './types';
import { isPlaywrightExecutionContext } from '../../utils/playwright';
import throttle from '../../utils/throttle';

interface CellPosition {
  row: number;
  col: number;
}

interface ViewportRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export const Grid = ({
  grid,
  onCellClick,
  onCellDrag,
  onInteractionStart,
  cellSize = 20,
}: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastToggledCell = useRef<CellPosition | null>(null);
  const lastMousePosition = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<ViewportRange | null>(null);
  const pendingDraw = useRef<boolean>(false);

  // Adjust cell size for large grids
  const adjustedCellSize = grid.length === 1000 ? cellSize / 2 : cellSize;

  const getViewportRange = useCallback((): ViewportRange => {
    const container = containerRef.current;
    if (!container) {
      return {
        startRow: 0,
        endRow: grid.length,
        startCol: 0,
        endCol: grid[0].length,
      };
    }

    const { scrollTop, scrollLeft, clientHeight, clientWidth } = container;
    const buffer = 10; // Buffer cells to render outside viewport

    const viewport = {
      startRow: Math.max(0, Math.floor(scrollTop / adjustedCellSize) - buffer),
      endRow: Math.min(
        grid.length,
        Math.ceil((scrollTop + clientHeight) / adjustedCellSize) + buffer,
      ),
      startCol: Math.max(0, Math.floor(scrollLeft / adjustedCellSize) - buffer),
      endCol: Math.min(
        grid[0].length,
        Math.ceil((scrollLeft + clientWidth) / adjustedCellSize) + buffer,
      ),
    };

    viewportRef.current = viewport;
    return viewport;
  }, [adjustedCellSize, grid]);

  const predictIntermediateCells = useCallback(
    (currentX: number, currentY: number, previousX: number, previousY: number): CellPosition[] => {
      const positions: CellPosition[] = [];
      const canvas = canvasRef.current;
      if (!canvas) return positions;

      const rect = canvas.getBoundingClientRect();
      const startX = previousX - rect.left;
      const startY = previousY - rect.top;
      const endX = currentX - rect.left;
      const endY = currentY - rect.top;

      // Calculate steps based on distance
      const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      const steps = Math.max(1, Math.floor(distance / (adjustedCellSize / 2)));

      for (let i = 0; i <= steps; i++) {
        const x = startX + ((endX - startX) * i) / steps;
        const y = startY + ((endY - startY) * i) / steps;

        const col = Math.floor(x / adjustedCellSize);
        const row = Math.floor(y / adjustedCellSize);

        if (
          row >= 0 &&
          row < grid.length &&
          col >= 0 &&
          col < grid[0].length &&
          (!positions.length ||
            positions[positions.length - 1].row !== row ||
            positions[positions.length - 1].col !== col)
        ) {
          positions.push({ row, col });
        }
      }

      return positions;
    },
    [adjustedCellSize, grid],
  );

  const drawGridLines = useCallback(
    (context: CanvasRenderingContext2D, viewport: ViewportRange) => {
      const { startRow, endRow, startCol, endCol } = viewport;
      const startX = startCol * adjustedCellSize;
      const startY = startRow * adjustedCellSize;
      const width = (endCol - startCol) * adjustedCellSize;
      const height = (endRow - startRow) * adjustedCellSize;

      context.beginPath();
      context.strokeStyle = '#333333';
      context.lineWidth = 1;

      // Draw vertical lines
      for (let x = startX; x <= startX + width; x += adjustedCellSize) {
        context.moveTo(x, startY);
        context.lineTo(x, startY + height);
      }

      // Draw horizontal lines
      for (let y = startY; y <= startY + height; y += adjustedCellSize) {
        context.moveTo(startX, y);
        context.lineTo(startX + width, y);
      }

      context.stroke();
    },
    [adjustedCellSize],
  );

  const drawVisibleCells = useCallback(
    (context: CanvasRenderingContext2D, viewport: ViewportRange) => {
      const { startRow, endRow, startCol, endCol } = viewport;

      // Clear visible area
      const clearX = startCol * adjustedCellSize;
      const clearY = startRow * adjustedCellSize;
      const clearWidth = (endCol - startCol) * adjustedCellSize;
      const clearHeight = (endRow - startRow) * adjustedCellSize;

      context.fillStyle = '#000000';
      context.fillRect(clearX, clearY, clearWidth, clearHeight);

      // Draw grid lines for visible area
      drawGridLines(context, viewport);

      // Batch draw alive cells
      const aliveCells: { x: number; y: number; color: string }[] = [];

      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const cell = grid[row]?.[col];
          if (!cell) continue;

          if (isPlaywrightExecutionContext()) {
            const cellState = { alive: cell.alive, color: cell.color || CELL_EMPTY_COLOR };
            context.canvas.setAttribute(`data-cell-${row}-${col}`, JSON.stringify(cellState));
          }

          if (cell.alive) {
            aliveCells.push({
              x: col * adjustedCellSize,
              y: row * adjustedCellSize,
              color: cell.color || '#ffffff',
            });
          }
        }
      }

      // Draw all alive cells in batch
      aliveCells.forEach(({ x, y, color }) => {
        context.fillStyle = color;
        context.fillRect(x + 1, y + 1, adjustedCellSize - 1, adjustedCellSize - 1);
      });
    },
    [grid, adjustedCellSize, drawGridLines],
  );

  const scheduleRedraw = useCallback(() => {
    if (!pendingDraw.current) {
      pendingDraw.current = true;
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d', { alpha: false });
        if (context) {
          const viewport = getViewportRange();
          drawVisibleCells(context, viewport);
        }
        pendingDraw.current = false;
      });
    }
  }, [drawVisibleCells, getViewportRange]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / adjustedCellSize);
      const row = Math.floor(y / adjustedCellSize);

      if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
        setIsMouseDown(true);
        onInteractionStart();
        onCellClick(row, col);
        lastToggledCell.current = { row, col };
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }
    },
    [adjustedCellSize, grid, onInteractionStart, onCellClick],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      throttle(() => {
        if (!isMouseDown || !lastMousePosition.current) return;

        const positions = predictIntermediateCells(
          event.clientX,
          event.clientY,
          lastMousePosition.current.x,
          lastMousePosition.current.y,
        );

        positions.forEach(({ row, col }) => {
          if (
            !lastToggledCell.current ||
            lastToggledCell.current.row !== row ||
            lastToggledCell.current.col !== col
          ) {
            onCellDrag(row, col);
            lastToggledCell.current = { row, col };
          }
        });

        lastMousePosition.current = { x: event.clientX, y: event.clientY };
      }, 4)(); // Reduced throttle time for smoother drawing
    },
    [isMouseDown, predictIntermediateCells, onCellDrag],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    canvas.width = grid[0].length * adjustedCellSize;
    canvas.height = grid.length * adjustedCellSize;
    context.imageSmoothingEnabled = false;

    if (isPlaywrightExecutionContext()) {
      canvas.setAttribute('data-grid-size', grid.length.toString());
    }

    const handleScroll = throttle(() => {
      scheduleRedraw();
    }, 16);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [grid, adjustedCellSize, scheduleRedraw]);

  useEffect(() => {
    scheduleRedraw();
  }, [scheduleRedraw]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[80vh] rounded overflow-auto"
      onMouseUp={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
        lastMousePosition.current = null;
      }}
      onMouseLeave={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
        lastMousePosition.current = null;
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
