import { useState, useCallback } from 'react';
import type { GridType } from '../components/Grid/types';
import type { CellType } from '../components/Cell/types';

interface StoredGameState {
  grid: GridType;
  size: number;
  speed?: number;
}

// Helper to load saved state from localStorage
const loadSavedState = (): StoredGameState | null => {
  try {
    const stored = localStorage.getItem('gameOfLife');
    if (stored) {
      return JSON.parse(stored) as StoredGameState;
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
};

export const useGameOfLife = (initialSize: number | null = null) => {
  // Load saved state when hook is initialized
  const savedState = loadSavedState();
  const effectiveSize = savedState?.size || initialSize || 20;

  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<GridType>(
    () =>
      savedState?.grid ||
      Array(effectiveSize)
        .fill(null)
        .map(() =>
          Array(effectiveSize)
            .fill(null)
            .map(() => ({ alive: false }) as CellType),
        ),
  );

  // Save grid to localStorage whenever it changes
  const saveGrid = useCallback((newGrid: GridType) => {
    try {
      const gameState: StoredGameState = {
        grid: newGrid,
        size: newGrid.length,
      };
      localStorage.setItem('gameOfLife', JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Wrap setGrid to always save when grid changes
  const updateGrid = useCallback(
    (newGrid: GridType | ((prev: GridType) => GridType)) => {
      setGrid(prev => {
        const nextGrid = typeof newGrid === 'function' ? newGrid(prev) : newGrid;
        saveGrid(nextGrid);
        return nextGrid;
      });
    },
    [saveGrid],
  );

  const resetGame = useCallback(
    (size: number) => {
      setIsPlaying(false);
      const newGrid = Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => ({ alive: false }) as CellType),
        );
      updateGrid(newGrid);
    },
    [updateGrid],
  );

  const cleanGrid = useCallback(() => {
    updateGrid(grid.map(row => row.map(cell => ({ ...cell, alive: false }))));
  }, [grid, updateGrid]);

  const toggleCell = useCallback(
    (row: number, col: number) => {
      updateGrid(currentGrid => {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          alive: !newGrid[row][col].alive,
        };
        return newGrid;
      });
    },
    [updateGrid],
  );

  const setCell = useCallback(
    (row: number, col: number, state: boolean) => {
      updateGrid(currentGrid => {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        newGrid[row][col] = {
          ...newGrid[row][col],
          alive: state,
        };
        return newGrid;
      });
    },
    [updateGrid],
  );

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
    updateGrid(currentGrid => {
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
  }, [countLiveNeighbors, updateGrid]);

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
    cleanGrid,
    exportGrid,
    grid,
    isPlaying,
    nextGeneration,
    resetGame,
    setCell,
    setGrid: updateGrid,
    toggleCell,
    togglePlay,
    savedState, // Add this to let the App component know if there was a saved state
  };
};
