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
  const playButton = page.getByTestId('play-button');
  await playButton.click();
  await page.waitForTimeout(600);
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
