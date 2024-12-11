import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import classNames from 'classnames';

export type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'danger' | 'info';
  hideClose?: boolean;
} & DialogPrimitive.DialogProps;

const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'medium',
  variant = 'primary',
  hideClose = false,
  ...props
}: DialogProps) => {
  const contentClass = classNames(
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bg-white rounded-lg shadow-xl',
    'focus:outline-none',
    {
      // Sizes
      'w-[400px]': size === 'small',
      'w-[560px]': size === 'medium',
      'w-[800px]': size === 'large',
      // Variants affect border color
      'border-2 border-blue-200': variant === 'primary',
      'border-2 border-red-200': variant === 'danger',
      'border-2 border-gray-200': variant === 'info',
    },
  );

  const titleClass = classNames('text-lg font-semibold mb-2', {
    'text-blue-900': variant === 'primary',
    'text-red-900': variant === 'danger',
    'text-gray-900': variant === 'info',
  });

  const descriptionClass = classNames('text-sm mb-4', {
    'text-blue-700': variant === 'primary',
    'text-red-700': variant === 'danger',
    'text-gray-700': variant === 'info',
  });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content className={contentClass}>
          <div className="p-6">
            {title && <DialogPrimitive.Title className={titleClass}>{title}</DialogPrimitive.Title>}
            {description && (
              <DialogPrimitive.Description className={descriptionClass}>
                {description}
              </DialogPrimitive.Description>
            )}
            {children}
          </div>

          {!hideClose && (
            <DialogPrimitive.Close
              className={classNames(
                'absolute top-4 right-4 rounded-full p-1',
                'text-gray-400 hover:text-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-gray-400',
              )}
            >
              <Cross2Icon />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default Dialog;
