import { Page, test } from '@playwright/test';
import { setupGrid, startGame, toggleCell, verifyGridSize } from './helpers';

test.describe('Game of Life', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test.describe('Grid and Cell UI Elements', () => {
    test('should display a grid of the correct size', async () => {
      await verifyGridSize(page, 'grid', 9);
    });

    test('should correctly toggle cell state on click', async () => {
      await toggleCell(page, 'cell-0-0');
    });
  });
});
