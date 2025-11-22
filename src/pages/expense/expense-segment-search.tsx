import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface ExpenseSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}


export default function ExpenseSegmentSearch({ setTextSearch, textSearch, inputRef }: ExpenseSegmentSearchProps) {
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  return (
    <>
      <div className="border border-transparent rounded-lg flex items-center px-3 h-full py-1 w-full group focus-within:border-blue-500">
        <div className='flex items-center space-x-2 w-full'>
          <SearchIcon className="md:size-[18px] size-[22px] text-secondary/80 stroke-2" />
          <input
            ref={inputRef}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
            placeholder="Buscando en todos los gastos / comisiones"
            className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
          />
        </div>
      </div>

    </>
  );
}