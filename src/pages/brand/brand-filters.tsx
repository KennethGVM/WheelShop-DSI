import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import { ArrowDownIcon, CheckIcon, CloseIcon, PlusIcon } from "@/icons/icons";
import { useState } from "react";

interface BrandFiltersProps {
  isSearching: boolean;
  filters: { category: string | null; state: string | null };
  setFilters: React.Dispatch<React.SetStateAction<{ category: string | null; state: string | null }>>;
}
// Definimos las opciones para cada tipo de filtro
const FILTER_OPTIONS: Record<string, string[]> = {
  "Categoria": ["Llantas", "Aceites"],
  "Estado": ["Activo", "Inactivo"],
};

export default function BrandFilters({ isSearching, filters, setFilters }: BrandFiltersProps) {
  const ALL_FILTERS = Object.keys(FILTER_OPTIONS);
  const FIXED_FILTERS = ALL_FILTERS.slice(0, 3);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(FIXED_FILTERS);
  const [availableFilters, setAvailableFilters] = useState<string[]>(ALL_FILTERS.slice(3));
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const addFilter = (filter: string) => {
    setSelectedFilters([...selectedFilters, filter]);
    setAvailableFilters(availableFilters.filter(f => f !== filter));
    setSelectedOptions(prev => ({ ...prev, [filter]: [] }));
  };

  const removeFilter = (filter: string) => {
    if (FIXED_FILTERS.includes(filter)) return;
    setSelectedFilters(selectedFilters.filter(f => f !== filter));
    setAvailableFilters([...availableFilters, filter]);

    const newSelectedOptions = { ...selectedOptions };
    delete newSelectedOptions[filter];
    setSelectedOptions(newSelectedOptions);
  };

  const toggleOption = (filter: string, option: string) => {
    setSelectedOptions(prev => {
      const currentOptions = prev[filter] || [];
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter(o => o !== option)
        : [...currentOptions, option];

      return { ...prev, [filter]: newOptions };
    });
  }
  return (
    <div className={`overflow-hidden transition-all duration-200 ease-out ${isSearching ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
      <div className="flex items-center space-x-2 py-1.5 px-2 bg-white transform transition-transform duration-200 ease-out translate-y-0">
        {selectedFilters.map((filter, index) => (
          <Dropdown key={index}>
            <DropdownTrigger>
              <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid">
                <span>
                  {filter}
                  {selectedOptions[filter]?.length > 0 && ` (${selectedOptions[filter].length})`}
                </span>
                {!FIXED_FILTERS.includes(filter) ? (
                  <span onClick={(e) => {
                    e.stopPropagation();
                    removeFilter(filter);
                  }}>
                    <CloseIcon className="fill-secondary/80 size-[13px] cursor-pointer" />
                  </span>
                ) : (
                  <ArrowDownIcon className="fill-secondary/80 size-[13px]" />
                )}
              </button>
            </DropdownTrigger>
            <DropdownContent align="center" position="bottom">
              {FILTER_OPTIONS[filter].map((option, idx) => (
                <DropdownItem
                  key={idx}
                  onClick={() => {
                    setSelectedOptions(prev => ({ ...prev, [filter]: [option] }));

                    // 🔹 Actualizar el estado global de filtros en el padre
                    if (filter === "Categoria") {
                      setFilters(prev => ({ ...prev, category: option }));
                    } else if (filter === "Estado") {
                      setFilters(prev => ({ ...prev, state: option }));
                    }
                  }}
                  className={`flex justify-between text-secondary/80 font-medium ${selectedOptions[filter]?.includes(option) ? "bg-whiting2" : ""
                    }`}
                >
                  <span>{option}</span>
                  {selectedOptions[filter]?.includes(option) && <CheckIcon className="ml-2 size-3" />}
                </DropdownItem>

              ))}
              <div className="px-4 pt-2">
                <Button
                  name="Borrar"
                  className="text-blueprimary md:text-2xs text-base font-medium hover:underline"
                  onClick={() => {
                    setSelectedOptions(prev => ({ ...prev, [filter]: [] }));

                    if (filter === "Categoria") {
                      setFilters(prev => ({ ...prev, category: null }));
                    } else if (filter === "Estado") {
                      setFilters(prev => ({ ...prev, state: null }));
                    }
                  }}
                  disabled={!selectedOptions[filter] || selectedOptions[filter].length === 0}
                />
              </div>
            </DropdownContent>
          </Dropdown>
        ))}

        {availableFilters.length > 0 && (
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-secondary/80 font-medium hover:border-solid">
                <span>Agregar filtro</span>
                <PlusIcon className="fill-secondary/80 size-4" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="center" position="bottom">
              {availableFilters.map((filter, index) => (
                <DropdownItem key={index} onClick={() => addFilter(filter)}>
                  {filter}
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>
        )}
      </div>
    </div>
  );
}
