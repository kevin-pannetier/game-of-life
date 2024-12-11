import { useEffect, useState } from 'react';
import classNames from 'classnames';
import Button from '../Button/Button';

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
  variant = 'secondary',
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
          variant={activeButton === option ? 'primary' : variant}
          size={size}
          className={classNames({
            'rounded-l-md': index === 0,
            'rounded-r-md': index === options.length - 1,
            '-ml-px': index !== 0,
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
