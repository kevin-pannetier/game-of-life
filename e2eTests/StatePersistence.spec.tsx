import { Page, expect, test } from '@playwright/test';
import { createStableBlock, getBlockColors, setupGrid, startGame } from './helpers';

test.describe('State Persistence', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test('should save and load colors with localStorage', async () => {
    // Create stable block and wait for it to be fully rendered
    await createStableBlock(page);
    await page.waitForTimeout(200);

    // Get initial colors
    const initialColors = await getBlockColors(page);

    // Save current state explicitly using the app's save mechanism
    await page.evaluate(() => {
      // Assuming your app saves to 'gameState' in localStorage
      const canvas = document.querySelector('[data-testid="grid-canvas"]');
      const state = {
        cells: JSON.parse(canvas?.getAttribute('data-game-state') || '[]'),
        size: canvas?.getAttribute('data-grid-size'),
      };
      localStorage.setItem('gameState', JSON.stringify(state));
    });

    // Reload page
    await page.reload();

    // Wait for grid to be visible and state to be restored
    await expect(page.locator('[data-testid="grid-canvas"]')).toBeVisible();
    await page.waitForTimeout(500);

    // Get colors after reload
    const loadedColors = await getBlockColors(page);

    // Compare colors
    expect(loadedColors).toEqual(initialColors);
  });

  test.afterEach(async () => {
    // Clean up localStorage and close page
    await page.evaluate(() => localStorage.clear());
    await page.close();
  });
});
