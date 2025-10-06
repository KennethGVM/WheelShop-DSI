import type React from "react";
import { forwardRef, useState, useRef, useEffect } from "react";
import CheckBox from "./check-box";
import { CloseIcon, PlusCircleIcon } from "@/icons/icons";

export type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  name: string;
  options: Option[];
  placeholder?: string;
  label?: string;
  className?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  onClickCreate?: () => void;
};

const SelectMultiple = forwardRef<HTMLInputElement, MultiSelectProps>(
  ({ name, options, placeholder = "", label, className = "", value = [], onChange, onClickCreate }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedValues, setSelectedValues] = useState<string[]>(value);
    const [openUpwards, setOpenUpwards] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelectedValues(value);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useEffect(() => {
      if (isOpen && containerRef.current && dropdownRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        setOpenUpwards(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
      }
    }, [isOpen]);

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    const toggleOption = (optionValue: string) => {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];

      setSelectedValues(newValue);
      onChange?.(newValue);
    };

    const removeOption = (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const newValue = selectedValues.filter((v) => v !== optionValue);
      setSelectedValues(newValue);
      onChange?.(newValue);
    };

    const getLabel = (optionValue: string) => {
      return options.find((option) => option.value === optionValue)?.label || optionValue;
    };

    return (
      <div ref={containerRef} className={`relative w-full ${className}`}>
        {label && (
          <label htmlFor={name} className="block md:text-2xs text-[15px] font-medium text-secondary/80 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type="text"
            id={name}
            name={`${name}-input`}
            className="w-full px-3 md:h-8 h-11 border font-medium placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-sm text-secondary/80 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 md:text-2xs text-sm"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-controls={`${name}-options`}
          />

          <input type="hidden" name={name} value={selectedValues.join(",")} />

          {isOpen && (
            <div
              id={`${name}-options`}
              ref={dropdownRef}
              className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-auto ${
                openUpwards ? "bottom-full mb-1" : "mt-1"
              }`}
            >
              {onClickCreate && (
                <div className="p-2 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={onClickCreate}
                    className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <PlusCircleIcon className="md:size-5 size-6 text-whiting" />
                    <span className="md:text-2xs text-base text-secondary/80">Crear nuevo {name.toLowerCase()}</span>
                  </button>
                </div>
              )}

              {filteredOptions.length > 0 ? (
                <ul className="py-1">
                  {filteredOptions.map((option) => (
                    <li key={option.value} onClick={() => toggleOption(option.value)}>
                      <button
                        type="button"
                        className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 text-2xs"
                      >
                        <CheckBox
                          onChange={() => toggleOption(option.value)}
                          name={option.label}
                          initialValue={selectedValues.includes(option.value)}
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">No hay opciones disponibles</div>
              )}
            </div>
          )}
        </div>

        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-x-1.5 gap-y-2 mt-2">
            {selectedValues.map((optionValue) => (
              <div
                key={optionValue}
                className="flex items-center bg-whiting2 hover:bg-[#cccccc] group font-medium text-secondary/80 md:text-xs text-sm rounded-lg"
              >
                <a href="#" className="m-1 group-hover:underline">
                  {getLabel(optionValue)}
                </a>
                <button
                  type="button"
                  onClick={(e) => removeOption(optionValue, e)}
                  className="rounded-full p-1 group-hover:bg-[#b2b2b2]"
                  aria-label={`Eliminar ${getLabel(optionValue)}`}
                >
                  <CloseIcon className="size-3 text-secondary/80" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default SelectMultiple;
