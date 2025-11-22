import { CashBoxProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import CashBoxSegmentSearch from "./cash-box-segment-search";
import CashBoxSort from "./cash-box-sort";

interface CashBoxSearchProps {
  cashBoxes: CashBoxProps[];
  setCashBoxes: Dispatch<SetStateAction<CashBoxProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function CashBoxSearch({ cashBoxes, setCashBoxes, isSearching, setIsSearching }: CashBoxSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_CASH_BOXES = ["Creado", "Titulo de la caja", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortCashBoxes(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortCashBoxes = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_CASH_BOXES.indexOf(field);

    const comparisonFunctions: ((a: CashBoxProps, b: CashBoxProps) => number)[] = [
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => a.name.localeCompare(b.name),
      (a, b) => Number(a.state) - Number(b.state),
    ];

    if (sortIndex === -1) return;

    const sortedProducts = [...cashBoxes].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setCashBoxes(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6`}>
      <CashBoxSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        cashBoxes={cashBoxes}
        selectedFilters={selectedFilters}
        setCashBoxes={setCashBoxes}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <CashBoxSort
        SORTS_CASH_BOXES={SORTS_CASH_BOXES}
        cashBoxes={cashBoxes}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        inputRef={inputRef}
        setCashBoxes={setCashBoxes}
      />
    </div>
  );
}
