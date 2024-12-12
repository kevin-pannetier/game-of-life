import { useCallback, useState } from 'react';

import type { CellType } from '../components/Cell/types';
import type { GridType } from '../components/Grid/types';
import { determineCellColor } from '../utils/colorUtils';

interface StoredGameState {
  grid: GridType;
  size: number;
  speed?: number;
  generationCount: number;
  history?: GridType[];
  currentHistoryIndex?: number;
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

  // Initialize grid first
  const initialGrid =
    savedState?.grid ||
    Array(effectiveSize)
      .fill(null)
      .map(() =>
        Array(effectiveSize)
          .fill(null)
          .map(() => ({ alive: false }) as CellType),
      );

  const [grid, setGrid] = useState<GridType>(initialGrid);
  const [generationCount, setGenerationCount] = useState(savedState?.generationCount || 0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize history with the initial grid
  const [history, setHistory] = useState<GridType[]>(() => {
    if (savedState?.history && Array.isArray(savedState.history)) {
      return savedState.history;
    }
    return [initialGrid];
  });

  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(() => {
    if (savedState?.currentHistoryIndex !== undefined) {
      return savedState.currentHistoryIndex;
    }
    return 0;
  });

  // Helper to compare grids for changes
  const areGridsDifferent = useCallback((grid1: GridType, grid2: GridType): boolean => {
    return grid1.some((row, i) => row.some((cell, j) => cell.alive !== grid2[i][j].alive));
  }, []);

  // Save state including history
  const saveGrid = useCallback(
    (newGrid: GridType, generations: number, newHistory: GridType[], historyIndex: number) => {
      try {
        const gameState: StoredGameState = {
          grid: newGrid,
          size: newGrid.length,
          generationCount: generations,
          history: newHistory,
          currentHistoryIndex: historyIndex,
        };
        localStorage.setItem('gameOfLife', JSON.stringify(gameState));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [],
  );

  // Modified updateGrid to handle history and changes
  const updateGrid = useCallback(
    (newGrid: GridType | ((prev: GridType) => GridType), newGenerationCount?: number) => {
      setGrid(prev => {
        const nextGrid = typeof newGrid === 'function' ? newGrid(prev) : newGrid;
        const nextGenCount = newGenerationCount ?? generationCount;

        let newHistory: GridType[];
        let newHistoryIndex: number;

        if (isPlaying || currentHistoryIndex === history.length - 1) {
          // Only add to history if the grid has changed
          const shouldAddToHistory =
            history.length === 0 || areGridsDifferent(nextGrid, history[history.length - 1]);

          newHistory = [...history];
          if (shouldAddToHistory && nextGenCount > history.length - 1) {
            newHistory.push(nextGrid);
          } else if (shouldAddToHistory) {
            newHistory[nextGenCount] = nextGrid;
          }
          newHistoryIndex = shouldAddToHistory ? nextGenCount : currentHistoryIndex;
        } else {
          // When navigating history, only add if different from current state
          const shouldAddToHistory = areGridsDifferent(nextGrid, history[currentHistoryIndex]);
          if (shouldAddToHistory) {
            newHistory = [...history.slice(0, currentHistoryIndex + 1), nextGrid];
            newHistoryIndex = currentHistoryIndex + 1;
          } else {
            newHistory = history;
            newHistoryIndex = currentHistoryIndex;
          }
        }

        setHistory(newHistory);
        setCurrentHistoryIndex(newHistoryIndex);
        saveGrid(nextGrid, nextGenCount, newHistory, newHistoryIndex);

        return nextGrid;
      });
    },
    [saveGrid, generationCount, history, currentHistoryIndex, isPlaying, areGridsDifferent],
  );

  const toggleCell = useCallback(
    (row: number, col: number) => {
      updateGrid(currentGrid => {
        const newGrid = [...currentGrid];
        newGrid[row] = [...newGrid[row]];
        const newAliveState = !newGrid[row][col].alive;

        newGrid[row][col] = {
          ...newGrid[row][col],
          alive: newAliveState,
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
    if (hasLiveCells(grid)) {
      const nextCount = generationCount + 1;
      setGenerationCount(nextCount);

      updateGrid(currentGrid => {
        const nextGrid = currentGrid.map((row, i) =>
          row.map((cell, j) => {
            const neighbors = countLiveNeighbors(currentGrid, i, j);
            const willBeAlive = cell.alive ? neighbors === 2 || neighbors === 3 : neighbors === 3;

            return {
              ...cell,
              alive: willBeAlive,
              color: willBeAlive
                ? cell.alive
                  ? cell.color
                  : determineCellColor(currentGrid, i, j, currentGrid)
                : undefined,
            };
          }),
        );

        return nextGrid;
      }, nextCount);
    }
  }, [countLiveNeighbors, updateGrid, grid, generationCount]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const exportGrid = useCallback(() => {
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
  }, [grid]);

  // Navigation through history
  const goToPreviousGeneration = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setGrid(history[newIndex]);
      setGenerationCount(newIndex);
      saveGrid(history[newIndex], newIndex, history, newIndex);
    }
  }, [currentHistoryIndex, history, saveGrid]);

  const goToNextGeneration = useCallback(() => {
    if (currentHistoryIndex < history.length - 1 && hasLiveCells(history[currentHistoryIndex])) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setGrid(history[newIndex]);
      setGenerationCount(newIndex);
      saveGrid(history[newIndex], newIndex, history, newIndex);
    }
  }, [currentHistoryIndex, history, saveGrid]);

  const resetGame = useCallback(
    (size: number) => {
      setIsPlaying(false);
      setGenerationCount(0);
      const newGrid = Array(size)
        .fill(null)
        .map(() =>
          Array(size)
            .fill(null)
            .map(() => ({ alive: false, color: undefined })),
        );
      setHistory([newGrid]);
      setCurrentHistoryIndex(0);
      setGrid(newGrid);
      saveGrid(newGrid, 0, [newGrid], 0);
    },
    [saveGrid],
  );

  const cleanGrid = useCallback(() => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, alive: false, color: undefined })));
    setHistory([newGrid]);
    setCurrentHistoryIndex(0);
    setGenerationCount(0);
    setGrid(newGrid);
    saveGrid(newGrid, 0, [newGrid], 0);
  }, [grid, saveGrid]);

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
    // Time travel functions
    goToPreviousGeneration,
    goToNextGeneration,
    canGoBack: currentHistoryIndex > 0,
    canGoForward:
      currentHistoryIndex < history.length - 1 && hasLiveCells(history[currentHistoryIndex]),
  };
};
