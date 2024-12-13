import {
  createLShape,
  createStableBlock,
  ensureGamePaused,
  ensureHistoryExists,
  getCellState,
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
    // Create initial state
    await createLShape(page);
    await ensureGamePaused(page);
    await ensureHistoryExists(page);
    await page.waitForTimeout(200);

    // Get initial state before reload
    const initialState = await getCellState(page, 1, 1);

    // Save to localStorage (assuming your app uses localStorage for persistence)
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-testid="grid-canvas"]');
      const state = {
        grid: canvas?.getAttribute('data-game-state'),
        history: localStorage.getItem('gameHistory'),
        currentStep: localStorage.getItem('currentStep'),
      };
      localStorage.setItem('savedGameState', JSON.stringify(state));
    });

    // Reload the page
    await page.reload();

    // Wait for canvas to be ready after reload
    await expect(page.locator('[data-testid="grid-canvas"]')).toBeVisible();
    await page.waitForTimeout(500);

    // Ensure game is paused
    await ensureGamePaused(page);

    // Navigate backwards
    await goToPreviousGeneration(page);

    // Get state after reload and navigation
    const restoredState = await getCellState(page, 1, 1);

    // Compare states
    expect(restoredState.alive).toBe(initialState.alive);
    if (initialState.color) {
      expect(restoredState.color).toBe(initialState.color);
    }
  });
});
