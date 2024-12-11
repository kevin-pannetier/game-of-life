import React from 'react';
import GridSizeSelect from '../GridSizeSelect/GridSizeSelect';
import Button from '../../ui/Button/Button';
import Dialog from '../../ui/Dialog/Dialog';

export type NewGameDialogProps = {
  onStart: (size: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NewGameDialog = ({ onStart, open, onOpenChange }: NewGameDialogProps) => {
  const [selectedSize, setSelectedSize] = React.useState<number | null>(null);

  const handleStart = () => {
    if (selectedSize) {
      onStart(selectedSize);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Start New Game"
      description="Select the size of your grid. The game will start in pause mode."
      size="medium"
      variant="primary"
    >
      <GridSizeSelect
        onSizeSelect={setSelectedSize}
        className="mb-6 w-full"
        data-testid="grid-size-select"
      />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="cancel-button">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStart}
          disabled={!selectedSize}
          data-testid="start-game-button"
        >
          Start Game
        </Button>
      </div>
    </Dialog>
  );
};

export default NewGameDialog;
