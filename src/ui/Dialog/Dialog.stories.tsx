import Dialog, { DialogProps } from './Dialog';
import { Meta, StoryObj } from '@storybook/react';

import Button from '../Button/Button';
import { useState } from 'react';

const meta: Meta<DialogProps> = {
  title: 'Ui/Dialog',
  component: Dialog,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    hideClose: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<DialogProps>;

// Helper component for triggering dialog
const DialogDemo = (props: DialogProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog {...props} open={open} onOpenChange={setOpen}>
        <div className="space-y-4">
          <p>This is the dialog content.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export const Default: Story = {
  render: args => <DialogDemo {...args} />,
  args: {
    title: 'Dialog Title',
    description: "This is a description of the dialog's purpose.",
    variant: 'primary',
    size: 'medium',
  },
};

export const Danger: Story = {
  render: args => <DialogDemo {...args} />,
  args: {
    title: 'Delete Confirmation',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    variant: 'danger',
    size: 'small',
  },
};

export const Large: Story = {
  render: args => <DialogDemo {...args} />,
  args: {
    title: 'Large Dialog',
    description: 'This is a large dialog with more content space.',
    variant: 'info',
    size: 'large',
    children: (
      <div className="space-y-4">
        <p>This is a larger dialog with more content.</p>
        <p>It can contain more information and larger forms or content areas.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const NoHeaderElements: Story = {
  render: args => <DialogDemo {...args} />,
  args: {
    size: 'medium',
    children: (
      <div className="space-y-4">
        <p>A dialog without title or description.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const CustomContent: Story = {
  render: args => <DialogDemo {...args} />,
  args: {
    title: 'Custom Content',
    size: 'medium',
    children: (
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <p>This is a custom content area</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Input Field</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Submit</Button>
          </div>
        </form>
      </div>
    ),
  },
};
