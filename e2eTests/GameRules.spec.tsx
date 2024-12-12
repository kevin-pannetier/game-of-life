import { Page, test } from '@playwright/test';
import {
  activateCell,
  createLShape,
  createOvercrowdedCell,
  createStableBlock,
  runNextGeneration,
  setupGrid,
  startGame,
  verifyDeadCell,
  verifyNewCell,
  verifyStableBlock,
} from './helpers';

test.describe('Game of Life', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test.describe('Game Rules', () => {
    test('should kill lonely cells', async () => {
      await activateCell(page, 'cell-1-1');
      await runNextGeneration(page);
      await verifyDeadCell(page, 'cell-1-1');
    });

    test('should keep cells alive with 2 or 3 neighbors', async () => {
      await createStableBlock(page);
      await runNextGeneration(page);
      await verifyStableBlock(page);
    });

    test('should birth new cells with exactly 3 neighbors', async () => {
      await createLShape(page);
      await runNextGeneration(page);
      await verifyNewCell(page, 'cell-2-2');
    });

    test('should kill overcrowded cells', async () => {
      await createOvercrowdedCell(page);
      await runNextGeneration(page);
      await verifyDeadCell(page, 'cell-1-1');
    });
  });
});
