import { Page, expect } from '@playwright/test';

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
  const colors = {};
  for (const position of ['1-1', '1-2', '2-1', '2-2']) {
    colors[position] = await page
      .getByTestId(`cell-${position}`)
      .evaluate(el => window.getComputedStyle(el).backgroundColor);
  }
  return colors;
}

// Game Setup
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

export async function runNextGeneration(page: Page): Promise<void> {
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(600);
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(100);
}

// Cell Operations
export async function activateCell(page: Page, cellTestId: string): Promise<void> {
  await page.getByTestId(cellTestId).click();
}

export async function toggleCell(page: Page, cellTestId: string): Promise<void> {
  const cell = page.getByTestId(cellTestId);
  await cell.click();
  await expect(cell).toHaveAttribute('data-alive', 'true');

  const colorWhenAlive = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(colorWhenAlive).not.toMatch(/^(transparent|rgba\(0,\s*0,\s*0,\s*0\))$/);

  await cell.click();
  await expect(cell).toHaveAttribute('data-alive', 'false');

  const colorWhenDead = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(isTransparent(colorWhenDead)).toBe(true);
}

// Pattern Creation
export async function createStableBlock(page: Page): Promise<void> {
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
  await page.getByTestId('cell-2-2').click();
}

export async function createLShape(page: Page): Promise<void> {
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
}

export async function createOvercrowdedCell(page: Page): Promise<void> {
  await page.getByTestId('cell-0-1').click();
  await page.getByTestId('cell-1-0').click();
  await page.getByTestId('cell-1-1').click();
  await page.getByTestId('cell-1-2').click();
  await page.getByTestId('cell-2-1').click();
}

// State Verification
export async function verifyGridSize(
  page: Page,
  gridTestId: string,
  expectedCount: number,
): Promise<void> {
  const grid = page.getByTestId(gridTestId);
  await expect(grid).toBeVisible();
  const cells = grid.locator('[role="gridcell"]');
  await expect(cells).toHaveCount(expectedCount);
}

export async function verifyDeadCell(page: Page, cellTestId: string): Promise<void> {
  await expect(page.getByTestId(cellTestId)).toHaveAttribute('data-alive', 'false');
}

export async function verifyNewCell(page: Page, cellTestId: string): Promise<void> {
  const cell = page.getByTestId(cellTestId);
  await expect(cell).toHaveAttribute('data-alive', 'true');
  const backgroundColor = await cell.evaluate(el => window.getComputedStyle(el).backgroundColor);
  expect(backgroundColor).not.toBe('transparent');
}

export async function verifyStableBlock(page: Page): Promise<void> {
  await expect(page.getByTestId('cell-1-1')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-1-2')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-2-1')).toHaveAttribute('data-alive', 'true');
  await expect(page.getByTestId('cell-2-2')).toHaveAttribute('data-alive', 'true');
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

export async function importGrid(page: Page): Promise<void> {
  const importButton = page.getByRole('button', { name: 'Import Grid' });
  await importButton.click();

  const label = page.getByTestId('file-label');
  await expect(label).toBeVisible();

  const tempFilePath = path.join(getDirname(), 'temp-grid.json');
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

// Button State
export async function isButtonDisabled(page: Page, name: string): Promise<boolean> {
  const button = page.getByRole('button', { name });
  const isDisabled = await button.getAttribute('disabled');
  return isDisabled !== null;
}
