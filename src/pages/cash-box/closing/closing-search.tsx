import { ClosingProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ClosingSegmentSearch from "./closing-segment-search";
import ClosingSort from "./closing-sort";

interface ClosingSearchProps {
  closings: ClosingProps[];
  setClosings: Dispatch<SetStateAction<ClosingProps[]>>;
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

export default function ClosingSearch({ setTextSearch, textSearch, closings, setClosings, isSearching, setIsSearching }: ClosingSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_CLOSINGS = ["Creado", "Total", "Tituto del usuario", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortClosings(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortClosings = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_CLOSINGS.indexOf(field);

    const comparisonFunctions: ((a: ClosingProps, b: ClosingProps) => number)[] = [
      (a, b) => {
        const dateA = a.closingDate ? new Date(a.closingDate).getTime() : 0;
        const dateB = b.closingDate ? new Date(b.closingDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.systemTotal) - Number(b.systemTotal),
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => Number(a.state) - Number(b.state),
    ];

    if (sortIndex === -1) return;

    const sortedClosings = [...closings].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setClosings(sortedClosings);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <ClosingSegmentSearch
        textSearch={textSearch}
        setTextSearch={setTextSearch}
        inputRef={inputRef}
        isSearching={isSearching}
        closings={closings}
        selectedFilters={selectedFilters}
        setClosings={setClosings}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <ClosingSort
        SORTS_CLOSINGS={SORTS_CLOSINGS}
        closings={closings}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setTextSearch={setTextSearch}
        setClosings={setClosings}
      />
    </div>
  );
}
