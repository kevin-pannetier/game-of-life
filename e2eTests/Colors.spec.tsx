import { CELL_COLORS, CELL_EMPTY_COLOR } from '../src/utils/colorUtils';
import { Page, expect, test } from '@playwright/test';
import {
  activateCell,
  createStableBlock,
  getCellState,
  runNextGeneration,
  setupGrid,
  startGame,
} from './helpers';

test.describe('Game of Life', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test.describe('Color Behavior', () => {
    test('should assign random color to isolated cell when activated', async () => {
      await activateCell(page, 'cell-1-1');

      const state = await getCellState(page, 1, 1);
      expect(state.alive).toBe(true);
      expect(CELL_COLORS).toContain(state.color);
    });

    test('should inherit color from neighboring cells when born', async () => {
      // Create two cells with the same color
      await activateCell(page, 'cell-1-1');
      const firstCellState = await getCellState(page, 1, 1);
      expect(firstCellState.alive).toBe(true);
      const firstCellColor = firstCellState.color;

      // Set second cell color through canvas
      await page.evaluate(
        ({ row, col, color }) => {
          const canvas = document.querySelector('[data-testid="grid-canvas"]') as HTMLCanvasElement;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const cellSize = canvas.width / 3; // Assuming 3x3 grid
          if (color) {
            ctx.fillStyle = color;
          }
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

          // Update data attribute
          canvas.setAttribute(`data-cell-1-2`, JSON.stringify({ alive: true, color }));
        },
        { row: 1, col: 2, color: firstCellColor },
      );
      await activateCell(page, 'cell-1-2');
      await activateCell(page, 'cell-2-1');

      await runNextGeneration(page);

      const newCellState = await getCellState(page, 2, 2);
      expect(newCellState.alive).toBe(true);
      expect(newCellState.color).toBe(firstCellColor);
    });

    test('should preserve cell colors through generations', async () => {
      await createStableBlock(page);

      // Get initial colors
      const initialColors = {
        '1-1': (await getCellState(page, 1, 1)).color,
        '1-2': (await getCellState(page, 1, 2)).color,
        '2-1': (await getCellState(page, 2, 1)).color,
        '2-2': (await getCellState(page, 2, 2)).color,
      };

      await runNextGeneration(page);

      // Check colors after generation
      const newColors = {
        '1-1': (await getCellState(page, 1, 1)).color,
        '1-2': (await getCellState(page, 1, 2)).color,
        '2-1': (await getCellState(page, 2, 1)).color,
        '2-2': (await getCellState(page, 2, 2)).color,
      };

      expect(newColors).toEqual(initialColors);
    });

    test('should clear colors when cleaning grid', async () => {
      await createStableBlock(page);
      await page.getByTestId('clean-button').click();
      await page.waitForTimeout(100);

      // Verify all cells are dead and have the background color
      const darkColor = CELL_EMPTY_COLOR;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const state = await getCellState(page, row, col);
          expect(state.alive).toBe(false);
          expect(state.color).toBe(darkColor);
        }
      }
    });
  });
});
