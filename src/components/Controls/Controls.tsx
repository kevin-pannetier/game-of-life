import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  PauseIcon,
  PlayIcon,
  QuestionMarkCircledIcon,
  TrashIcon,
  UploadIcon,
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';

import Button from '../../ui/Button/Button';
import ButtonGroup from '../../ui/ButtonGroup/ButtonGroup';
import Icon from '../../ui/Icon/Icon';
import ImportGridDialog from '../ImportGridDialog/ImportGridDialog';
import ShortcutInfoDialog from '../ShortcutInfoDialog/ShortcutInfoDialog';
import Tooltip from '../../ui/Tooltip/Tooltip';

export type ControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onClean: () => void;
  setNewGameDialogOpen: (open: boolean) => void;
  onPreviousGeneration: () => void;
  onNextGeneration: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
};

export const Controls = ({
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onExport,
  onImport,
  onClean,
  setNewGameDialogOpen,
  onPreviousGeneration,
  onNextGeneration,
  canGoBack,
  canGoForward,
}: ControlsProps) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isShortcutDialogOpen, setShortcutDialogOpen] = useState(false);

  const speedOptions = [
    { value: 1000, label: 'x1' },
    { value: 500, label: 'x2' },
    { value: 100, label: 'x3' },
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        onTogglePlay();
      }

      if (event.code === 'Digit1') {
        onSpeedChange(1000);
      }
      if (event.code === 'Digit2') {
        onSpeedChange(500);
      }
      if (event.code === 'Digit3') {
        onSpeedChange(100);
      }

      if (event.code === 'KeyE') {
        onExport();
      }

      if (event.code === 'KeyI') {
        setDialogOpen(true);
      }

      if (event.code === 'KeyC') {
        onClean();
      }

      if (event.code === 'Escape') {
        setNewGameDialogOpen(true);
      }

      if (event.code === 'KeyK') {
        setShortcutDialogOpen(true);
      }

      if (!isPlaying) {
        if (event.code === 'ArrowLeft' && canGoBack) {
          onPreviousGeneration();
        }
        if (event.code === 'ArrowRight' && canGoForward) {
          onNextGeneration();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    canGoBack,
    canGoForward,
    isPlaying,
    onClean,
    onExport,
    onNextGeneration,
    onPreviousGeneration,
    onSpeedChange,
    onTogglePlay,
    setNewGameDialogOpen,
  ]);

  return (
    <div className="bg-zinc-950 text-white py-2 fixed bottom-0 left-0 right-0">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs">Speed:</span>
            <ButtonGroup
              size="small"
              options={speedOptions.map(option => option.label)}
              defaultValue={speedOptions.find(option => option.value === speed)?.label}
              value={speedOptions.find(option => option.value === speed)?.label}
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

        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <Tooltip content="Go to previous generation" side="top">
            <Button
              size="small"
              variant="outline"
              onClick={onPreviousGeneration}
              disabled={isPlaying || !canGoBack}
              className="mr-2"
              data-testid="previous-button"
            >
              <Icon Icon={ChevronLeftIcon} size="small" />
            </Button>
          </Tooltip>

          <Tooltip content={isPlaying ? 'Pause' : 'Play'} side="top">
            <Button
              size="large"
              variant="primary"
              onClick={onTogglePlay}
              data-testid="play-button"
              className="w-16 h-16 rounded-full flex items-center justify-center focus:outline-none transition-transform duration-200 ease-in-out transform hover:scale-110 hover:-translate-y-1"
            >
              <Icon Icon={isPlaying ? PauseIcon : PlayIcon} size="large" />
            </Button>
          </Tooltip>

          <Tooltip content="Go to next generation" side="top">
            <Button
              size="small"
              variant="outline"
              onClick={onNextGeneration}
              disabled={isPlaying || !canGoForward}
              className="ml-2"
              data-testid="next-button"
            >
              <Icon Icon={ChevronRightIcon} size="small" />
            </Button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-4">
          <Tooltip content="Export Grid to JSON" side="top">
            <Button
              size="small"
              variant="outline"
              onClick={onExport}
              disabled={isPlaying}
              data-testid="export-button"
            >
              <Icon Icon={DownloadIcon} size="small" />
            </Button>
          </Tooltip>

          <Tooltip content="Import Grid from JSON" side="top">
            <Button
              size="small"
              variant="outline"
              onClick={() => setDialogOpen(true)}
              disabled={isPlaying}
              data-testid="import-button"
            >
              <Icon Icon={UploadIcon} size="small" />
            </Button>
          </Tooltip>

          <Tooltip content="Clean the Grid" side="top">
            <Button
              size="small"
              variant="danger"
              onClick={onClean}
              disabled={isPlaying}
              data-testid="clean-button"
            >
              <Icon Icon={TrashIcon} size="small" />
            </Button>
          </Tooltip>

          <Tooltip content="See keyboard shortcuts" side="top">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShortcutDialogOpen(true)}
              data-testid="shortcuts-button"
            >
              <Icon Icon={QuestionMarkCircledIcon} size="small" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <ShortcutInfoDialog open={isShortcutDialogOpen} onOpenChange={setShortcutDialogOpen} />
      <ImportGridDialog open={isDialogOpen} onOpenChange={setDialogOpen} onImport={onImport} />
    </div>
  );
};
