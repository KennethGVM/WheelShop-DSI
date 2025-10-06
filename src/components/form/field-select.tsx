import { SelectorIcon } from "@/icons/icons";
import { SelectHTMLAttributes } from "react";

interface Options {
  name: string;
  value: string | number;
}

type FieldSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
  name?: string;
  id?: string;
  options?: Options[];
  className?: string;
  value?: string | number;
}

export default function FieldSelect({ name, id, options, value, className, ...props }: FieldSelectProps) {
  return (
    <div className={className}>
      {name && <label htmlFor={id} className="block mb-2 md:text-2xs text-[15px] font-medium text-secondary/80">{name}</label>}
      <div className="relative">
        <select
          id={id}
          value={value ?? ''}
          {...props}
          className='border appearance-none outline-none md:h-8 h-11 border-gray-400 text-secondary/80 placeholder-secondary/80 md:text-xs text-[15px] font-medium rounded-lg focus:border-blue-500 block w-full px-2 leading-normal'
        >
          {options && options.map(({ name, value }, index) => (
            <option value={value} className="text-sm font-medium text-secondary" key={index}>
              {name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <SelectorIcon className="md:size-5 size-6 text-secondary/80" />
        </div>
      </div>
    </div >
  );
}
