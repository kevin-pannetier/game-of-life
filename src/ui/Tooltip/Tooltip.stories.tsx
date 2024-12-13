import { InfoCircledIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Meta, StoryObj } from '@storybook/react';
import Tooltip, { TooltipProps } from './Tooltip';

import Button from '../Button/Button';

const meta: Meta<TooltipProps> = {
  title: 'Ui/Tooltip',
  component: Tooltip,
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    delayDuration: {
      control: 'number',
    },
  },
  decorators: [
    Story => (
      <div className="h-[200px] w-full flex items-center justify-center">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<TooltipProps>;

export const Default: Story = {
  args: {
    content: 'Tooltip content',
    children: (
      <Button size="small" variant="outline" icons={{ before: InfoCircledIcon }}>
        Hover me
      </Button>
    ),
  },
};

export const WithDifferentSides: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Top tooltip" side="top">
        <Button size="small">Top</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button size="small">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button size="small">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" side="left">
        <Button size="small">Left</Button>
      </Tooltip>
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    content: 'Help information',
    children: (
      <Button size="small" variant="secondary" icons={{ before: QuestionMarkCircledIcon }}>
        Help
      </Button>
    ),
  },
};

export const CustomStyling: Story = {
  args: {
    content: 'Custom styled tooltip',
    className: 'bg-blue-600',
    children: (
      <Button size="small" variant="primary">
        Custom Style
      </Button>
    ),
  },
};
