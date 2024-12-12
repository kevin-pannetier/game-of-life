import * as SelectPrimitive from '@radix-ui/react-select';

import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

import React from 'react';
import classNames from 'classnames';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

export type SelectProps = SelectPrimitive.SelectProps & {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  error?: boolean;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string; // Custom prop for testing
};

const Select = ({
  value,
  onValueChange,
  placeholder = 'Select an option...',
  options = [],
  groups = [],
  size = 'medium',
  variant = 'primary',
  error = false,
  disabled = false,
  className,
  ...props
}: SelectProps) => {
  const triggerClassName = classNames(
    'inline-flex items-center justify-between rounded font-outfit-regular font-medium transition-all focus:outline-none focus:ring-2',
    {
      // Variants
      'bg-zinc-900 border border-gray-600 text-white hover:border-zinc-500 focus:ring-zinc-400':
        variant === 'primary',
      'bg-gray-100 border border-gray-400 text-gray-900 hover:bg-gray-200 focus:ring-gray-300':
        variant === 'secondary',
      'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 focus:ring-gray-300':
        variant === 'outline',
      // Sizes
      'h-8 px-2 text-sm': size === 'small',
      'h-10 px-3 text-base': size === 'medium',
      'h-12 px-4 text-lg': size === 'large',
      // States
      'border-red-500 focus:ring-red-300': error,
      'opacity-50 cursor-not-allowed': disabled,
    },
    className,
  );

  const contentClassName = classNames(
    'overflow-hidden font-outfit-regular rounded-md bg-zinc-900 text-white shadow-lg border border-zinc-700',
    {
      'text-sm': size === 'small',
      'text-base': size === 'medium',
      'text-lg': size === 'large',
    },
  );

  const itemClassName = classNames(
    'relative flex select-none items-center rounded-sm pl-6 pr-8 py-1.5 outline-none transition-colors',
    {
      'text-sm': size === 'small',
      'text-base': size === 'medium',
      'text-lg': size === 'large',
      'cursor-not-allowed opacity-50': disabled,
      'cursor-default': !disabled,
      'hover:bg-zinc-600 focus:bg-zinc-600': !disabled,
      'text-white': !disabled,
      'text-gray-500': disabled,
    },
  );

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      {...props}
    >
      <SelectPrimitive.Trigger className={triggerClassName} data-testid={props['data-testid']}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={contentClassName}>
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center bg-zinc-800 text-gray-400">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1">
            {options.length > 0 &&
              options.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={itemClassName}
                >
                  {option.label}
                </SelectItem>
              ))}

            {groups.length > 0 &&
              groups.map(group => (
                <SelectPrimitive.Group key={group.label}>
                  <SelectPrimitive.Label className="px-6 py-1.5 text-sm font-semibold text-gray-400">
                    {group.label}
                  </SelectPrimitive.Label>
                  {group.options.map(option => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={itemClassName}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectPrimitive.Group>
              ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center bg-zinc-800 text-gray-400">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

const SelectItem = React.forwardRef<HTMLDivElement, SelectPrimitive.SelectItemProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <SelectPrimitive.Item
        className={className}
        data-testid={`select-option-${props.value}`}
        {...props}
        ref={forwardedRef}
      >
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="absolute left-1 inline-flex w-4 items-center justify-center text-zinc-400">
          <CheckIcon />
        </SelectPrimitive.ItemIndicator>
      </SelectPrimitive.Item>
    );
  },
);

SelectItem.displayName = 'SelectItem';

export default Select;
