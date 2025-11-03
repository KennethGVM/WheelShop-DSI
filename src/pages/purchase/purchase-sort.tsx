import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import RadioButton from "@/components/form/radio-button";
import { AngleDownIcon, AngleUpIcon, FilterIcon, SearchIcon, SortIcon } from "@/icons/icons";
import { PurchaseProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface PurchaseSortProps {
  purchases: PurchaseProps[];
  isSearching: boolean;
  setTextSearch: Dispatch<SetStateAction<string>>;
  SORTS_PURCHASES: string[];
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  setPurchases: Dispatch<SetStateAction<PurchaseProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function PurchaseSort({ setTextSearch, purchases, isSearching, SORTS_PURCHASES, selectedFilters, handleChangeSelectedFilters, setIsSearching, setPurchases }: PurchaseSortProps) {
  const getFieldType = (field: string) => {
    if (["Proveedor", "Bodega"].includes(field)) {
      return "string";
    } if (["Creado", "Llegada esperada"].includes(field)) {
      return "date";
    } else {
      return "number";
    }
  };

  const getSortDirectionLabels = (field: string) => {
    const fieldType = getFieldType(field);

    if (fieldType === "number") {
      return {
        asc: "De menor a mayor",
        desc: "De mayor a menor",
      };
    } else if (fieldType === "date") {
      return {
        asc: "Más antiguo primero",
        desc: "Más reciente primero",
      };
    } else {
      return {
        asc: "A-Z",
        desc: "Z-A",
      };
    }
  };

  const handleCancelSearch = () => {
    setIsSearching(!isSearching);
    setTextSearch('')
    setPurchases(purchases);
  };

  return (
    <div className="flex items-center space-x-2 py-2 md:border-none border-l md:pl-0 pl-2 border-gray-300">
      <Button
        name={isSearching ? 'Cancelar' : ''}
        onClick={handleCancelSearch}
        styleButton="primary"
        className={`p-2 text-sm text-[#4a4a4a] font-medium flex items-center space-x-1   md:px-2   ${isSearching ? 'md:py-1' : 'md:py-1.5'}   md:text-2xs`}>
        {!isSearching && (
          <>
            <SearchIcon className="text-[#4a4a4a] size-4 stroke-2" />
            <SortIcon className="size-4 fill-[#4a4a4a] stroke-none" />
          </>
        )}
      </Button>

      <Dropdown closeToClickOption={false}>
        <DropdownTrigger>
          <Button styleButton="primary" className="p-1.5">
            <FilterIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          {SORTS_PURCHASES.map((sort, index) => (
            <DropdownItem key={index} className="hover:bg-transparent cursor-default">
              <button onClick={() => handleChangeSelectedFilters('sorts', sort)}>
                <RadioButton name={sort} checked={selectedFilters.sorts === sort} />
              </button>
            </DropdownItem>
          ))}
          <DropdownSeparator />
          <DropdownItem className={`${selectedFilters.typeSort === 'recent' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-0.5`} onClick={() => handleChangeSelectedFilters('typeSort', 'recent')}>
            <Button className={`text-secondary text-nowrap font-semibold md:text-2xs text-base`} name={getSortDirectionLabels(selectedFilters.sorts).asc}>
              <AngleUpIcon className="md:size-4 size-5 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
          <DropdownItem className={`${selectedFilters.typeSort === 'ancient' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-1`} onClick={() => handleChangeSelectedFilters('typeSort', 'ancient')}>
            <Button className="text-secondary text-nowrap font-semibold md:text-2xs text-base" name={getSortDirectionLabels(selectedFilters.sorts).desc}>
              <AngleDownIcon className="md:size-4 size-5 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  )
}
