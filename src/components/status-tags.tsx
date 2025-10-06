import { twMerge } from "tailwind-merge";

interface Props {
  status: boolean;
  text: string;
  className?: string;
  color?: string | null;
  textColor?: string | null;
}

export default function StatusTags({ status, text, className = '', color, textColor }: Props) {
  return (
    <span className={twMerge(`${!textColor ? status ? 'text-[#014b40]' : 'text-[#d10000]' : textColor} ${!color ? status ? 'bg-[#affebf]' : 'bg-[#ffabab]' : color} md:text-xs text-2xs font-semibold py-1 px-2 rounded-md`, className)}>{text}</span>
  )
}