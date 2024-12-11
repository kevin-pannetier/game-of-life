import Button from '../../ui/Button/Button';
import { PlayIcon, PauseIcon, DownloadIcon, UploadIcon, TrashIcon } from '@radix-ui/react-icons';
import ImportGridDialog from '../ImportGridDialog/ImportGridDialog';
import { useState } from 'react';
import { GridType } from '../Grid/types';
import Icon from '../../ui/Icon/Icon';
import ButtonGroup from '../../ui/ButtonGroup/ButtonGroup';

export type ControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onExport: () => void;
  onImport: (grid: GridType) => void;
  onClean: () => void;
};

export const Controls = ({
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onExport,
  onImport,
  onClean,
}: ControlsProps) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const speedOptions = [
    { value: 1000, label: 'Slow' },
    { value: 500, label: 'Fast' },
    { value: 100, label: 'Maximum' },
  ];

  return (
    <div className="bg-zinc-950 text-white py-2 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between">
        {/* Speed Control */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs">Speed:</span>
            <ButtonGroup
              size="small"
              variant="outline"
              options={speedOptions.map(option => option.label)}
              defaultValue={speedOptions.find(option => option.value === speed)?.label}
              onChange={selectedLabel => {
                const selectedSpeed = speedOptions.find(
                  option => option.label === selectedLabel,
                )?.value;
                if (selectedSpeed) {
                  onSpeedChange(selectedSpeed);
                }
              }}
              disabled={isPlaying}
            />
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button
            size="large"
            variant="primary"
            onClick={onTogglePlay}
            data-testid="play-button"
            className="w-16 h-16 rounded-full flex items-center justify-center focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
          >
            <Icon Icon={isPlaying ? PauseIcon : PlayIcon} size="large" />
          </Button>
        </div>

        {/* Export and Import Buttons */}
        <div className="flex items-center gap-4">
          <Button
            size="small"
            variant="outline"
            onClick={onExport}
            disabled={isPlaying}
            icons={{ before: DownloadIcon }}
          >
            Export Grid
          </Button>
          <Button
            size="small"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            disabled={isPlaying}
            icons={{ before: UploadIcon }}
          >
            Import Grid
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={onClean}
            disabled={isPlaying}
            icons={{ before: TrashIcon }}
          >
            Clean Grid
          </Button>
        </div>
      </div>
      <ImportGridDialog open={isDialogOpen} onOpenChange={setDialogOpen} onImport={onImport} />
    </div>
  );
};
