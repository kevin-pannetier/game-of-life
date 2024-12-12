export const CELL_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
];

// Get a random color from our predefined colors
export const getRandomColor = (): string => {
  return CELL_COLORS[Math.floor(Math.random() * CELL_COLORS.length)];
};

// Get surrounding cells' colors and their frequencies
export const getSurroundingColors = (
  grid: Array<Array<{ alive: boolean; color?: string }>>,
  row: number,
  col: number,
): Map<string, number> => {
  const colorFrequency = new Map<string, number>();

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const newRow = row + i;
      const newCol = col + j;

      if (
        newRow >= 0 &&
        newRow < grid.length &&
        newCol >= 0 &&
        newCol < grid[0].length &&
        grid[newRow][newCol].alive &&
        grid[newRow][newCol].color
      ) {
        const color = grid[newRow][newCol].color!;
        colorFrequency.set(color, (colorFrequency.get(color) || 0) + 1);
      }
    }
  }

  return colorFrequency;
};

// Get the most frequent color from surrounding cells
export const getMostFrequentColor = (colorFrequency: Map<string, number>): string | null => {
  if (colorFrequency.size === 0) return null;

  let maxFreq = 0;
  let mostFrequentColor = null;

  for (const [color, freq] of colorFrequency.entries()) {
    if (freq > maxFreq) {
      maxFreq = freq;
      mostFrequentColor = color;
    }
  }

  return mostFrequentColor;
};

// Determine cell color based on rules
export const determineCellColor = (
  grid: Array<Array<{ alive: boolean; color?: string }>>,
  row: number,
  col: number,
  previousGrid?: Array<Array<{ alive: boolean; color?: string }>>,
): string => {
  // Check previous generation if available
  if (previousGrid) {
    const prevColors = getSurroundingColors(previousGrid, row, col);
    const mostFrequentPrevColor = getMostFrequentColor(prevColors);
    if (mostFrequentPrevColor) return mostFrequentPrevColor;
  }

  // Check current generation
  const currentColors = getSurroundingColors(grid, row, col);
  const mostFrequentCurrentColor = getMostFrequentColor(currentColors);
  if (mostFrequentCurrentColor) return mostFrequentCurrentColor;

  // No surrounding cells, assign random color
  return getRandomColor();
};
