import Button from '../../ui/Button/Button';
import { PlayIcon, PauseIcon } from '@radix-ui/react-icons';

export type ControlsProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
};

export const Controls = ({ isPlaying, onTogglePlay, speed, onSpeedChange }: ControlsProps) => {
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
    </div>
  );
};
