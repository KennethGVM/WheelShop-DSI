import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import RadioButton from "@/components/form/radio-button";
import { AngleDownIcon, AngleUpIcon, FilterIcon, SearchIcon, SortIcon } from "@/icons/icons";
import { OpeningProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface OpeningSortProps {
  openings: OpeningProps[];
  isSearching: boolean;
  SORTS_OPENINGS: string[];
  setTextSearch: Dispatch<SetStateAction<string>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  setOpenings: Dispatch<SetStateAction<OpeningProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function OpeningSort({ openings, isSearching, SORTS_OPENINGS, selectedFilters, handleChangeSelectedFilters, setIsSearching, setTextSearch, setOpenings }: OpeningSortProps) {
  const getFieldType = (field: string) => {
    if (["Tituto del usuario", "Estado"].includes(field)) {
      return "string";
    } if (["Creado"].includes(field)) {
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
    setOpenings(openings);
  };

  return (
    <div className="flex items-center space-x-2">
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
          {SORTS_OPENINGS.map((sort, index) => (
            <DropdownItem key={index} className="hover:bg-transparent cursor-default">
              <button onClick={() => handleChangeSelectedFilters('sorts', sort)}>
                <RadioButton name={sort} checked={selectedFilters.sorts === sort} />
              </button>
            </DropdownItem>
          ))}
          <DropdownSeparator />
          <DropdownItem className={`${selectedFilters.typeSort === 'recent' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-0.5`} onClick={() => handleChangeSelectedFilters('typeSort', 'recent')}>
            <Button className={`text-secondary font-semibold md:text-2xs text-base`} name={getSortDirectionLabels(selectedFilters.sorts).asc}>
              <AngleUpIcon className="md:size-4 size-5 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
          <DropdownItem className={`${selectedFilters.typeSort === 'ancient' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-1`} onClick={() => handleChangeSelectedFilters('typeSort', 'ancient')}>
            <Button className="text-secondary font-semibold md:text-2xs text-base" name={getSortDirectionLabels(selectedFilters.sorts).desc}>
              <AngleDownIcon className="md:size-4 size-5 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  )
}
