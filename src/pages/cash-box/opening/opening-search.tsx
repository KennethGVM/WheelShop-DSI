import { OpeningProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import OpeningSegmentSearch from "./opening-segment-search";
import OpeningSort from "./opening-sort";

interface OpeningSearchProps {
  openings: OpeningProps[];
  setOpenings: Dispatch<SetStateAction<OpeningProps[]>>;
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

export default function OpeningSearch({ setTextSearch, textSearch, openings, setOpenings, isSearching, setIsSearching }: OpeningSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_OPENINGS = ["Creado", "Total", "Tituto del usuario", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortOpenings(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortOpenings = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_OPENINGS.indexOf(field);

    const comparisonFunctions: ((a: OpeningProps, b: OpeningProps) => number)[] = [
      (a, b) => {
        const dateA = a.openingDate ? new Date(a.openingDate).getTime() : 0;
        const dateB = b.openingDate ? new Date(b.openingDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.total) - Number(b.total),
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => Number(a.status) - Number(b.status),
    ];

    if (sortIndex === -1) return;

    const sortedOpening = [...openings].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setOpenings(sortedOpening);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <OpeningSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        openings={openings}
        selectedFilters={selectedFilters}
        setOpenings={setOpenings}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setTextSearch={setTextSearch}
        textSearch={textSearch}
      />

      <OpeningSort
        SORTS_OPENINGS={SORTS_OPENINGS}
        openings={openings}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setOpenings={setOpenings}
        setTextSearch={setTextSearch}
      />
    </div>
  );
}
