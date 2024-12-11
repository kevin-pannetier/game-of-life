import { useState } from 'react';
import classNames from 'classnames';
import Button from '../Button/Button';

export type ButtonGroupProps = {
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
};

const ButtonGroup = ({
  options,
  defaultValue,
  onChange,
  className,
  size,
  disabled,
  variant = 'secondary',
}: ButtonGroupProps) => {
  const [activeButton, setActiveButton] = useState(defaultValue || options[0]);

  const handleButtonClick = (value: string) => {
    setActiveButton(value);
    if (onChange) {
      onChange(value);
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
