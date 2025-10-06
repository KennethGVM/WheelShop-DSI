import { ButtonHTMLAttributes, MouseEvent } from "react";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  name?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  styleButton?: 'primary' | 'secondary' | 'simple' | 'none' | 'red';
};


export default function Button({
  styleButton = 'none',
  name,
  className,
  onClick,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={(e) => onClick?.(e)}
      className={`flex items-center justify-center text-center cursor-pointer rounded-lg 
        ${styleButton === 'secondary'
          ? 'bg-gradient-primary-base active:bg-[#1a1a1a] hover:bg-[#1a1a1a] text-white shadow-button-primary active:shadow-button-primary-pressed bg-gradient-primary'
          : styleButton === 'primary'
            ? 'shadow-default active:shadow-pressed'
            : styleButton === 'simple'
              ? 'active:shadow-pressed'
              : styleButton === 'red'
                ? 'bg-[#c70a24] hover:bg-[#A30A24] text-white shadow-button-red active:shadow-button-red-pressed'
                : ''
        } ${className}`}
      {...props}
    >
      {children}
      {name && name}
    </button>
  );
}
