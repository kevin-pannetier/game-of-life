// Slider/Slider.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import SliderComponent, { SliderProps } from './Slider';

const meta: Meta<SliderProps> = {
  title: 'Ui/Slider',
  component: SliderComponent,
  argTypes: {
    defaultValue: {
      control: 'number', //TODO: Find a way to make this an array
      description: 'Initial value of the slider.',
    },
    max: {
      control: 'number',
      description: 'The maximum value of the slider.',
    },
    step: {
      control: 'number',
      description: 'Step interval for the slider.',
    },
    onValueChange: {
      action: 'valueChanged',
      description: 'Callback triggered when slider value changes.',
    },
  },
};

export default meta;

type Story = StoryObj<SliderProps>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
};

export const CustomRange: Story = {
  args: {
    defaultValue: [25],
    max: 200,
    step: 5,
  },
};

export const SteppedSlider: Story = {
  args: {
    defaultValue: [10],
    max: 100,
    step: 10,
  },
};

export const MultiStep: Story = {
  args: {
    defaultValue: [20, 80],
    max: 100,
    step: 5,
  },
};
