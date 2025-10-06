import { FC, JSX } from 'react';
import { twMerge } from 'tailwind-merge';

interface MenuItemProps {
  children: JSX.Element;
  text: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
  classNameLabel?: string;
}

const MenuItem: FC<MenuItemProps> = ({ text, classNameLabel, className = "", active = false, children, onClick }) => (
  <div className={twMerge(`flex items-center space-x-2 ${active ? 'bg-white' : 'bg-transparent'} w-full ${!active && 'hover:bg-white/30'} cursor-pointer py-0.5 px-3 rounded-lg`, className)} onClick={onClick}>
    {children}
    <h3 className={twMerge("md:text-[#4a4a4a] text-[#303030] font-[550] md:text-2xs text-[15px]", classNameLabel)}>{text}</h3>
  </div>
);

export default MenuItem;
