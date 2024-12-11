import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe('Game of Life', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Navigate to your app's page

    // Open the Select dropdown
    const selectTrigger = page.getByTestId('grid-size-select');
    await selectTrigger.click();

    // Select an option
    const option = page.getByTestId('select-option-3'); // Small grid for testing
    await option.click();

    // Start the game
    const startGameButton = page.getByTestId('start-game-button');
    await startGameButton.click();
  });

  test('should display a grid of the correct size', async ({ page }) => {
    const grid = page.getByTestId('grid');
    await expect(grid).toBeVisible();

    const cells = grid.locator('[role="gridcell"]');
    await expect(cells).toHaveCount(9); // For a 3x3 grid
  });

  test('should correctly toggle cell state on click', async ({ page }) => {
    const cell = page.getByTestId('cell-0-0');
    await cell.click();

    // Verify cell is toggled to "alive"
    await expect(cell).toHaveAttribute('data-alive', 'true');

    // Click again to toggle "dead"
    await cell.click();
    await expect(cell).toHaveAttribute('data-alive', 'false');
  });

  test('should kill lonely cells', async ({ page }) => {
    const cell = page.getByTestId('cell-1-1');
    await cell.click(); // Activate a single cell

    // Start the game
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    // Wait for the next generation
    await page.waitForTimeout(600);

    // Verify the cell is dead
    await expect(cell).toHaveAttribute('data-alive', 'false');
  });

  test('should keep cells alive with 2 or 3 neighbors', async ({ page }) => {
    // Create a stable block pattern
    await page.getByTestId('cell-1-1').click();
    await page.getByTestId('cell-1-2').click();
    await page.getByTestId('cell-2-1').click();
    await page.getByTestId('cell-2-2').click();

    // Start the game
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    // Wait for the next generation
    await page.waitForTimeout(600);

    // Verify the block remains stable
    await expect(page.getByTestId('cell-1-1')).toHaveAttribute('data-alive', 'true');
    await expect(page.getByTestId('cell-1-2')).toHaveAttribute('data-alive', 'true');
    await expect(page.getByTestId('cell-2-1')).toHaveAttribute('data-alive', 'true');
    await expect(page.getByTestId('cell-2-2')).toHaveAttribute('data-alive', 'true');
  });

  test('should birth new cells with exactly 3 neighbors', async ({ page }) => {
    // Set up an "L" shape
    await page.getByTestId('cell-1-1').click();
    await page.getByTestId('cell-1-2').click();
    await page.getByTestId('cell-2-1').click();

    // Start the game
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    // Wait for the next generation
    await page.waitForTimeout(600);

    // Verify a new cell is born
    await expect(page.getByTestId('cell-2-2')).toHaveAttribute('data-alive', 'true');
  });

  test('should kill overcrowded cells', async ({ page }) => {
    // Set up overcrowded center cell
    await page.getByTestId('cell-0-1').click();
    await page.getByTestId('cell-1-0').click();
    await page.getByTestId('cell-1-1').click();
    await page.getByTestId('cell-1-2').click();
    await page.getByTestId('cell-2-1').click();

    // Start the game
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    // Wait for the next generation
    await page.waitForTimeout(600);

    // Verify the overcrowded cell is dead
    await expect(page.getByTestId('cell-1-1')).toHaveAttribute('data-alive', 'false');
  });

  test('should export the grid when the "Export to JSON" button is clicked', async ({ page }) => {
    // Trigger the export button
    const [download] = await Promise.all([
      page.waitForEvent('download'), // Wait for the download to start
      page.getByRole('button', { name: 'Export grid to JSON' }).click(), // Click the export button
    ]);

    // Assert download filename
    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toBe('game-of-life-grid.json');

    // Validate the file content
    const fileContent = await download.createReadStream();
    const buffer: Uint8Array[] = [];
    for await (const chunk of fileContent) {
      buffer.push(chunk);
    }
    const content = Buffer.concat(buffer as Uint8Array[]).toString();
    const parsedContent = JSON.parse(content);

    expect(parsedContent).toHaveProperty('grid');
    expect(Array.isArray(parsedContent.grid)).toBe(true);
  });

  test('should import a grid from a JSON file', async ({ page }) => {
    const importButton = page.getByRole('button', { name: 'Import grid from JSON' });
    await importButton.click();

    const label = page.getByTestId('file-label');
    expect(await label.isVisible()).toBe(true);

    // Verify file upload works
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

    const grid = page.getByTestId('grid');
    await expect(grid).toBeVisible();

    const cells = grid.locator('[role="gridcell"]');
    await expect(cells).toHaveCount(9); // For a 3x3 grid

    fs.unlinkSync(tempFilePath);
  });
});
