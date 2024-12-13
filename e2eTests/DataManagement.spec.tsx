import { Page, test } from '@playwright/test';
import { exportGrid, importGrid, setupGrid, startGame } from './helpers';

test.describe('Data Management', () => {
  let testPage: Page;

  test.beforeEach(async ({ browser }) => {
    testPage = await browser.newPage();
    await testPage.goto('/');
    await testPage.waitForLoadState('networkidle');

    await setupGrid(testPage, 'grid-size-select', 'select-option-3');
    await startGame(testPage);
    await testPage.waitForTimeout(100); // Wait for grid to initialize
  });

  test('should export the grid when the "Export to JSON" button is clicked', async () => {
    await exportGrid(testPage);
  });

  test('should import a grid from a JSON file', async () => {
    await importGrid(testPage);
  });

  test.afterEach(async () => {
    await testPage?.close();
  });
});
