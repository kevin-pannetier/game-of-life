import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Game of Life', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('/');

    await setupGrid(page, 'grid-size-select', 'select-option-3');
    await startGame(page);
  });

  test('should display a grid of the correct size', async () => {
    await verifyGridSize(page, 'grid', 9);
  });

  test('should correctly toggle cell state on click', async () => {
    await toggleCell(page, 'cell-0-0');
  });

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

  test('should export the grid when the "Export to JSON" button is clicked', async () => {
    await exportGrid(page);
  });

  test('should import a grid from a JSON file', async () => {
    await importGrid(page, __dirname);
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

  await cell.click();
  await expect(cell).toHaveAttribute('data-alive', 'false');
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
  await expect(page.getByTestId(cellTestId)).toHaveAttribute('data-alive', 'true');
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
    page.getByRole('button', { name: 'Export grid to JSON' }).click(),
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
  const importButton = page.getByRole('button', { name: 'Import grid from JSON' });
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
