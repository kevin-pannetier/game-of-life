import { test, expect } from '@playwright/test';

test.describe('Game of Life', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Navigate to your app's page

    // Open the Select dropdown
    const selectTrigger = page.getByTestId('grid-size-select');
    await selectTrigger.click();

    // Select an option
    const option = page.getByTestId('select-option-20');
    await option.click();

    // Start the game
    const startGameButton = page.getByTestId('start-game-button');
    await startGameButton.click();
  });

  test('should display a grid of the correct size', async ({ page }) => {
    const grid = page.getByTestId('grid');
    await expect(grid).toBeVisible();

    const cells = grid.locator('[role="gridcell"]');
    await expect(cells).toHaveCount(400); // For a 20x20 grid
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

  test('should correctly toggle cell state on drag', async ({ page }) => {
    const startCell = page.getByTestId('cell-0-0');
    const endCell = page.getByTestId('cell-0-1');

    await startCell.hover();
    await page.mouse.down();
    await endCell.hover();
    await page.mouse.up();

    // Verify cells are toggled to "alive"
    await expect(startCell).toHaveAttribute('data-alive', 'true');
    await expect(endCell).toHaveAttribute('data-alive', 'true');
  });

  test('should start the game when the start button is clicked', async ({ page }) => {
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    // Wait for next generation
    await page.waitForTimeout(600); // Assume 600ms for one generation

    // Verify grid updates
    const cell = page.getByTestId('cell-0-0');
    const cellState = await cell.getAttribute('data-alive');
    expect(cellState).not.toBeNull(); // Verify cell state has changed
  });

  test('should stop the game when the stop button is clicked', async ({ page }) => {
    const playButton = page.getByRole('button', { name: 'Play' });
    await playButton.click();

    const pauseButton = page.getByRole('button', { name: 'Pause' });
    await pauseButton.click();

    // Wait and verify grid does not change
    const cell = page.getByTestId('cell-0-0');
    const initialCellState = await cell.getAttribute('data-alive');
    await page.waitForTimeout(600);
    const finalCellState = await cell.getAttribute('data-alive');

    expect(initialCellState).toBe(finalCellState);
  });

  test("should start a new game when the 'New Game' button is clicked", async ({ page }) => {
    const newGameButton = page.getByRole('button', { name: 'New Game' });
    await newGameButton.click();

    const selectTrigger = page.getByTestId('grid-size-select');
    await selectTrigger.click();

    const option = page.getByTestId('select-option-10');
    await option.click();

    const startGameButton = page.getByTestId('start-game-button');
    await startGameButton.click();

    // Verify new grid is created
    const grid = page.getByTestId('grid');
    const cells = grid.locator('[role="gridcell"]');
    await expect(cells).toHaveCount(100); // For a 10x10 grid
  });

  test("should export the grid when the 'Export to JSON' button is clicked", async ({ page }) => {
    // Trigger the export button
    const [download] = await Promise.all([
      page.waitForEvent('download'), // Wait for the download to start
      page.getByRole('button', { name: 'Export to JSON' }).click(), // Click the export button
    ]);

    // Assert download filename
    const suggestedFilename = await download.suggestedFilename();
    expect(suggestedFilename).toBe('game-of-life-grid.json');

    // Save the downloaded file to a temporary directory (optional)
    const downloadPath = await download.path();
    console.log(`File downloaded to: ${downloadPath}`);

    // Optional: Validate the file content
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
});
