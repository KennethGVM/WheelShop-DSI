import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { DiscountProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface DiscountSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  discounts: DiscountProps[];
  setDiscounts: Dispatch<SetStateAction<DiscountProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

export default function DiscountSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, discounts, selectedFilters, setDiscounts, handleChangeSelectedFilters }: DiscountSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Activos", "Inactivos"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentDiscount = (segment: number) => {
    if (segment === 0) {
      setDiscounts(discounts);
    } else if (segment === 1) {
      setDiscounts(discounts.filter(discount => discount.state === true));
    } else if (segment === 2) {
      setDiscounts(discounts.filter(discount => discount.state === false));
    }
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentDiscount(segment);
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
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
              placeholder="Buscando en todos los descuentos"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
