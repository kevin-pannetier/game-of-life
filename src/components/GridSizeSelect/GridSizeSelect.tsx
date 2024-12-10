import Select from "../../ui/Select/Select";

export type GridSizeSelectProps = {
  onSizeSelect: (size: number) => void;
  className?: string;
};

const GridSizeSelect = ({ onSizeSelect, className }: GridSizeSelectProps) => {
  // Predefined size options
  const sizeOptions = [
    { value: "3", label: "3x3 (Tiny)" },
    { value: "10", label: "10x10 (Small)" },
    { value: "20", label: "20x20 (Medium)" },
    { value: "50", label: "50x50 (Large)" },
    { value: "100", label: "100x100 (Extra Large)" },
    { value: "1000", label: "1000x1000 (Maximum)" },
  ];

  const handleSizeChange = (value: string) => {
    const size = parseInt(value, 10);
    if (size >= 3 && size <= 1000) {
      onSizeSelect(size);
    }
  };

  return (
    <Select
      placeholder="Select grid size..."
      options={sizeOptions}
      onValueChange={handleSizeChange}
      className={className}
    />
  );
};

export default GridSizeSelect;
