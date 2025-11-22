import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { OpeningProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface OpeningSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  openings: OpeningProps[];
  setOpenings: Dispatch<SetStateAction<OpeningProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

export default function OpeningSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, openings, selectedFilters, setOpenings, handleChangeSelectedFilters }: OpeningSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Completado", "Faltante"];

  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentOpening = (segment: number) => {
    if (segment === 0) {
      setOpenings(openings);
    } else if (segment === 1) {
      setOpenings(openings.filter(opening => opening.status === true));
    } else if (segment === 2) {
      setOpenings(openings.filter(opening => opening.status === false));
    };
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentOpening(segment);
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
            <SearchIcon className="md:size-[18px] size-[22px] text-secondary/80 stroke-2" />
            <input
              ref={inputRef}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
              placeholder="Buscando en todos los aperturas"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
