import { TextareaHTMLAttributes } from 'react';

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  name?: string;
  className?: string;
};

export default function TextArea({
  name,
  className = "mb-5",
  placeholder,
  id,
  onChange,
  value,
  ...props
}: TextAreaProps) {
  return (
    <div className={className}>
      {name && <label htmlFor={id} className="block mb-2 md:text-2xs text-[15px] font-medium text-secondary/80">{name}</label>}
      <textarea
        className="resize-none outline-none border md:placeholder:text-2xs placeholder:text-base placeholder-secondary/80 border-gray-400 text-secondary/80 md:text-2xs text-base font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-1"
        onChange={onChange}
        id={id}
        placeholder={placeholder}
        value={value}
        {...props}
      />
    </div>
  );
}
