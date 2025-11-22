import { ArchingProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ArchingSegmentSearch from "./arching-segment-search";
import ArchingSort from "./arching-sort";

interface ArchingSearchProps {
  archings: ArchingProps[];
  setArchings: Dispatch<SetStateAction<ArchingProps[]>>;
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

export default function ArchingSearch({ setTextSearch, textSearch, archings, setArchings, isSearching, setIsSearching }: ArchingSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_ARCHINGS = ["Creado", "Total", "Tituto del usuario", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Creado",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortArchings(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortArchings = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_ARCHINGS.indexOf(field);

    const comparisonFunctions: ((a: ArchingProps, b: ArchingProps) => number)[] = [
      (a, b) => {
        const dateA = a.archingDate ? new Date(a.archingDate).getTime() : 0;
        const dateB = b.archingDate ? new Date(b.archingDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.systemTotal) - Number(b.systemTotal),
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => Number(a.state) - Number(b.state),
    ];

    if (sortIndex === -1) return;

    const sortedArchings = [...archings].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setArchings(sortedArchings);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <ArchingSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        archings={archings}
        selectedFilters={selectedFilters}
        setArchings={setArchings}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setTextSearch={setTextSearch}
        textSearch={textSearch}
      />

      <ArchingSort
        SORTS_ARCHINGS={SORTS_ARCHINGS}
        archings={archings}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setArchings={setArchings}
        setTextSearch={setTextSearch}
      />
    </div>
  );
}
