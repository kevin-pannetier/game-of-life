import * as SliderPrimitive from '@radix-ui/react-slider';

export type SliderProps = {
  defaultValue?: number[];
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
};

export const Slider = ({
  defaultValue = [50],
  max = 100,
  step = 1,
  onValueChange,
}: SliderProps) => {
  return (
    <SliderPrimitive.Root
      className="relative flex h-5 w-full touch-none select-none items-center"
      defaultValue={defaultValue}
      max={max}
      step={step}
      onValueChange={onValueChange}
    >
      <SliderPrimitive.Track className="relative h-[2px] grow rounded-full bg-gray-800">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-lime-400" />
        <div className="absolute inset-0 rounded-full bg-lime-400" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className="block h-4 w-4 rounded-full bg-lime-400 shadow-lg hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
        aria-label="Slider Thumb"
      />
    </SliderPrimitive.Root>
  );
};
