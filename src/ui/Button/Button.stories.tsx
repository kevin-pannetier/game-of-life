import Button, { ButtonProps } from './Button';
import { CheckIcon, StarIcon } from '@radix-ui/react-icons';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<ButtonProps> = {
  title: 'Ui/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    isLoading: true,
    children: 'Button',
  },
};

export const LoadingWithIcons: Story = {
  args: {
    variant: 'secondary',
    size: 'large',
    isLoading: true,
    icons: { before: CheckIcon, after: StarIcon },
    children: 'Button with Icons',
  },
};

export const Default: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    children: 'Button',
    icons: { before: StarIcon },
  },
};

export const Disabled: Story = {
  args: {
    variant: 'outline',
    size: 'medium',
    disabled: true,
    children: 'Disabled Button',
  },
};
