import Button from "@/components/form/button";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import RadioButton from "@/components/form/radio-button";
import { AngleDownIcon, AngleUpIcon, FilterIcon } from "@/icons/icons";
import { ReportProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface DiscountSortProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  SORTS_REPORTS: string[];
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  setReports: Dispatch<SetStateAction<ReportProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function ReportSort({ SORTS_REPORTS, selectedFilters, handleChangeSelectedFilters }: DiscountSortProps) {
  const getFieldType = (field: string) => {
    if (["Titulo del reporte"].includes(field)) {
      return "string";
    } if ([""].includes(field)) {
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

  return (
    <div className="flex items-center space-x-2">
      <Dropdown closeToClickOption={false}>
        <DropdownTrigger>
          <Button styleButton="primary" className="p-1.5">
            <FilterIcon className="md:size-4 size-5 fill-[#4a4a4a] stroke-none" />
          </Button>
        </DropdownTrigger>
        <DropdownContent align="end">
          {SORTS_REPORTS.map((sort, index) => (
            <DropdownItem key={index} className="hover:bg-transparent cursor-default">
              <button onClick={() => handleChangeSelectedFilters('sorts', sort)}>
                <RadioButton name={sort} checked={selectedFilters.sorts === sort} />
              </button>
            </DropdownItem>
          ))}
          <DropdownSeparator />
          <DropdownItem className={`${selectedFilters.typeSort === 'recent' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-0.5`} onClick={() => handleChangeSelectedFilters('typeSort', 'recent')}>
            <Button className={`text-secondary font-semibold`} name={getSortDirectionLabels(selectedFilters.sorts).asc}>
              <AngleUpIcon className="size-4 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
          <DropdownItem className={`${selectedFilters.typeSort === 'ancient' ? 'bg-[#ebebeb]' : 'bg-transparent'} mb-1`} onClick={() => handleChangeSelectedFilters('typeSort', 'ancient')}>
            <Button className="text-secondary font-semibold" name={getSortDirectionLabels(selectedFilters.sorts).desc}>
              <AngleDownIcon className="size-4 mr-1 fill-secondary stroke-none" />
            </Button>
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  )
}
