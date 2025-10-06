import { PlusCircleIcon, SearchIcon } from "@/icons/icons";
import { useState, useRef, useEffect, type KeyboardEvent, ChangeEvent } from "react";
import Line from "./line";

interface Option {
  title: string;
  description?: string;
  value: string | number;
}

interface SelectorProps {
  name: string;
  id?: string;
  options: Option[];
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  isCreated?: boolean;
}

export default function SelectForm({ name, options, placeholder, id, value, onChange, onClick, className, disabled, isCreated = true }: SelectorProps) {
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedOptionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setSearch(selectedOption.title);
    }
  }, [value, options]);

  const filteredOptions = options.filter((option) => {
    const searchWords = search.toLowerCase().trim().split(/\s+/); // divide por cualquier espacio
    const title = option.title?.toLowerCase().trim() || "";
    const description = option.description?.toLowerCase().trim() || "";

    // Verifica que todas las palabras de búsqueda estén en title o description
    return searchWords.every(word =>
      title.includes(word) || description.includes(word)
    );
  });

  const allOptions = [{ isCreateOption: true }, ...filteredOptions.map((option) => ({ option }))];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, isFocused]);

  useEffect(() => {
    if (selectedOptionRef.current) {
      selectedOptionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsFocused(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allOptions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex > 0 && selectedIndex <= filteredOptions.length) {
          const selected = filteredOptions[selectedIndex - 1];
          setSearch(selected.title);
          setIsFocused(false);
          onChange?.(selected.value);
        }
        break;
      case "Escape":
        setIsFocused(false);
        break;
    }
  };

  const handleSelectOption = (option: Option) => {
    setSearch(option.title);
    setIsFocused(false);
    onChange?.(option.value);
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className={`bg-white rounded-lg w-full shadow-sm relative ${className}`}>
      {name && <label htmlFor={id} className="md:text-2xs text-[15px] inline-block font-medium text-secondary/80 mb-2">{name}</label>}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon className="md:size-4 size-5 text-whiting" />
          </div>
          <input
            ref={inputRef}
            type="text"
            id={id}
            placeholder={placeholder || "Search or create an option"}
            className="w-full pl-9 pr-3 md:h-8 h-11 md:text-2xs text-sm text-secondary/80 placeholder-secondary/80 font-medium md:placeholder:text-2xs placeholder:text-sm border border-gray-400 rounded-lg focus:outline-none"
            value={search}
            onChange={handleOnChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>


        {isFocused && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md z-10 max-h-48 overflow-y-auto"
          >
            {isCreated &&
              <>
                <div className="p-2">
                  <button
                    type="button"
                    className={`flex divide-gray-300 w-full rounded-md items-center gap-2 p-2 ${selectedIndex === 0 ? "bg-gray-100" : ""} hover:bg-gray-100 cursor-pointer`}
                    onClick={onClick}
                    onMouseEnter={() => setSelectedIndex(0)}
                  >
                    <div className="flex items-center justify-center">
                      <PlusCircleIcon className="md:size-5 size-6 text-whiting" />
                    </div>
                    <span className="md:text-2xs text-base text-secondary/80">Crear un nuevo {name.toLocaleLowerCase()}</span>
                  </button>
                </div>

                <Line />
              </>
            }
            <div className="p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    ref={selectedIndex === index + 1 ? selectedOptionRef : null}
                    className={`p-2 ${selectedIndex === index + 1 ? "bg-gray-100" : ""} hover:bg-gray-100 rounded-md cursor-pointer`}
                    onClick={() => handleSelectOption(option)}
                    onMouseEnter={() => setSelectedIndex(index + 1)}
                  >
                    <span className="md:text-2xs text-base font-medium text-secondary/80">{option.title}</span>
                    <p className="md:text-xs text-base text-gray-500">{option.description}</p>
                  </div>
                ))
              ) : (
                <div className="p-3">
                  <span className="text-2xs font-medium text-secondary/80">
                    No se encontró {name.toLocaleLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
