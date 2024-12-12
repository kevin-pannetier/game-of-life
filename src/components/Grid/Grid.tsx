import { useCallback, useRef, useState } from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import { Cell } from '../Cell/Cell';
import { FixedSizeGrid } from 'react-window';
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

  // Create stable throttled functions using useRef
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

  const handleMouseDown = useCallback(
    (rowIndex: number, columnIndex: number): void => {
      throttledMouseDown(
        rowIndex,
        columnIndex,
        setIsMouseDown,
        onInteractionStart,
        onCellClick,
        lastToggledCell,
      );
    },
    [throttledMouseDown, onInteractionStart, onCellClick],
  );

  const handleMouseEnter = useCallback(
    (rowIndex: number, columnIndex: number): void => {
      throttledMouseEnter(rowIndex, columnIndex, isMouseDown, onCellDrag, lastToggledCell);
    },
    [isMouseDown, onCellDrag, throttledMouseEnter],
  );

  const CellRenderer = useCallback(
    ({
      columnIndex,
      rowIndex,
      style,
    }: {
      columnIndex: number;
      rowIndex: number;
      style: React.CSSProperties;
    }) => (
      <div style={{ ...style, padding: 1 }}>
        <Cell
          row={rowIndex}
          col={columnIndex}
          alive={grid[rowIndex][columnIndex].alive}
          color={grid[rowIndex][columnIndex].color}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
        />
      </div>
    ),
    [grid, handleMouseDown, handleMouseEnter],
  );

  return (
    <div
      className="w-full h-[80vh] rounded"
      onMouseUp={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
      }}
      onMouseLeave={() => {
        setIsMouseDown(false);
        lastToggledCell.current = null;
      }}
      data-testid="grid"
      aria-label="Game of Life Grid"
    >
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeGrid
            className="Grid"
            columnCount={grid[0].length}
            columnWidth={cellSize}
            height={height}
            rowCount={grid.length}
            rowHeight={cellSize}
            width={width}
            overscanColumnCount={1}
            overscanRowCount={1}
          >
            {CellRenderer}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </div>
  );
};
