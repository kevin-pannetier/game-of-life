import './index.css';

import { useCallback, useEffect, useState } from 'react';

import Button from './ui/Button/Button';
import { Controls } from './components/Controls/Controls';
import { Grid } from './components/Grid/Grid';
import NewGameDialog from './components/NewGameDialog/NewGameDialog';
import { PlayIcon } from '@radix-ui/react-icons';
import { useGameOfLife } from './hooks/useGameOfLife';

export const App = () => {
  const {
    grid,
    isPlaying,
    toggleCell,
    togglePlay,
    nextGeneration,
    resetGame,
    importGrid,
    exportGrid,
    cleanGrid,
    savedState,
    generationCount,
    goToPreviousGeneration,
    goToNextGeneration,
    canGoBack,
    canGoForward,
  } = useGameOfLife(null); // Pass null to let the hook handle initial size

  const [dialogOpen, setDialogOpen] = useState(!savedState);
  const [speed, setSpeed] = useState(savedState?.speed || 500);
  const [gridSize, setGridSize] = useState<number | null>(
    savedState ? savedState.grid.length : null,
  );

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

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-pixelate-regular">
            Game of Life{' '}
            <small className="text-sm font-outfit-medium text-zinc-500">By Kévin Pannetier</small>
          </h1>
          <div className="text-xl font-pixelate-regular">Generation: {generationCount}</div>
          <Button
            size="small"
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
                onImport={importGrid}
                onClean={cleanGrid}
                setNewGameDialogOpen={setDialogOpen}
                onPreviousGeneration={goToPreviousGeneration}
                onNextGeneration={goToNextGeneration}
                canGoBack={canGoBack}
                canGoForward={canGoForward}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
