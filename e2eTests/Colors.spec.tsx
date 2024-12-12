import { test, Page, expect } from '@playwright/test';
import {
  createStableBlock,
  getBlockColors,
  hexToRgb,
  isTransparent,
  runNextGeneration,
  setupGrid,
  startGame,
} from './helpers';
import { CELL_COLORS } from '../src/utils/colorUtils';

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
      const cell = page.getByTestId('cell-1-1');
      await cell.click();

      const backgroundColor = await cell.evaluate(
        el => window.getComputedStyle(el).backgroundColor,
      );
      expect(CELL_COLORS.map(hexToRgb)).toContain(backgroundColor);
    });

    test('should inherit color from neighboring cells when born', async () => {
      // Create two cells with the same color
      await page.getByTestId('cell-1-1').click();
      const firstCellColor = await page
        .getByTestId('cell-1-1')
        .evaluate(el => window.getComputedStyle(el).backgroundColor);

      await page.evaluate(
        ({ color }) => {
          const cell = document.querySelector('[data-testid="cell-1-2"]');
          if (cell) (cell as HTMLElement).style.backgroundColor = color;
        },
        { color: firstCellColor },
      );
      await page.getByTestId('cell-1-2').click();

      await page.getByTestId('cell-2-1').click();
      await runNextGeneration(page);

      const newCellColor = await page
        .getByTestId('cell-2-2')
        .evaluate(el => window.getComputedStyle(el).backgroundColor);
      expect(newCellColor).toBe(firstCellColor);
    });

    test('should preserve cell colors through generations', async () => {
      await createStableBlock(page);
      const initialColors = await getBlockColors(page);
      await runNextGeneration(page);
      const newColors = await getBlockColors(page);
      expect(newColors).toEqual(initialColors);
    });

    test('should clear colors when cleaning grid', async () => {
      await createStableBlock(page);
      await page.getByRole('button', { name: 'Clean Grid' }).click();

      const rowCount = 3;
      const colCount = 3;

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const cell = page.getByTestId(`cell-${row}-${col}`);
          const backgroundColor = await cell.evaluate(
            el => window.getComputedStyle(el).backgroundColor,
          );
          expect(isTransparent(backgroundColor)).toBe(true);
        }
      }
    });
  });
});
