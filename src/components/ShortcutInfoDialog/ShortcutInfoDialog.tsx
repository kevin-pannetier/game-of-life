import Button from '../../ui/Button/Button';
import Dialog from '../../ui/Dialog/Dialog';

export type ShortcutInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShortcutInfoDialog = ({ open, onOpenChange }: ShortcutInfoDialogProps) => {
  const shortcuts = [
    { key: 'K', action: 'Open the shortcut modal' },
    { key: 'Space', action: 'Play/Pause the game' },
    { key: '1', action: 'Set speed to Slow' },
    { key: '2', action: 'Set speed to Fast' },
    { key: '3', action: 'Set speed to Maximum' },
    { key: 'E', action: 'Export the grid' },
    { key: 'I', action: 'Open the Import Grid dialog' },
    { key: 'C', action: 'Clean the grid' },
    { key: 'Esc', action: 'Open the New Game dialog' },
    { key: '←', action: 'Go to previous generation' },
    { key: '→', action: 'Go to next generation' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Keyboard Shortcuts"
      description="Use the following shortcuts to control the game:"
      size="medium"
      variant="info"
    >
      <ul className="space-y-3">
        {shortcuts.map(({ key, action }) => (
          <li key={key} className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center rounded bg-zinc-800 px-2 py-1 text-sm font-mono text-white border border-zinc-600">
              {key}
            </span>
            <span className="text-sm text-zinc-400">{action}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-end gap-3 font-outfit-regular">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
};

export default ShortcutInfoDialog;
