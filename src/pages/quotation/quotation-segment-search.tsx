import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { QuotationProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface QuotationSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
  quotations: QuotationProps[];
  setQuotations: Dispatch<SetStateAction<QuotationProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function QuotationSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, quotations, selectedFilters, setQuotations, setIsLoading, handleChangeSelectedFilters }: QuotationSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Completadas", "Pendientes"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentSales = async (segment: number) => {
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 150));
    if (segment === 0) {
      setQuotations(quotations);
    } else if (segment === 1) {
      setQuotations(quotations.filter(quotation => quotation.state === true));
    } else if (segment === 2) {
      setQuotations(quotations.filter(quotation => quotation.state === false));
    }
    setIsLoading(false);
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentSales(segment);
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
              onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
              placeholder="Buscando en todos las cotizaciones"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
