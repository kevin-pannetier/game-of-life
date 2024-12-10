import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

import GridSizeSelect from '../GridSizeSelect/GridSizeSelect';
import Button from '../../ui/Button/Button';

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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl min-w-[300px]">
          <Dialog.Title className="text-xl font-bold mb-4">Start New Game</Dialog.Title>

          <Dialog.Description className="text-gray-600 mb-4">
            Select the size of your grid. The game will start in pause mode.
          </Dialog.Description>

          <GridSizeSelect onSizeSelect={setSelectedSize} className="mb-6 w-full" />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStart} disabled={!selectedSize}>
              Start Game
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NewGameDialog;
