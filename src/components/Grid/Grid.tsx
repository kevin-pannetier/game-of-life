import { useCallback, useRef, useState } from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import { Cell } from '../Cell/Cell';
import { FixedSizeGrid } from 'react-window';
import { GridProps } from './types';

export const Grid = ({
  grid,
  onCellClick,
  onCellDrag,
  onInteractionStart,
  cellSize = 20,
}: GridProps) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastToggledCell = useRef<{ row: number; col: number } | null>(null);

  const handleMouseDown = useCallback(
    (rowIndex: number, columnIndex: number) => {
      setIsMouseDown(true);
      onInteractionStart();
      onCellClick(rowIndex, columnIndex);
      lastToggledCell.current = { row: rowIndex, col: columnIndex };
    },
    [onInteractionStart, onCellClick],
  );

  const handleMouseEnter = useCallback(
    (rowIndex: number, columnIndex: number) => {
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
    [isMouseDown, onCellDrag],
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
            overscanColumnCount={5}
            overscanRowCount={5}
          >
            {CellRenderer}
          </FixedSizeGrid>
        )}
      </AutoSizer>
    </div>
  );
};
