import { useEffect, useState } from 'react';

import Button from '../Button/Button';
import classNames from 'classnames';

export type ButtonGroupProps = {
  options: string[];
  defaultValue?: string;
  value?: string; // Controlled value
  onChange?: (value: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
};

const ButtonGroup = ({
  options,
  defaultValue,
  value,
  onChange,
  className,
  size = 'medium',
  disabled = false,
}: ButtonGroupProps) => {
  const [activeButton, setActiveButton] = useState(defaultValue || value || options[0]);

  // Sync internal state with `value` prop
  useEffect(() => {
    if (value) {
      setActiveButton(value);
    }
  }, [value]);

  const handleButtonClick = (option: string) => {
    setActiveButton(option);
    if (onChange) {
      onChange(option);
    }
  };

  return (
    <div className={classNames('inline-flex', className)}>
      {options.map((option, index) => (
        <Button
          key={option}
          variant={activeButton === option ? 'primary' : 'secondary'}
          size={size}
          className={classNames({
            'rounded-l-md rounded-r-none': index === 0,
            'rounded-r-md rounded-l-none': index === options.length - 1,
            'rounded-none': index !== 0 && index !== options.length - 1,
          })}
          onClick={() => handleButtonClick(option)}
          disabled={disabled}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};

export default ButtonGroup;
