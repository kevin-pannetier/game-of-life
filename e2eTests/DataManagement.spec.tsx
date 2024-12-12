import { test } from '@playwright/test';
import { exportGrid, importGrid, setupGrid, startGame } from './helpers';

test.describe('Data Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test('should export the grid when the "Export to JSON" button is clicked', async ({ page }) => {
    await exportGrid(page);
  });

  test('should import a grid from a JSON file', async ({ page }) => {
    await importGrid(page);
  });
});
