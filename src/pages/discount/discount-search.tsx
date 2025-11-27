import { DiscountProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import DiscountSegmentSearch from "./discount-segment-search";
import DiscountSort from "./discount-sort";

interface DiscountSearchProps {
  discounts: DiscountProps[];
  setDiscounts: Dispatch<SetStateAction<DiscountProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function DiscountSearch({ setTextSearch, textSearch, discounts, setDiscounts, isSearching, setIsSearching }: DiscountSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_DISCOUNT = ["Creado", "Fecha de inicio", "Fecha de finalización", "Titulo", "Usos"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortDiscount(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortDiscount = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_DISCOUNT.indexOf(field);

    const comparisonFunctions: ((a: DiscountProps, b: DiscountProps) => number)[] = [
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
        const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => a.title.localeCompare(b.title),
    ];

    if (sortIndex === -1) return;

    const sortedDiscounts = [...discounts].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setDiscounts(sortedDiscounts);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <DiscountSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        discounts={discounts}
        selectedFilters={selectedFilters}
        setDiscounts={setDiscounts}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setTextSearch={setTextSearch}
        textSearch={textSearch}
      />

      <DiscountSort
        SORTS_DISCOUNT={SORTS_DISCOUNT}
        discounts={discounts}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setDiscounts={setDiscounts}
        setTextSearch={setTextSearch}
      />
    </div>
  );
}
