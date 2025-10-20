import SaleSegmentSearch from "./sale-segment-search";
import SaleSort from "./sale-sort";
import { SaleProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface SaleSearchProps {
  sales: SaleProps[];
  setSales: Dispatch<SetStateAction<SaleProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function SaleSearch({ setTextSearch, textSearch, sales, setSales, isSearching, setIsSearching, setIsLoading }: SaleSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_SALES = ["Codigo de la venta", "Creado", "Estado", "Descuento", "Subtotal", "Total",]
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Codigo de la venta",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortSales(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortSales = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_SALES.indexOf(field);

    const comparisonFunctions: ((a: SaleProps, b: SaleProps) => number)[] = [
      (a: SaleProps, b: SaleProps) => a.salesCode.localeCompare(b.salesCode),
      (a: SaleProps, b: SaleProps) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a: SaleProps, b: SaleProps) => Number(a.state) - Number(b.state),
      (a: SaleProps, b: SaleProps) => Number(a.discount) - Number(b.discount),
      (a: SaleProps, b: SaleProps) => Number(a.subTotal) - Number(b.subTotal),
      (a: SaleProps, b: SaleProps) => Number(a.total) - Number(b.total),
    ];

    if (sortIndex === -1) return;

    const sortedProducts = [...sales].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setSales(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <div className="overflow-x-auto md:w-full md:max-w-none max-w-full" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center space-x-2 md:w-auto w-max">
          <SaleSegmentSearch
            setTextSearch={setTextSearch}
            textSearch={textSearch}
            inputRef={inputRef}
            isSearching={isSearching}
            sales={sales}
            selectedFilters={selectedFilters}
            setSales={setSales}
            handleChangeSelectedFilters={handleChangeSelectedFilters}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>

      <SaleSort
        SORTS_SALES={SORTS_SALES}
        sales={sales}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setTextSearch={setTextSearch}
        setSales={setSales}
      />
    </div>
  );
}
