// Select/Select.tsx
import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import classNames from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

export type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "outline";
  error?: boolean;
  disabled?: boolean;
  className?: string;
};

const Select = ({
  value,
  onValueChange,
  placeholder = "Select an option...",
  options = [],
  groups = [],
  size = "medium",
  variant = "primary",
  error = false,
  disabled = false,
  className,
}: SelectProps) => {
  const triggerClassName = classNames(
    "inline-flex items-center justify-between rounded font-medium transition-all focus:outline-none focus:ring-2",
    {
      // Variants
      "bg-white border border-gray-300 text-gray-900 hover:border-gray-400 focus:ring-blue-300":
        variant === "primary",
      "bg-gray-100 border border-gray-400 text-gray-900 hover:bg-gray-200 focus:ring-gray-300":
        variant === "secondary",
      "bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 focus:ring-gray-300":
        variant === "outline",
      // Sizes
      "h-8 px-2 text-sm": size === "small",
      "h-10 px-3 text-base": size === "medium",
      "h-12 px-4 text-lg": size === "large",
      // States
      "border-red-500 focus:ring-red-200": error,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  const contentClassName = classNames(
    "overflow-hidden rounded-md bg-white shadow-lg border border-gray-200",
    {
      "text-sm": size === "small",
      "text-base": size === "medium",
      "text-lg": size === "large",
    }
  );

  const itemClassName = classNames(
    "relative flex select-none items-center rounded-sm pl-6 pr-8 py-1.5 outline-none transition-colors",
    {
      "text-sm": size === "small",
      "text-base": size === "medium",
      "text-lg": size === "large",
      "cursor-not-allowed opacity-50": disabled,
      "cursor-default": !disabled,
      "hover:bg-gray-100 focus:bg-gray-100": !disabled,
    }
  );

  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger className={triggerClassName}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className={contentClassName}>
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-gray-700">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-1">
            {options.length > 0 &&
              options.map((option) => (
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
              groups.map((group) => (
                <SelectPrimitive.Group key={group.label}>
                  <SelectPrimitive.Label className="px-6 py-1.5 text-sm font-semibold text-gray-500">
                    {group.label}
                  </SelectPrimitive.Label>
                  {group.options.map((option) => (
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

          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center bg-white text-gray-700">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};

const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectItemProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Item className={className} {...props} ref={forwardedRef}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute left-1 inline-flex w-4 items-center justify-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

SelectItem.displayName = "SelectItem";

export default Select;
