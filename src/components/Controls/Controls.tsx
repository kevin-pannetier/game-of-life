import Button from '../../ui/Button/Button';
import { PlayIcon, PauseIcon } from '@radix-ui/react-icons';
import ImportGridDialog from '../ImportGridDialog/ImportGridDialog';
import { useState } from 'react';
import { GridType } from '../Grid/types';
import Icon from '../../ui/Icon/Icon';

export type ControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onExport: () => void;
  onImport: (grid: GridType) => void;
};

export const Controls = ({
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onExport,
  onImport,
}: ControlsProps) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="bg-black text-white py-2 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs">Speed:</span>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm">{speed}ms</span>
          </div>
          <Button
            size="small"
            variant="secondary"
            onClick={onExport}
            disabled={isPlaying}
            className="text-white"
          >
            Export grid to JSON
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setDialogOpen(true)}
            disabled={isPlaying}
            className="text-white"
          >
            Import grid from JSON
          </Button>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button
            size="large"
            variant="primary"
            onClick={onTogglePlay}
            data-testid="play-button"
            className="w-16 h-16 rounded-full flex items-center justify-center focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
          >
            <Icon Icon={isPlaying ? PlayIcon : PauseIcon} size="large" />
          </Button>
        </div>
      </div>
      <ImportGridDialog open={isDialogOpen} onOpenChange={setDialogOpen} onImport={onImport} />
    </div>
  );
};
