import { Meta, StoryObj } from '@storybook/react';
import ButtonGroup, { ButtonGroupProps } from './ButtonGroup';

const meta: Meta<ButtonGroupProps> = {
  title: 'Ui/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    options: {
      control: 'object',
    },
    defaultValue: {
      control: 'text',
    },
    onChange: {
      action: 'changed',
    },
    size: {
      control: {
        type: 'select',
        options: ['small', 'medium', 'large'],
      },
    },
  },
};

export default meta;

type Story = StoryObj<ButtonGroupProps>;

export const Default: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
    defaultValue: 'Option 2',
  },
};

export const CustomOptions: Story = {
  args: {
    options: ['Small', 'Medium', 'Large'],
    defaultValue: 'Medium',
  },
};

export const ManyOptions: Story = {
  args: {
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
    defaultValue: 'Option 3',
  },
};
