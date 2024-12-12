import {
  createLShape,
  createStableBlock,
  ensureGamePaused,
  ensureHistoryExists,
  goToNextGeneration,
  goToPreviousGeneration,
  setupGrid,
  startGame,
  waitForButtonEnabled,
} from './helpers';
import { expect, test } from '@playwright/test';

test.describe('History Navigation', () => {
  // Single beforeEach that sets up the game state
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test('should disable navigation buttons initially', async ({ page }) => {
    await ensureGamePaused(page);
    // Make sure we check immediately after pausing
    expect(await waitForButtonEnabled(page, 'Previous', 200)).toBe(false);
    expect(await waitForButtonEnabled(page, 'Next', 200)).toBe(false);
  });

  test('should not allow navigation on empty grid', async ({ page }) => {
    await createStableBlock(page);
    await ensureGamePaused(page);
    await page.getByRole('button', { name: 'Clean Grid' }).click();

    // Check after cleaning
    expect(await waitForButtonEnabled(page, 'Previous', 200)).toBe(false);
    expect(await waitForButtonEnabled(page, 'Next', 200)).toBe(false);
  });

  test('should disable forward navigation at latest state', async ({ page }) => {
    await createLShape(page);
    await ensureGamePaused(page);
    await ensureHistoryExists(page);
    await page.waitForTimeout(200); // Wait for history update

    await goToPreviousGeneration(page);
    await goToNextGeneration(page);

    expect(await waitForButtonEnabled(page, 'Next', 200)).toBe(false);
  });

  test('should disable backward navigation at initial state', async ({ page }) => {
    await createLShape(page);
    await ensureGamePaused(page);
    await ensureHistoryExists(page);
    await page.waitForTimeout(200); // Wait for history update

    await goToPreviousGeneration(page);
    expect(await waitForButtonEnabled(page, 'Previous', 200)).toBe(false);
  });

  test('should save and restore history state after page reload', async ({ page }) => {
    await createLShape(page);
    await ensureGamePaused(page);
    await ensureHistoryExists(page);
    await page.waitForTimeout(200); // Wait for history update

    const initialState = await page.getByTestId('cell-1-1').getAttribute('data-alive');

    await page.reload();
    await ensureGamePaused(page);
    await page.waitForTimeout(500); // Wait longer after reload

    await goToPreviousGeneration(page);
    const restoredState = await page.getByTestId('cell-1-1').getAttribute('data-alive');
    expect(restoredState).toBe(initialState);
  });
});
