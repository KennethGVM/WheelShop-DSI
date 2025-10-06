import { useState, ChangeEvent, useEffect, InputHTMLAttributes, JSX, forwardRef } from 'react';
import { handleAllowNumber, handleAllowNegativeNumber } from '@/lib/function';
import { twMerge } from 'tailwind-merge';

type FieldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  name?: string;
  className?: string;
  prependChild?: JSX.Element;
  appendChild?: JSX.Element | null;
  isNumber?: boolean;
  allowNegative?: boolean;
  id?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  classNameInput?: string;
  autofocus?: boolean;
  classNameDiv?: string;
}

const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(function FieldInput({
  name,
  className = "mb-5",
  prependChild,
  appendChild,
  isNumber = false,
  allowNegative = false,
  id,
  onChange,
  value,
  classNameInput,
  autofocus = false,
  classNameDiv,
  ...props
}, ref) {
  const [inputValue, setInputValue] = useState<string>(value?.toString() || '');

  useEffect(() => {
    setInputValue(value?.toString() || '');
  }, [value]);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (isNumber) {
      handleAllowNumber(e);
    } else if (allowNegative) {
      handleAllowNegativeNumber(e);
    }
    setInputValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className={`${className}`}>
      {name && <label htmlFor={id} className="block mb-2 md:text-2xs text-[15px] font-medium text-secondary/80">{name}</label>}
      <div
        className={twMerge(`border rounded-lg flex justify-between items-center px-3 md:h-8 h-11 w-full group focus-within:border-blue-500 border-gray-400`, classNameDiv)}
      >
        <div className='flex items-center space-x-1 w-full'>
          {appendChild}
          <input
            ref={ref}
            id={id}
            onChange={handleChangeInput}
            className={`outline-none md:text-2xs text-base bg-transparent font-medium size-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base ${classNameInput}`}
            value={inputValue}
            autoFocus={autofocus}
            {...props}
          />
        </div>
        {prependChild}
      </div>
    </div>
  );
});

export default FieldInput;
