import QuotationSegmentSearch from "./quotation-segment-search";
import QuotationSort from "./quotation-sort";
import { QuotationProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface QuotationSearchProps {
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
  quotations: QuotationProps[];
  setQuotations: Dispatch<SetStateAction<QuotationProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function QuotationSearch({ setTextSearch, textSearch, quotations, setQuotations, isSearching, setIsSearching, setIsLoading }: QuotationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_QUOTATIONS = ["Codigo de la cotización", "Creado", "Estado", "Descuento", "Subtotal", "Total"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Codigo de la cotización",
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
    const sortIndex = SORTS_QUOTATIONS.indexOf(field);

    const comparisonFunctions: ((a: QuotationProps, b: QuotationProps) => number)[] = [
      (a: QuotationProps, b: QuotationProps) => a.quotationCode.localeCompare(b.quotationCode),
      (a: QuotationProps, b: QuotationProps) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a: QuotationProps, b: QuotationProps) => Number(a.state) - Number(b.state),
      (a: QuotationProps, b: QuotationProps) => Number(a.discount) - Number(b.discount),
      (a: QuotationProps, b: QuotationProps) => Number(a.subTotal) - Number(b.subTotal),
      (a: QuotationProps, b: QuotationProps) => Number(a.total) - Number(b.total),
    ];

    if (sortIndex === -1) return;

    const sortedProducts = [...quotations].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setQuotations(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <div className="overflow-x-auto md:w-full md:max-w-none max-w-full" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center space-x-2 md:w-auto w-max">
          <QuotationSegmentSearch
            setTextSearch={setTextSearch}
            textSearch={textSearch}
            inputRef={inputRef}
            isSearching={isSearching}
            quotations={quotations}
            selectedFilters={selectedFilters}
            setQuotations={setQuotations}
            handleChangeSelectedFilters={handleChangeSelectedFilters}
            setIsLoading={setIsLoading}
          />
        </div>
      </div>

      <QuotationSort
        SORTS_SALES={SORTS_QUOTATIONS}
        quotations={quotations}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setTextSearch={setTextSearch}
        setQuotations={setQuotations}
      />
    </div>
  );
}
