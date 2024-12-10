import { useState, useCallback, useEffect } from 'react';
import { PlayIcon } from '@radix-ui/react-icons';
import { Grid } from './components/Grid/Grid';
import { Controls } from './components/Controls/Controls';
import NewGameDialog from './components/NewGameDialog/NewGameDialog';
import { useGameOfLife } from './hooks/useGameOfLife';
import Button from './ui/Button/Button';
import './index.css';

export const App = () => {
  const [dialogOpen, setDialogOpen] = useState(true);
  const [gridSize, setGridSize] = useState<number | null>(null);
  const [speed, setSpeed] = useState(500);

  const { grid, isPlaying, toggleCell, togglePlay, nextGeneration, resetGame } = useGameOfLife(
    gridSize || 20,
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Game of Life</h1>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(true)}
            icons={{ before: PlayIcon }}
          >
            New Game
          </Button>
        </div>

        <NewGameDialog open={dialogOpen} onOpenChange={setDialogOpen} onStart={handleNewGame} />

        {gridSize && (
          <>
            <Controls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onSpeedChange={handleSpeedChange}
              speed={speed}
            />

            <div className="mt-8 bg-white p-8 rounded-lg shadow-lg overflow-auto">
              <Grid
                grid={grid}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
                onInteractionStart={handleGridInteraction}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
