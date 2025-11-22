import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { ArchingProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface ArchingSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  archings: ArchingProps[];
  setArchings: Dispatch<SetStateAction<ArchingProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

export default function ArchingSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, archings, selectedFilters, setArchings, handleChangeSelectedFilters }: ArchingSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Completado", "Faltante"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentArchings = (segment: number) => {
    if (segment === 0) {
      setArchings(archings);
    } else if (segment === 1) {
      setArchings(archings.filter(arching => arching.state === true));
    } else if (segment === 2) {
      setArchings(archings.filter(arching => arching.state === false));
    };
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentArchings(segment);
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
              value={localSearch}
              ref={inputRef}
              onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
              placeholder="Buscando en todos los arqueos"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  )
}
