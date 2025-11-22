import { SearchIcon } from "@/icons/icons";
import { CashBoxProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction } from "react";

interface CashBoxSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  cashBoxes: CashBoxProps[];
  setCashBoxes: Dispatch<SetStateAction<CashBoxProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
}

export default function CashBoxSegmentSearch({ inputRef, isSearching, cashBoxes, selectedFilters, setCashBoxes, handleChangeSelectedFilters }: CashBoxSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Activos", "Inactivos"];

  const handleSegmentCashBoxes = (segment: number) => {
    if (segment === 0) {
      setCashBoxes(cashBoxes);
    } else if (segment === 1) {
      setCashBoxes(cashBoxes.filter(cashBox => cashBox.state === true));
    } else if (segment === 2) {
      setCashBoxes(cashBoxes.filter(cashBox => cashBox.state === false));
    }
  };

  const handleSearchCashBoxes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const query = value.toLowerCase().trim();

    if (query) {
      const searchTerms = query.split(' ');
      const filtered = cashBoxes.filter((cashBox) => {
        return searchTerms.every((term) => {
          return (
            cashBox.name.toLowerCase().includes(term)
          );
        });
      });

      setCashBoxes(filtered);
    } else {
      setCashBoxes(cashBoxes);
    }
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentCashBoxes(segment);
  };

  return (
    <>
      {!isSearching ? (
        <div className="flex items-center space-x-2">
          {SEGMENTS.map((segment, index) => (
            <button key={index} onClick={() => handleButtonClick(index)} className={`text-primary/90 font-medium md:text-2xs text-base ${selectedFilters.segments === index ? 'bg-[#ebebeb]' : 'bg-transparent'} rounded-md px-3 py-1 hover:bg-[#f2f2f2]`}>
              {segment}
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-transparent rounded-lg flex items-center px-3 h-full py-1 w-full group focus-within:border-blue-500">
          <div className='flex items-center space-x-2 w-full'>
            <SearchIcon className="size-[18px] text-secondary/80 stroke-2" />
            <input
              ref={inputRef}
              onChange={handleSearchCashBoxes}
              placeholder="Buscando en todos las cajas"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
