import { test, Page, expect } from '@playwright/test';
import { createStableBlock, getBlockColors, setupGrid, startGame } from './helpers';

test.describe('Game of Life', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test.describe('State Persistence', () => {
    test('should save and load colors with localStorage', async () => {
      await createStableBlock(page);
      const initialColors = await getBlockColors(page);
      await page.reload();
      const loadedColors = await getBlockColors(page);
      expect(loadedColors).toEqual(initialColors);
    });
  });
});
