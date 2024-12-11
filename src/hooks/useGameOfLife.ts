import { useState, useCallback } from 'react';
import type { GridType } from '../components/Grid/types';
import type { CellType } from '../components/Cell/types';

export const useGameOfLife = (initialSize: number) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<GridType>(() =>
    Array(initialSize)
      .fill(null)
      .map(() =>
        Array(initialSize)
          .fill(null)
          .map(() => ({ alive: false }) as CellType),
      ),
  );

  const resetGame = useCallback((size: number) => {
    setIsPlaying(false);
    setGrid(
      Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => ({ alive: false }) as CellType),
        ),
    );
  }, []);

  const toggleCell = useCallback((row: number, col: number) => {
    setGrid(currentGrid => {
      const newGrid = [...currentGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = {
        ...newGrid[row][col],
        alive: !newGrid[row][col].alive,
      };
      return newGrid;
    });
  }, []);

  const setCell = useCallback((row: number, col: number, state: boolean) => {
    setGrid(currentGrid => {
      const newGrid = [...currentGrid];
      newGrid[row] = [...newGrid[row]];
      newGrid[row][col] = {
        ...newGrid[row][col],
        alive: state,
      };
      return newGrid;
    });
  }, []);

  const countLiveNeighbors = useCallback((grid: GridType, row: number, col: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        const newRow = row + i;
        const newCol = col + j;

        if (
          newRow >= 0 &&
          newRow < grid.length &&
          newCol >= 0 &&
          newCol < grid[0].length &&
          grid[newRow][newCol].alive
        ) {
          count++;
        }
      }
    }
    return count;
  }, []);

  const nextGeneration = useCallback(() => {
    setGrid(currentGrid => {
      return currentGrid.map((row, i) =>
        row.map((cell, j) => {
          const neighbors = countLiveNeighbors(currentGrid, i, j);
          return {
            ...cell,
            alive: cell.alive
              ? neighbors === 2 || neighbors === 3 // Survival
              : neighbors === 3, // Birth
          };
        }),
      );
    });
  }, [countLiveNeighbors]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const exportGrid = () => {
    console.log('Exporting grid...');
    const data = { grid };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-of-life-grid.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Download triggered.');
  };

  return {
    grid,
    isPlaying,
    toggleCell,
    setCell,
    togglePlay,
    nextGeneration,
    resetGame,
    exportGrid,
    setGrid,
  };
};
