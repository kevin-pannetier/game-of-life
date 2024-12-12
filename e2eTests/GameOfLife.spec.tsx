import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CELL_COLORS } from '../src/utils/colorUtils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  test.describe('Data Management', () => {
    test('should export the grid when the "Export to JSON" button is clicked', async () => {
      await exportGrid(page);
    });

    test('should import a grid from a JSON file', async () => {
      await importGrid(page, __dirname);
    });
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

  test.describe('State Persistence', () => {
    test('should save and load colors with localStorage', async () => {
      await createStableBlock(page);
      const initialColors = await getBlockColors(page);
      await page.reload();
      const loadedColors = await getBlockColors(page);
      expect(loadedColors).toEqual(initialColors);
    });
  });

  test.describe('History Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await setupGrid(page, 'grid-size-select', 'select-option-3');
      await startGame(page);
    });

    test('should disable navigation buttons initially', async ({ page }) => {
      await ensureGamePaused(page);
      expect(await waitForButtonEnabled(page, 'Previous')).toBe(false);
      expect(await waitForButtonEnabled(page, 'Next')).toBe(false);
    });

    test('should not allow navigation on empty grid', async ({ page }) => {
      await createStableBlock(page);
      await page.getByRole('button', { name: 'Clean Grid' }).click();
      await ensureGamePaused(page);

      expect(await waitForButtonEnabled(page, 'Previous', 500)).toBe(false);
      expect(await waitForButtonEnabled(page, 'Next', 500)).toBe(false);
    });

    test('should maintain cell colors through history navigation', async ({ page }) => {
      // Create pattern and generate history
      await createStableBlock(page);
      const initialColors = await getBlockColors(page);

      // Create navigable history
      await ensureHistoryExists(page);

      // Navigate back and verify colors
      await goToPreviousGeneration(page);
      const colorsAfterNavigation = await getBlockColors(page);
      expect(colorsAfterNavigation).toEqual(initialColors);
    });

    test('should handle multiple forward and backward navigation steps', async ({ page }) => {
      // Create pattern and generate history
      await createLShape(page);

      // Generate several generations
      for (let i = 0; i < 3; i++) {
        await runOneGeneration(page);
      }

      // Navigate back and verify state
      await goToPreviousGeneration(page);
      await goToPreviousGeneration(page);

      // Verify initial L-shape
      await expect(page.getByTestId('cell-1-1')).toHaveAttribute('data-alive', 'true');
      await expect(page.getByTestId('cell-1-2')).toHaveAttribute('data-alive', 'true');
      await expect(page.getByTestId('cell-2-1')).toHaveAttribute('data-alive', 'true');
    });

    test('should disable forward navigation at latest state', async ({ page }) => {
      await createLShape(page);
      await ensureHistoryExists(page);

      await goToPreviousGeneration(page);
      await goToNextGeneration(page);

      expect(await waitForButtonEnabled(page, 'Next', 500)).toBe(false);
    });

    test('should disable backward navigation at initial state', async ({ page }) => {
      await createLShape(page);
      await ensureHistoryExists(page);

      await goToPreviousGeneration(page);
      expect(await waitForButtonEnabled(page, 'Previous', 500)).toBe(false);
    });

    test('should save and restore history state after page reload', async ({ page }) => {
      // Create pattern and history
      await createLShape(page);
      await ensureHistoryExists(page);

      const initialState = await page.getByTestId('cell-1-1').getAttribute('data-alive');

      // Reload and restore
      await page.reload();
      await ensureGamePaused(page);
      await page.waitForTimeout(500);

      // Verify navigation works
      await goToPreviousGeneration(page);
      const restoredState = await page.getByTestId('cell-1-1').getAttribute('data-alive');
      expect(restoredState).toBe(initialState);
    });
  });
});

// Helper functions
async function setupGrid(page, sizeSelectTestId, optionTestId) {
  const selectTrigger = page.getByTestId(sizeSelectTestId);
  await selectTrigger.click();

  const option = page.getByTestId(optionTestId);
  await option.click();
}

async function startGame(page: Page) {
  const startGameButton = page.getByTestId('start-game-button');
  await startGameButton.click();
}

async function verifyGridSize(page: Page, gridTestId: string, expectedCount: number) {
  const grid = page.getByTestId(gridTestId);
  await expect(grid).toBeVisible();

  const cells = grid.locator('[role="gridcell"]');
  await expect(cells).toHaveCount(expectedCount);
}

async function toggleCell(page: Page, cellTestId: string) {
  const cell = page.getByTestId(cellTestId);
  await cell.click();
  await expect(cell).toHaveAttribute('data-alive', 'true');

  // Verify color is assigned when alive
  const colorWhenAlive = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(colorWhenAlive).not.toMatch(/^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/);

  await cell.click();
  await expect(cell).toHaveAttribute('data-alive', 'false');

  // Verify color is removed when dead
  const colorWhenDead = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(isTransparent(colorWhenDead)).toBe(true);
}

