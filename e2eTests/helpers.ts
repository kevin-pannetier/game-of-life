import { Page, expect } from '@playwright/test';

import { CELL_EMPTY_COLOR } from '../src/utils/colorUtils';
import { CellType } from '../src/components/Cell/types';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// File System Utilities
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

// Color Utilities
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function isTransparent(color: string): boolean {
  return color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export async function getBlockColors(page: Page): Promise<Record<string, string>> {
  // Wait for canvas to be ready
  const canvas = page.locator('[data-testid="grid-canvas"]');
  await expect(canvas).toBeVisible();

  const colors: Record<string, string> = {};
  const positions = [
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ];

  for (const { row, col } of positions) {
    try {
      const state = await getCellState(page, row, col);
      colors[`${row}-${col}`] = state.color || '#18181B';
    } catch (error) {
      console.error(`Failed to get state for cell ${row}-${col}:`, error);
      colors[`${row}-${col}`] = CELL_EMPTY_COLOR; // Default color if state not found
    }
  }

  return colors;
}

// Game Control
export async function ensureGamePaused(page: Page): Promise<void> {
  const button = page.getByTestId('play-button');
  const isPlaying = await button.getAttribute('data-playing');
  if (isPlaying === 'true') {
    await button.click();
    await page.waitForTimeout(100);
  }
}

export async function runOneGeneration(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(600);
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(200);
}

// History Navigation
export async function waitForHistoryReady(page: Page): Promise<void> {
  await page.waitForTimeout(500);
}

export async function waitForHistoryUpdate(page: Page, timeout = 200): Promise<void> {
  await page.waitForTimeout(timeout);
}

export async function ensureHistoryExists(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await runOneGeneration(page);
  await waitForHistoryReady(page);
}

export async function waitForButtonEnabled(
  page: Page,
  name: string,
  timeout = 1000,
): Promise<boolean> {
  const button = page.getByRole('button', { name });
  try {
    await expect(button).not.toBeDisabled({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function createNavigableHistory(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await ensureHistoryExists(page);
  await waitForHistoryUpdate(page);
}

export async function goToPreviousGeneration(page: Page): Promise<void> {
  await waitForHistoryReady(page);
  const canGoBack = await waitForButtonEnabled(page, 'Previous', 2000);
  if (!canGoBack) {
    throw new Error('Previous generation button remained disabled');
  }
  await page.getByRole('button', { name: 'Previous' }).click();
  await page.waitForTimeout(200);
}

export async function goToNextGeneration(page: Page): Promise<void> {
  await waitForHistoryReady(page);
  const canGoForward = await waitForButtonEnabled(page, 'Next', 2000);
  if (!canGoForward) {
    throw new Error('Next generation button remained disabled');
  }
  await page.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(200);
}

// Import/Export
export async function exportGrid(page: Page): Promise<void> {
  // Wait for export button to be available and visible
  const exportButton = page.getByTestId('export-button');
  await expect(exportButton).toBeVisible();

  // Setup download listener before clicking
  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

  // Click the export button
  await exportButton.click();

  // Wait for the download
  const download = await downloadPromise;

  // Verify file and content
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

export async function importGrid(page: Page): Promise<void> {
  // Wait for import button and click it
  const importButton = page.getByTestId('import-button');
  await expect(importButton).toBeVisible({ timeout: 10000 });
  await importButton.click();

  // Create temp file with test data
  const tempFilePath = path.join(getDirname(), 'temp-grid.json');
  const gridData = {
    grid: [
      [{ alive: false }, { alive: true }, { alive: false }],
      [{ alive: true }, { alive: false }, { alive: true }],
      [{ alive: false }, { alive: true }, { alive: false }],
    ],
  };
  fs.writeFileSync(tempFilePath, JSON.stringify(gridData));

  try {
    // Wait for and use the file label
    const fileLabel = page.getByTestId('file-label');
    await expect(fileLabel).toBeVisible({ timeout: 5000 });

    // Set the file
    const fileInput = page.getByTestId('file-input');
    await fileInput.setInputFiles(tempFilePath);

    // Wait for import to complete
    await page.waitForTimeout(500);

    // Verify the imported grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const expectedState = gridData.grid[row][col].alive;
        await verifyCellState(page, `${row}-${col}`, expectedState);
      }
    }
  } finally {
    // Clean up
    fs.unlinkSync(tempFilePath);
  }
}

// Button State
export async function isButtonDisabled(page: Page, name: string): Promise<boolean> {
  const button = page.getByRole('button', { name });
  const isDisabled = await button.getAttribute('disabled');
  return isDisabled !== null;
}

async function getCanvasMetrics(page: Page) {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  return box;
}

async function getCellDimensions(page: Page) {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');

  const gridSizeAttr = await canvas.getAttribute('data-grid-size');
  const size = gridSizeAttr ? parseInt(gridSizeAttr) : 3;

  return {
    cellWidth: box.width / size,
    cellHeight: box.height / size,
  };
}

export async function getCellState(page: Page, row: number, col: number): Promise<CellType> {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  const stateAttr = await canvas.getAttribute(`data-cell-${row}-${col}`);
  if (!stateAttr) throw new Error(`No state found for cell ${row}-${col}`);
  return JSON.parse(stateAttr);
}

export async function toggleCell(page: Page, cellId: string): Promise<void> {
  const [_, row, col] = cellId.split('-').map(Number);
  const { cellWidth, cellHeight } = await getCellDimensions(page);
  const box = await getCanvasMetrics(page);

  const x = box.x + col * cellWidth + cellWidth / 2;
  const y = box.y + row * cellHeight + cellHeight / 2;

  const initialState = await getCellState(page, row, col);
  await page.mouse.click(x, y);
  await page.waitForTimeout(100);

  const newState = await getCellState(page, row, col);
  expect(newState.alive).toBe(!initialState.alive);
}

export async function verifyGridSize(page: Page, expectedCount: number): Promise<void> {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  await expect(canvas).toBeVisible();
  const gridSize = await canvas.getAttribute('data-grid-size');
  expect(parseInt(gridSize || '0') ** 2).toBe(expectedCount);
}

export async function verifyCellState(
  page: Page,
  cellId: string,
  expectedAlive: boolean,
): Promise<void> {
  // Handle both formats: "cell-0-0" and "0-0"
  const [prefix, row, col] = cellId.split('-');
  const rowNum = Number(prefix === 'cell' ? row : prefix);
  const colNum = Number(prefix === 'cell' ? col : row);

  const state = await getCellState(page, rowNum, colNum);
  expect(state.alive).toBe(expectedAlive);
}

export async function setupGrid(
  page: Page,
  sizeSelectTestId: string,
  optionTestId: string,
): Promise<void> {
  const selectTrigger = page.getByTestId(sizeSelectTestId);
  await selectTrigger.click();
  await page.getByTestId(optionTestId).click();
}

export async function startGame(page: Page): Promise<void> {
  await page.getByTestId('start-game-button').click();
}

export async function activateCell(page: Page, cellId: string): Promise<void> {
  const [_, row, col] = cellId.split('-').map(Number);
  const { cellWidth, cellHeight } = await getCellDimensions(page);
  const box = await getCanvasMetrics(page);

  const x = box.x + col * cellWidth + cellWidth / 2;
  const y = box.y + row * cellHeight + cellHeight / 2;

  await page.mouse.click(x, y);
  await page.waitForTimeout(100); // Wait for canvas update
}

export async function createStableBlock(page: Page): Promise<void> {
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await activateCell(page, 'cell-2-2');
  await page.waitForTimeout(100); // Wait for all cells to update
}

export async function createLShape(page: Page): Promise<void> {
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await page.waitForTimeout(100);
}

export async function createOvercrowdedCell(page: Page): Promise<void> {
  await activateCell(page, 'cell-0-1');
  await activateCell(page, 'cell-1-0');
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await page.waitForTimeout(100);
}

export async function verifyDeadCell(page: Page, cellId: string): Promise<void> {
  const [_, row, col] = cellId.split('-').map(Number);
  const state = await getCellState(page, row, col);
  expect(state.alive).toBe(false);
}

export async function verifyNewCell(page: Page, cellId: string): Promise<void> {
  const [_, row, col] = cellId.split('-').map(Number);
  const state = await getCellState(page, row, col);
  expect(state.alive).toBe(true);
}

export async function verifyStableBlock(page: Page): Promise<void> {
  const positions = [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
  ];

  for (const [row, col] of positions) {
    const state = await getCellState(page, row, col);
    expect(state.alive).toBe(true);
  }
}

// Update runNextGeneration to ensure it works with the play button's data attributes
export async function runNextGeneration(page: Page): Promise<void> {
  const playButton = page.getByTestId('play-button');
  await playButton.click();
  await page.waitForTimeout(600); // Wait for one generation
  await playButton.click();
  await page.waitForTimeout(200); // Wait for pause to complete
}

export async function getCellColor(
  page: Page,
  row: number,
  col: number,
): Promise<string | undefined> {
  const state = await getCellState(page, row, col);
  return state.color;
}
