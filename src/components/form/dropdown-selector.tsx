import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger
} from "@/components/form/dropdown";
import FieldInput from "@/components/form/field-input";
import { ArrowDownIcon, CheckIcon, SearchIcon } from "@/icons/icons";
import { FC, useState } from "react";
import { twMerge } from "tailwind-merge";

interface DropdownItemType {
  name: string;
  value: string;
}

interface DropDownSelectorProps {
  name?: string;
  items: DropdownItemType[];
  value: string | null;
  onChange?: (value: string) => void;
  onClick?: () => void;
  isCreated?: boolean;
  className?: string;
  disabled?: boolean;
  isSearching?: boolean;
  classNameTitle?: string;
}

const DropDownSelector: FC<DropDownSelectorProps> = ({
  classNameTitle,
  isSearching = true,
  disabled,
  className,
  isCreated = true,
  name,
  items,
  value,
  onChange,
  onClick
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
  );

  const selectedItem = items.find((item) => item.value === value) || null;

  return (
    <div className={twMerge("border-b w-full border-gray-300", className)}>
      {name && (
        <h2 className="text-secondary font-[550] md:text-2xs mb-1.5 text-base ml-1">
          {name}
        </h2>
      )}
      <Dropdown closeToClickOption>
        <DropdownTrigger>
          <button
            type="button"
            disabled={disabled}
            className="flex items-center space-x-2 px-1 py-0.5 disabled:hover:bg-transparent hover:bg-whiting2 rounded-md"
          >
            <span
              className={twMerge(
                "text-xl text-secondary/80 font-semibold md:mt-0 mt-1",
                classNameTitle
              )}
            >
              {selectedItem
                ? selectedItem.name
                : `Seleccionar ${name ? name.toLowerCase() : ""}`}
            </span>
            {!disabled && (
              <ArrowDownIcon className="size-[18px] fill-secondary/80 stroke-none" />
            )}
          </button>
        </DropdownTrigger>
        <DropdownContent align="start" className="w-[300px] max-h-[400px] p-1 flex flex-col">
          {isSearching && (
            <>
              <DropdownItem className="hover:bg-transparent">
                <FieldInput
                  onClick={(e) => e.stopPropagation()}
                  className="mb-0 w-full"
                  appendChild={<SearchIcon className="md:size-4 size-5 text-whiting" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </DropdownItem>
              <DropdownSeparator className="mb-2" />
            </>
          )}

          <div className="overflow-y-auto max-h-[250px] space-y-0.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <DropdownItem
                  onClick={() => onChange?.(item.value)}
                  key={item.value}
                  className={`text-secondary/80 py-1 font-medium md:text-2xs text-base justify-between ${value === item.value ? "bg-whiting2" : ""
                    }`}
                >
                  <span>{item.name}</span>
                  {value === item.value && <CheckIcon />}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem className="text-secondary/80 md:text-2xs text-base font-semibold py-2 hover:bg-transparent">
                No se encontraron {name?.toLowerCase()}s
              </DropdownItem>
            )}
          </div>

          {isCreated && (
            <div className="sticky bottom-0 bg-white border-t mt-2 pt-2">
              <DropdownItem
                onClick={onClick}
                className="text-blueprimary font-medium md:text-2xs text-base py-3 hover:bg-transparent hover:underline"
              >
                Crear un nuevo {name?.toLowerCase()}
              </DropdownItem>
            </div>
          )}
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default DropDownSelector;
