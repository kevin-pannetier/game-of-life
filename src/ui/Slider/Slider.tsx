import React from 'react';
import * as Slider from '@radix-ui/react-slider';

export type SliderProps = {
  defaultValue?: number[];
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
};

const SliderComponent: React.FC<SliderProps> = ({
  defaultValue = [50],
  max = 100,
  step = 1,
  onValueChange,
}) => {
  return (
    <Slider.Root
      className="relative flex h-5 w-full touch-none select-none items-center"
      defaultValue={defaultValue}
      max={max}
      step={step}
      onValueChange={onValueChange}
    >
      <Slider.Track className="relative h-[3px] grow rounded-full bg-gray-800">
        <Slider.Range className="absolute h-full rounded-full bg-lime-400" />
      </Slider.Track>
      <Slider.Thumb
        className="block h-5 w-5 rounded-full bg-lime-400 shadow-lg hover:bg-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
        aria-label="Slider Thumb"
      />
    </Slider.Root>
  );
};

export default SliderComponent;
