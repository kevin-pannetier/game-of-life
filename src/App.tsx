import { useState, useCallback, useEffect } from 'react';
import { PlayIcon } from '@radix-ui/react-icons';
import { Grid } from './components/Grid/Grid';
import { Controls } from './components/Controls/Controls';
import NewGameDialog from './components/NewGameDialog/NewGameDialog';
import { useGameOfLife } from './hooks/useGameOfLife';
import Button from './ui/Button/Button';
import './index.css';
import { GridType } from './components/Grid/types';

export const App = () => {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [gridSize, setGridSize] = useState<number | null>(null);
  const [speed, setSpeed] = useState(500);

  const {
    grid,
    isPlaying,
    toggleCell,
    togglePlay,
    nextGeneration,
    resetGame,
    exportGrid,
    setGrid,
    cleanGrid,
  } = useGameOfLife(gridSize || 20);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isPlaying) {
      intervalId = setInterval(() => {
        nextGeneration();
      }, speed);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, speed, nextGeneration]);

  const handleGridInteraction = useCallback(() => {
    if (isPlaying) {
      togglePlay();
    }
  }, [isPlaying, togglePlay]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      toggleCell(row, col);
    },
    [toggleCell],
  );

  const handleCellDrag = useCallback(
    (row: number, col: number) => {
      toggleCell(row, col);
    },
    [toggleCell],
  );

  const handleNewGame = useCallback(
    (size: number) => {
      setGridSize(size);
      resetGame(size);
      setDialogOpen(false);
    },
    [resetGame],
  );

  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSpeed(newSpeed);
  }, []);

  const handleImport = (importedGrid: GridType) => {
    setGrid(importedGrid);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-pixelate-regular">
            Game of Life{' '}
            <small className="text-sm font-outfit-medium text-zinc-500">By Kévin Pannetier</small>
          </h1>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
            icons={{ before: PlayIcon }}
          >
            New Game
          </Button>
        </div>
      </div>

      <NewGameDialog open={dialogOpen} onOpenChange={setDialogOpen} onStart={handleNewGame} />

      {gridSize && (
        <>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center px-8 mb-20">
            <div className="w-full max-w-6xl ">
              <Grid
                grid={grid}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
                onInteractionStart={handleGridInteraction}
              />
            </div>
          </div>

          {/* Fixed Controls Bar at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-6xl mx-auto p-4">
              <Controls
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                onSpeedChange={handleSpeedChange}
                speed={speed}
                onExport={exportGrid}
                onImport={handleImport}
                onClean={cleanGrid}
                setNewGameDialogOpen={setDialogOpen}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
