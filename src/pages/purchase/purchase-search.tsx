import { PurchaseProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import PurchaseSegmentSearch from "./purchase-segment-search";
import PurchaseSort from "./purchase-sort";

interface ProductSearchProps {
  purchases: PurchaseProps[];
  setPurchases: Dispatch<SetStateAction<PurchaseProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function PurchaseSearch({ textSearch, setTextSearch, purchases, setPurchases, isSearching, setIsSearching }: ProductSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_PURCHASES = ["Creado", "Llegada espera", "Proveedor", "Bodega", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortProducts(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortProducts = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_PURCHASES.indexOf(field);

    const comparisonFunctions: ((a: PurchaseProps, b: PurchaseProps) => number)[] = [
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.arrivalDate ? new Date(a.arrivalDate).getTime() : 0;
        const dateB = b.arrivalDate ? new Date(b.arrivalDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => a.supplierId.localeCompare(b.supplierId),
      (a, b) => a.storeHouseId.localeCompare(b.storeHouseId),
      (a, b) => (a.state === 0 ? 1 : 0) - (b.state === 0 ? 1 : 0),
    ];

    if (sortIndex === -1) return;

    const sortedProducts = [...purchases].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setPurchases(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <div className="overflow-x-auto md:w-full md:max-w-none max-w-full" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center space-x-2 md:w-auto w-max">
          <PurchaseSegmentSearch
            textSearch={textSearch}
            inputRef={inputRef}
            isSearching={isSearching}
            setTextSearch={setTextSearch}
            purchases={purchases}
            selectedFilters={selectedFilters}
            setPurchase={setPurchases}
            handleChangeSelectedFilters={handleChangeSelectedFilters}
          />
        </div>
      </div>

      <PurchaseSort
        setTextSearch={setTextSearch}
        SORTS_PURCHASES={SORTS_PURCHASES}
        purchases={purchases}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setPurchases={setPurchases}
      />
    </div>
  );


}
