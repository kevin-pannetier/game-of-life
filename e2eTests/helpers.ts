// Types
import { Page, expect } from '@playwright/test';

import { CELL_EMPTY_COLOR } from '../src/utils/colorUtils';
import { CellType } from '../src/components/Cell/types';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

interface CellCoordinate {
  row: number;
  col: number;
}

interface CanvasMetrics {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface CellDimensions {
  cellWidth: number;
  cellHeight: number;
}

// Constants
const DEFAULT_TIMEOUT = 1000;
const CELL_UPDATE_WAIT = 100;
const GENERATION_WAIT = 600;
const HISTORY_READY_WAIT = 500;
const DOWNLOAD_TIMEOUT = 10000;

// File System Utilities
const getDirname = () => path.dirname(fileURLToPath(import.meta.url));

// Canvas Utilities
async function getCanvasMetrics(page: Page): Promise<CanvasMetrics> {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');
  return box;
}

async function getCellDimensions(page: Page): Promise<CellDimensions> {
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

async function parseCellId(cellId: string): Promise<CellCoordinate> {
  const [prefix, row, col] = cellId.split('-');
  return {
    row: Number(prefix === 'cell' ? row : prefix),
    col: Number(prefix === 'cell' ? col : row),
  };
}

// Cell State Management
export async function getCellState(page: Page, row: number, col: number): Promise<CellType> {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  const stateAttr = await canvas.getAttribute(`data-cell-${row}-${col}`);
  if (!stateAttr) throw new Error(`No state found for cell ${row}-${col}`);
  return JSON.parse(stateAttr);
}

export async function getCellColor(
  page: Page,
  row: number,
  col: number,
): Promise<string | undefined> {
  const state = await getCellState(page, row, col);
  return state.color;
}

export async function verifyCellState(
  page: Page,
  cellId: string,
  expectedAlive: boolean,
): Promise<void> {
  const { row, col } = await parseCellId(cellId);
  const state = await getCellState(page, row, col);
  expect(state.alive).toBe(expectedAlive);
}

export async function verifyDeadCell(page: Page, cellId: string): Promise<void> {
  const { row, col } = await parseCellId(cellId);
  const state = await getCellState(page, row, col);
  expect(state.alive).toBe(false);
}

export async function verifyNewCell(page: Page, cellId: string): Promise<void> {
  const { row, col } = await parseCellId(cellId);
  const state = await getCellState(page, row, col);
  expect(state.alive).toBe(true);
}

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
  const canvas = page.locator('[data-testid="grid-canvas"]');
  await expect(canvas).toBeVisible();

  const positions: CellCoordinate[] = [
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ];

  const colors: Record<string, string> = {};
  for (const { row, col } of positions) {
    try {
      const state = await getCellState(page, row, col);
      colors[`${row}-${col}`] = state.color || CELL_EMPTY_COLOR;
    } catch (error) {
      console.error(`Failed to get state for cell ${row}-${col}:`, error);
      colors[`${row}-${col}`] = CELL_EMPTY_COLOR;
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
    await page.waitForTimeout(CELL_UPDATE_WAIT);
  }
}

export async function runOneGeneration(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(GENERATION_WAIT);
  await page.getByTestId('play-button').click();
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function runNextGeneration(page: Page): Promise<void> {
  const playButton = page.getByTestId('play-button');
  await playButton.click();
  await page.waitForTimeout(GENERATION_WAIT);
  await playButton.click();
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

// Cell Interactions
export async function activateCell(page: Page, cellId: string): Promise<void> {
  const { row, col } = await parseCellId(cellId);
  const { cellWidth, cellHeight } = await getCellDimensions(page);
  const box = await getCanvasMetrics(page);

  const x = box.x + col * cellWidth + cellWidth / 2;
  const y = box.y + row * cellHeight + cellHeight / 2;

  await page.mouse.click(x, y);
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function toggleCell(page: Page, cellId: string): Promise<void> {
  const { row, col } = await parseCellId(cellId);
  const { cellWidth, cellHeight } = await getCellDimensions(page);
  const box = await getCanvasMetrics(page);

  const x = box.x + col * cellWidth + cellWidth / 2;
  const y = box.y + row * cellHeight + cellHeight / 2;

  const initialState = await getCellState(page, row, col);
  await page.mouse.click(x, y);
  await page.waitForTimeout(CELL_UPDATE_WAIT);

  const newState = await getCellState(page, row, col);
  expect(newState.alive).toBe(!initialState.alive);
}

// Pattern Creation
export async function createStableBlock(page: Page): Promise<void> {
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await activateCell(page, 'cell-2-2');
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function createLShape(page: Page): Promise<void> {
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function createOvercrowdedCell(page: Page): Promise<void> {
  await activateCell(page, 'cell-0-1');
  await activateCell(page, 'cell-1-0');
  await activateCell(page, 'cell-1-1');
  await activateCell(page, 'cell-1-2');
  await activateCell(page, 'cell-2-1');
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function verifyStableBlock(page: Page): Promise<void> {
  const positions: CellCoordinate[] = [
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ];

  for (const { row, col } of positions) {
    const state = await getCellState(page, row, col);
    expect(state.alive).toBe(true);
  }
}

// History Navigation
export const waitForHistoryReady = async (page: Page): Promise<void> => {
  await page.waitForTimeout(HISTORY_READY_WAIT);
};

export const waitForHistoryUpdate = async (page: Page, timeout = 200): Promise<void> => {
  await page.waitForTimeout(timeout);
};

export async function ensureHistoryExists(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await runOneGeneration(page);
  await waitForHistoryReady(page);
}

export async function createNavigableHistory(page: Page): Promise<void> {
  await ensureGamePaused(page);
  await ensureHistoryExists(page);
  await waitForHistoryUpdate(page);
}

// Button Controls
export async function waitForButtonEnabled(
  page: Page,
  dataTestId: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<boolean> {
  const button = page.getByTestId(dataTestId);
  try {
    await expect(button).not.toBeDisabled({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function isButtonDisabled(page: Page, name: string): Promise<boolean> {
  const button = page.getByRole('button', { name });
  const isDisabled = await button.getAttribute('disabled');
  return isDisabled !== null;
}

export async function goToPreviousGeneration(page: Page): Promise<void> {
  const buttonTestId = 'previous-button';
  await waitForHistoryReady(page);
  const canGoBack = await waitForButtonEnabled(page, buttonTestId, 2000);
  if (!canGoBack) {
    throw new Error('Previous generation button remained disabled');
  }
  await page.getByTestId(buttonTestId).click();
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

export async function goToNextGeneration(page: Page): Promise<void> {
  const buttonTestId = 'next-button';
  await waitForHistoryReady(page);
  const canGoForward = await waitForButtonEnabled(page, buttonTestId, 2000);
  if (!canGoForward) {
    throw new Error('Next generation button remained disabled');
  }
  await page.getByTestId(buttonTestId).click();
  await page.waitForTimeout(CELL_UPDATE_WAIT);
}

// Grid Setup
export async function verifyGridSize(page: Page, expectedCount: number): Promise<void> {
  const canvas = page.locator('[data-testid="grid-canvas"]');
  await expect(canvas).toBeVisible();
  const gridSize = await canvas.getAttribute('data-grid-size');
  expect(parseInt(gridSize || '0') ** 2).toBe(expectedCount);
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

// Import/Export
export async function exportGrid(page: Page): Promise<void> {
  const exportButton = page.getByTestId('export-button');
  await expect(exportButton).toBeVisible();

  const downloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT });
  await exportButton.click();

  const download = await downloadPromise;
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
}

export async function importGrid(page: Page): Promise<void> {
  const importButton = page.getByTestId('import-button');
  await expect(importButton).toBeVisible({ timeout: DOWNLOAD_TIMEOUT });
  await importButton.click();

  const tempFilePath = path.join(getDirname(), 'temp-grid.json');
  const gridData = {
    grid: {
      size: 3,
      liveCells: [
        [0, 1, '#FFFF00'], // Row, Col, Color
        [1, 0, '#00FF00'],
        [1, 2, '#FF0000'],
        [2, 1, '#0000FF'],
      ],
    },
  };

  fs.writeFileSync(tempFilePath, JSON.stringify(gridData));

  try {
    const fileLabel = page.getByTestId('file-label');
    await expect(fileLabel).toBeVisible({ timeout: 5000 });

    const fileInput = page.getByTestId('file-input');
    await fileInput.setInputFiles(tempFilePath);
    await page.waitForTimeout(500);

    // Verify that the imported grid matches the expected state
    for (const [row, col, color] of gridData.grid.liveCells) {
      const state = await getCellState(page, row, col);
      expect(state.alive).toBe(true);
      expect(state.color).toBe(color);
    }
  } finally {
    fs.unlinkSync(tempFilePath);
  }
}
