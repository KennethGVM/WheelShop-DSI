import { twMerge } from "tailwind-merge";

interface RadioButtonProps {
  name?: string;
  checked?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function RadioButton({ disabled, name, checked, onClick, className }: RadioButtonProps) {
  return (
    <button disabled={disabled} type="button" onClick={onClick} className="flex items-center outline-none border-0 space-x-2">
      <div className={`md:size-4 size-5 rounded-full md:p-1 p-[5px] flex items-center justify-center ${checked ? 'bg-primary' : 'bg-transparent border border-gray-400'}`}>
        <div className={`${checked ? 'bg-white' : 'bg-transparent'} size-full rounded-full`} />
      </div>
      {name && <span className={twMerge('text-secondary/80 md:text-2xs text-left text-base font-medium', className)}>{name}</span>}
    </button>
  )
}