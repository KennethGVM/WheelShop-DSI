import { useState, useEffect, MouseEvent } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  name?: string;
  onChange?: (value: boolean) => void;
  initialValue?: boolean;
  disabled?: boolean;
  className?: string;
  classNameLabel?: string;
}

export default function CheckBox({ name, className, classNameLabel, onChange, initialValue = false, disabled = false }: Props) {
  const [checked, setChecked] = useState(initialValue);

  useEffect(() => {
    setChecked(initialValue);
  }, [initialValue]);

  const toggleCheck = (e: MouseEvent<HTMLLabelElement>) => {
    e.stopPropagation();
    if (!disabled) {
      setChecked((prev) => {
        const newValue = !prev;
        onChange?.(newValue);
        return newValue;
      });
    }
  };

  return (
    <label onClick={toggleCheck} className={`relative w-fit flex cursor-pointer items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <div
        className={`relative ${className} size-5 overflow-hidden rounded-[4px] border transition-all duration-75 ${checked ? "border-transparent bg-primary" : "border-gray-400"
          }`}

      >
        <div
          className={`absolute inset-0 scale-0 rounded-md bg-primary transition-transform duration-75 ease-out ${checked ? "scale-100" : "scale-0"
            }`}
          style={{
            transformOrigin: "center",
            transitionDelay: checked ? "0ms" : "80ms",
          }}
        />

        <svg
          viewBox="0 0 24 24"
          className={`absolute inset-0 m-auto size-4 stroke-white stroke-[3] p-[1px] transition-opacity duration-150 ${checked ? "opacity-100" : "opacity-0"
            }`}
          style={{ transitionDelay: checked ? "80ms" : "0ms" }}
        >
          <polyline
            points="5,12 10,17 19,8"
            fill="none"
            className="origin-center transition-all duration-150"
            style={{
              strokeDasharray: 30,
              strokeDashoffset: checked ? 0 : 30,
              transitionDelay: checked ? "150ms" : "0ms",
            }}
          />
        </svg>
      </div>
      <span className={twMerge('select-none text-secondary/80 text-sm font-medium', classNameLabel)}>{name}</span>
    </label>
  );
}
