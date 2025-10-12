import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { CustomerProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from "react";

interface CustomerSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  customers: CustomerProps[];
  setCustomers: Dispatch<SetStateAction<CustomerProps[]>>;
  selectedFilters: { segments: number, sorts: string, typeSort: 'recent' | 'ancient' };
  handleChangeSelectedFilters: (name: 'segments' | 'sorts' | 'typeSort', value: number | string) => void;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}


export default function CustomerSegmentSearch({ setTextSearch, textSearch, inputRef, isSearching, customers, selectedFilters, setCustomers, handleChangeSelectedFilters }: CustomerSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Activos", "Inactivos"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  const handleSegmentCustomers = (segment: number) => {
    if (segment === 0) {
      setCustomers(customers);
    } else if (segment === 1) {
      setCustomers(customers.filter(customer => customer.state === true));
    } else if (segment === 2) {
      setCustomers(customers.filter(customer => customer.state === false));
    }
  };

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters('segments', segment);
    handleSegmentCustomers(segment);
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
              placeholder="Buscando en todos los clientes"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}

    </>
  );
}