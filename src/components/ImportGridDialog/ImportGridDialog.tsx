import React, { useState } from 'react';

import Button from '../../ui/Button/Button';
import Dialog from '../../ui/Dialog/Dialog';

export type ImportGridDialogProps = {
  onImport: (grid: { alive: boolean }[][]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ImportGridDialog = ({ onImport, open, onOpenChange }: ImportGridDialogProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.grid)) {
          onImport(json.grid);
          onOpenChange(false);
        } else {
          setError("Invalid file format. Expected a JSON file with a 'grid' property.");
        }
      } catch {
        setError('Error parsing JSON file. Please check its content.');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Import Grid"
      description="Upload a JSON file containing the grid to import. Click to select a file."
      size="medium"
      variant="info"
    >
      <div className="p-6 text-center">
        <input
          type="file"
          accept=".json"
          onChange={handleSelectFile}
          className="hidden"
          id="file-upload"
          data-testid="file-input"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-zinc-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-zinc-600"
          data-testid="file-label"
        >
          Select File
        </label>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </Dialog>
  );
};

export default ImportGridDialog;
