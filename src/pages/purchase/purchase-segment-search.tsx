import { SearchIcon } from "@/icons/icons";
import { useDebounce } from "@/lib/function";
import { PurchaseProps } from "@/types/types";
import { Dispatch, RefObject, SetStateAction, useState, useEffect } from "react";

interface PurchaseSegmentSearchProps {
  inputRef: RefObject<HTMLInputElement | null>;
  isSearching: boolean;
  setTextSearch: Dispatch<SetStateAction<string>>;
  purchases: PurchaseProps[];
  textSearch: string;
  setPurchase: Dispatch<SetStateAction<PurchaseProps[]>>;
  selectedFilters: { segments: number; sorts: string; typeSort: "recent" | "ancient" };
  handleChangeSelectedFilters: (name: "segments" | "sorts" | "typeSort", value: number | string) => void;
}

export default function PurchaseSegmentSearch({
  textSearch,
  setTextSearch,
  inputRef,
  isSearching,
  purchases,
  selectedFilters,
  setPurchase,
  handleChangeSelectedFilters,
}: PurchaseSegmentSearchProps) {
  const SEGMENTS = ["Todos", "Preliminares", "Pedido", "Recibidas", "Cerrado"];
  const [localSearch, setLocalSearch] = useState(textSearch);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setTextSearch(debouncedSearch);
  }, [debouncedSearch, setTextSearch]);

  const handleSegmentProducts = (segment: number) => {
    setPurchase(segment === 0 ? purchases : purchases.filter((p) => p.state === segment - 1));
  };

  const handleButtonClick = (segment: number) => {
    handleChangeSelectedFilters("segments", segment);
    handleSegmentProducts(segment);
  };

  return (
    <>
      {!isSearching ? (
        <div className="flex items-center space-x-2">
          {SEGMENTS.map((segment, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index)}
              className={`text-primary/90 font-medium md:text-2xs text-base ${selectedFilters.segments === index ? "bg-[#ebebeb]" : "bg-transparent"
                } rounded-md px-3 py-1 hover:bg-[#f2f2f2]`}
            >
              {segment}
            </button>
          ))}
        </div>
      ) : (
        <div className="border border-transparent rounded-lg flex items-center px-3 h-full py-1 w-full group focus-within:border-blue-500">
          <div className="flex items-center space-x-2 w-full">
            <SearchIcon className="size-[18px] text-secondary/80 stroke-2" />
            <input
              ref={inputRef}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value.toLocaleLowerCase())}
              placeholder="Buscando en todos las ordenes de compras"
              className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
            />
          </div>
        </div>
      )}
    </>
  );
}
