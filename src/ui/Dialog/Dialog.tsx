import * as DialogPrimitive from '@radix-ui/react-dialog';

import { Cross2Icon } from '@radix-ui/react-icons';
import React from 'react';
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
  className?: string;
  'data-testid'?: string; // Custom prop for testing
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
  className,
  ...props
}: DialogProps) => {
  const contentClass = classNames(
    className,
    'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'bg-black rounded-lg shadow-xl',
    'focus:outline-none',
    {
      // Sizes
      'w-[400px]': size === 'small',
      'w-[560px]': size === 'medium',
      'w-[800px]': size === 'large',
    },
  );

  const titleClass = classNames('text-lg font-semibold mb-2', {
    'text-zinc-500': variant === 'primary',
    'text-red-500': variant === 'danger',
    'text-gray-500': variant === 'info',
  });

  const descriptionClass = classNames('text-sm mb-4', {
    'text-zinc-600': variant === 'primary',
    'text-red-600': variant === 'danger',
    'text-gray-600': variant === 'info',
  });

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={onOpenChange}
      {...props}
      data-testid={props['data-testid']}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-md" />
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
                'text-zinc-400 hover:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:ring-zinc-400',
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
