import type { CellType } from './types';

export function Cell({ alive, color = 'black' }: CellType) {
  return (
    <div
      className="w-full h-full transition-colors duration-200 cursor-cell border border-gray-200"
      style={{
        backgroundColor: alive ? color : 'transparent',
      }}
    />
  );
}