async function activateCell(page: Page, cellTestId: string) {
  await page.getByTestId(cellTestId).click();
}

async function runNextGeneration(page: Page) {
  await page.getByTestId('play-button').click();

  await page.waitForTimeout(600);

  await page.getByTestId('play-button').click();

  await page.waitForTimeout(100);
}

async function verifyDeadCell(page: Page, cellTestId: string) {
  await expect(page.getByTestId(cellTestId)).toHaveAttribute('data-alive', 'false');
}

async function createStableBlock(page: Page) {
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
  await page.getByTestId('cell-2-2').click();
}

async function verifyStableBlock(page: Page) {
  await expect(page.getByTestId('cell-1-1')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-1-2')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-2-1')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-2-2')).toHaveAttribute('data-alive', 'true');
}

async function createLShape(page: Page) {
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
}

async function verifyNewCell(page: Page, cellTestId: string) {
  const cell = page.getByTestId(cellTestId);
  await expect(cell).toHaveAttribute('data-alive', 'true');

  // Also verify it has a color
  const backgroundColor = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(backgroundColor).not.toBe('transparent');
}

async function createOvercrowdedCell(page: Page) {
  await page.getByTestId('cell-0-1').click();
  await page.getByTestId('cell-1-0').click();
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
}

async function exportGrid(page: Page) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export Grid' }).click(),
  ]);

  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toBe('game-of-life-grid.json');

  const fileContent = await download.createReadStream();
  const buffer: Uint8Array[] = [];
  for await (const chunk of fileContent) {
    buffer.push(chunk);
  }
  const content = Buffer.concat(buffer as Uint8Array[]).toString();
  const parsedContent = JSON.parse(content);

  expect(parsedContent).toHaveProperty('grid');
  expect(Array.isArray(parsedContent.grid)).toBe(true);
}

async function importGrid(page: Page, __dirname: string) {
  const importButton = page.getByRole('button', { name: 'Import Grid' });
  await importButton.click();

  const label = page.getByTestId('file-label');
  expect(await label.isVisible()).toBe(true);

  const tempFilePath = path.join(__dirname, 'temp-grid.json');
  const gridData = {
    grid: [
      [{ alive: false }, { alive: true }, { alive: false }],
      [{ alive: true }, { alive: false }, { alive: true }],
      [{ alive: false }, { alive: true }, { alive: false }],
    ],
  };
  fs.writeFileSync(tempFilePath, JSON.stringify(gridData));

  const fileInput = page.locator('[data-testid="file-input"]');
  await fileInput.setInputFiles(tempFilePath);

  await verifyGridSize(page, 'grid', 9);

  fs.unlinkSync(tempFilePath);
}

async function getBlockColors(page: Page) {
  const colors = {};
  for (const position of ['1-1', '1-2', '2-1', '2-2']) {
    colors[position] = await page
      .getByTestId(`cell-${position}`)
      .evaluate(el => window.getComputedStyle(el).backgroundColor);
  }
  return colors;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function isTransparent(color: string): boolean {
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export async function waitForButtonEnabled(page: Page, name: string, timeout: number = 1000) {
  const button = page.getByRole('button', { name });
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const isDisabled = await button.getAttribute('disabled');
    if (!isDisabled) {
      return true;
    }
    await page.waitForTimeout(100);
  }
  return false;
}

export async function ensureHistoryExists(page: Page) {
  await runOneGeneration(page);
  await ensureGamePaused(page);
  // Wait for history to be updated
  await page.waitForTimeout(200);
}

export async function runOneGeneration(page: Page) {
  // Ensure game is paused initially
  await ensureGamePaused(page);

  // Start one generation
  await page.getByTestId('play-button').click();

  // Wait for generation to complete
  await page.waitForTimeout(600);

  // Pause the game
  await page.getByTestId('play-button').click();

  // Wait for UI to stabilize
  await page.waitForTimeout(200);
}

export async function ensureGamePaused(page: Page) {
  const button = page.getByTestId('play-button');
  const isPlaying = await button.getAttribute('data-playing');
  if (isPlaying === 'true') {
    await button.click();
    await page.waitForTimeout(100);
  }
}

export async function goToPreviousGeneration(page: Page) {
  const canGoBack = await waitForButtonEnabled(page, 'Previous');
  if (!canGoBack) {
    throw new Error('Previous generation button remained disabled');
  }
  await page.getByRole('button', { name: 'Previous' }).click();
  await page.waitForTimeout(100);
}

export async function goToNextGeneration(page: Page) {
  const canGoForward = await waitForButtonEnabled(page, 'Next');
  if (!canGoForward) {
    throw new Error('Next generation button remained disabled');
  }
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(100);
}
