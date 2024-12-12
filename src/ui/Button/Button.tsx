import Icon, { IconComponent } from '../Icon/Icon';
import React, { ButtonHTMLAttributes } from 'react';

import { ReloadIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  icons?: {
    before?: IconComponent;
    after?: IconComponent;
  };
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  icons,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const buttonClass = classNames(
    'inline-flex items-center justify-center rounded font-outfit-regular focus:outline-none focus:ring-2 transition-all gap-2',
    {
      // Variants
      'bg-zinc-800 text-white hover:bg-zinc-850 focus:ring-zinc-500': variant === 'primary',
      'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300': variant === 'secondary',
      'border border-gray-500 text-gray-500 hover:bg-gray-100 focus:ring-gray-300':
        variant === 'outline',
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300': variant === 'danger',
      // Sizes
      'px-3 py-1 text-sm': size === 'small',
      'px-4 py-2 text-base': size === 'medium',
      'px-5 py-3 text-lg': size === 'large',
      // Disabled and loading state
      'opacity-70 cursor-not-allowed': isLoading || disabled,
    },
    className,
  );

  return (
    <button
      className={buttonClass}
      disabled={isLoading || disabled} // Disable the button
      {...props}
    >
      {isLoading ? (
        <Icon Icon={ReloadIcon} size={size} className="animate-spin" />
      ) : (
        <>
          {icons?.before && <Icon Icon={icons.before} size={size} />}
          {children}
          {icons?.after && <Icon Icon={icons.after} size={size} />}
        </>
      )}
    </button>
  );
};

export default Button;
