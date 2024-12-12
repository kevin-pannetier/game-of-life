import { useState, useCallback } from 'react';
import type { GridType } from '../components/Grid/types';
import type { CellType } from '../components/Cell/types';
import { determineCellColor } from '../utils/colorUtils';

interface StoredGameState {
  grid: GridType;
  size: number;
  speed?: number;
  generationCount: number;
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

// Helper to check if grid has any live cells
const hasLiveCells = (grid: GridType): boolean => {
  return grid.some(row => row.some(cell => cell.alive));
};

export const useGameOfLife = (initialSize: number | null = null) => {
  // Load saved state when hook is initialized
  const savedState = loadSavedState();
  const effectiveSize = savedState?.size || initialSize || 20;
  const [generationCount, setGenerationCount] = useState(savedState?.generationCount || 0);

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

  // Save grid and generation count to localStorage
  const saveGrid = useCallback((newGrid: GridType, generations: number) => {
    try {
      const gameState: StoredGameState = {
        grid: newGrid,
        size: newGrid.length,
        generationCount: generations,
      };
      localStorage.setItem('gameOfLife', JSON.stringify(gameState));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Wrap setGrid to always save when grid changes
  const updateGrid = useCallback(
    (newGrid: GridType | ((prev: GridType) => GridType), newGenerationCount?: number) => {
      setGrid(prev => {
        const nextGrid = typeof newGrid === 'function' ? newGrid(prev) : newGrid;
        saveGrid(nextGrid, newGenerationCount ?? generationCount);
        return nextGrid;
      });
    },
    [saveGrid, generationCount],
  );

  const resetGame = useCallback(
    (size: number) => {
      setIsPlaying(false);
      setGenerationCount(0);
      const newGrid = Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => ({ alive: false, color: undefined }) as CellType),
        );
      updateGrid(newGrid, 0);
    },
    [updateGrid],
  );

  const cleanGrid = useCallback(() => {
    setGenerationCount(0);
    updateGrid(
      grid.map(row => row.map(cell => ({ ...cell, alive: false, color: undefined }))),
      0,
    );
  }, [grid, updateGrid]);

  const toggleCell = useCallback(
    (row: number, col: number) => {
      updateGrid(currentGrid => {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        const newAliveState = !newGrid[row][col].alive;

        newGrid[row][col] = {
          ...newGrid[row][col],
          alive: newAliveState,
          // Only set color if cell becomes alive
          color: newAliveState ? determineCellColor(currentGrid, row, col) : undefined,
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
    // Calculate new generation count based on current grid state
    const nextCount = hasLiveCells(grid) ? generationCount + 1 : generationCount;

    if (hasLiveCells(grid)) {
      setGenerationCount(nextCount);
    }

    updateGrid(currentGrid => {
      const nextGrid = currentGrid.map((row, i) =>
        row.map((cell, j) => {
          const neighbors = countLiveNeighbors(currentGrid, i, j);
          const willBeAlive = cell.alive
            ? neighbors === 2 || neighbors === 3 // Survival
            : neighbors === 3; // Birth

          return {
            ...cell,
            alive: willBeAlive,
            // Determine color for newly born cells
            color: willBeAlive
              ? cell.alive
                ? cell.color // Keep existing color for surviving cells
                : determineCellColor(currentGrid, i, j, currentGrid) // New color for born cells
              : undefined, // Remove color for dead cells
          };
        }),
      );

      // Save grid with the new generation count
      saveGrid(nextGrid, nextCount);
      return nextGrid;
    });
  }, [countLiveNeighbors, updateGrid, saveGrid, grid, generationCount]);

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
    savedState,
    generationCount,
  };
};
