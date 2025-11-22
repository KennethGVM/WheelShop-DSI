import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { ClosingProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface ClosingSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  closings: ClosingProps[];
  setClosings: Dispatch<SetStateAction<ClosingProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
}

export default function ClosingSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, closings, selectedFilters, setClosings, handleChangeSelectedFilters }: ClosingSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Completado", "Faltante"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentClosings = (segment: number) => {
    if (segment === 0) {
      setClosings(closings);
    } else if (segment === 1) {
      setClosings(closings.filter(closing => closing.state === true));
    } else if (segment === 2) {
      setClosings(closings.filter(closing => closing.state === false));
    };
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentClosings(segment);
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
              placeholder="Buscando en todos los cierres"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
