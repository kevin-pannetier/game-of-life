import Button from '../../ui/Button/Button';
import { PlayIcon, PauseIcon } from '@radix-ui/react-icons';
import ImportGridDialog from '../ImportGridDialog/ImportGridDialog';
import { useState } from 'react';
import Icon from '../../ui/Icon/Icon';
import { GridType } from '../Grid/types';

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
    <div className="flex items-center gap-4 mb-4">
      <Button
        variant="primary"
        onClick={onTogglePlay}
        icons={{ before: isPlaying ? PauseIcon : PlayIcon }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </Button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Speed:</span>
        <input
          type="range"
          min="100"
          max="1000"
          step="100"
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-600">{speed}ms</span>
      </div>

      <Button variant="secondary" onClick={onExport} disabled={isPlaying}>
        {isPlaying ? <Icon Icon={PauseIcon} /> : 'Export grid to JSON'}
      </Button>

      <Button variant="secondary" onClick={() => setDialogOpen(true)} disabled={isPlaying}>
        {isPlaying ? <Icon Icon={PauseIcon} /> : 'Import grid from JSON'}
      </Button>
      <ImportGridDialog open={isDialogOpen} onOpenChange={setDialogOpen} onImport={onImport} />
    </div>
  );
};
