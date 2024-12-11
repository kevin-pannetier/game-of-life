import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGameOfLife } from './useGameOfLife';

describe('useGameOfLife', () => {
  describe('initialization', () => {
    it('should initialize with correct grid size', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      expect(result.current.grid).toHaveLength(3);
      expect(result.current.grid[0]).toHaveLength(3);
    });

    it('should initialize with all cells dead', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      result.current.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.alive).toBe(false);
        });
      });
    });

    it('should start in paused state', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('cell manipulation', () => {
    it('should toggle cell state', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      act(() => {
        result.current.toggleCell(0, 0);
      });

      expect(result.current.grid[0][0].alive).toBe(true);

      act(() => {
        result.current.toggleCell(0, 0);
      });

      expect(result.current.grid[0][0].alive).toBe(false);
    });

    it('should set cell state directly', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      act(() => {
        result.current.setCell(1, 1, true);
      });

      expect(result.current.grid[1][1].alive).toBe(true);
    });
  });

  describe('game controls', () => {
    it('should toggle play state', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      act(() => {
        result.current.togglePlay();
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.togglePlay();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameOfLife(3));

      // Set some cells alive
      act(() => {
        result.current.toggleCell(0, 0);
        result.current.toggleCell(1, 1);
        result.current.togglePlay();
      });

      // Reset game
      act(() => {
        result.current.resetGame(3);
      });

      // Check everything is reset
      expect(result.current.isPlaying).toBe(false);
      result.current.grid.forEach(row => {
        row.forEach(cell => {
          expect(cell.alive).toBe(false);
        });
      });
    });
  });

  describe('game rules', () => {
    describe('nextGeneration', () => {
      it('should kill lonely cells', () => {
        const { result } = renderHook(() => useGameOfLife(3));

        // Set up single live cell
        act(() => {
          result.current.setCell(1, 1, true);
        });

        // Move to next generation
        act(() => {
          result.current.nextGeneration();
        });

        // Cell should die from loneliness
        expect(result.current.grid[1][1].alive).toBe(false);
      });

      it('should keep cells alive with 2 or 3 neighbors', () => {
        const { result } = renderHook(() => useGameOfLife(4));

        // Create stable block pattern
        act(() => {
          result.current.setCell(1, 1, true);
          result.current.setCell(1, 2, true);
          result.current.setCell(2, 1, true);
          result.current.setCell(2, 2, true);
        });

        // Move to next generation
        act(() => {
          result.current.nextGeneration();
        });

        // Block should remain stable
        expect(result.current.grid[1][1].alive).toBe(true);
        expect(result.current.grid[1][2].alive).toBe(true);
        expect(result.current.grid[2][1].alive).toBe(true);
        expect(result.current.grid[2][2].alive).toBe(true);
      });

      it('should birth new cells with exactly 3 neighbors', () => {
        const { result } = renderHook(() => useGameOfLife(4));

        // Set up "L" shape that will birth a new cell
        act(() => {
          result.current.setCell(1, 1, true);
          result.current.setCell(1, 2, true);
          result.current.setCell(2, 1, true);
        });

        // Move to next generation
        act(() => {
          result.current.nextGeneration();
        });

        // Check if new cell was born
        expect(result.current.grid[2][2].alive).toBe(true);
      });

      it('should kill overcrowded cells', () => {
        const { result } = renderHook(() => useGameOfLife(3));

        // Create overcrowded center cell
        act(() => {
          result.current.setCell(0, 1, true);
          result.current.setCell(1, 0, true);
          result.current.setCell(1, 1, true);
          result.current.setCell(1, 2, true);
          result.current.setCell(2, 1, true);
        });

        // Move to next generation
        act(() => {
          result.current.nextGeneration();
        });

        // Center cell should die from overcrowding
        expect(result.current.grid[1][1].alive).toBe(false);
      });
    });
  });
});
