import { StoreHouseProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import StoreHouseSegmentSearch from "./store-house-segment-search";
import StoreHouseSort from "./store-house-sort";

interface StoreHouseSearchProps {
  storeHouses: StoreHouseProps[];
  setStoreHouses: Dispatch<SetStateAction<StoreHouseProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function StoreHouseSearch({ setStoreHouses, storeHouses, isSearching, setIsSearching }: StoreHouseSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_STORE_HOUSES = ["Nombre"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortStoreHouses(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortStoreHouses = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_STORE_HOUSES.indexOf(field);

    const comparisonFunctions: ((a: StoreHouseProps, b: StoreHouseProps) => number)[] = [
      (a, b) => a.name.localeCompare(b.name),
    ];

    if (sortIndex === -1) return;

    const sortedRole = [...storeHouses].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setStoreHouses(sortedRole);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <StoreHouseSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        setStoreHouses={setStoreHouses}
        storeHouses={storeHouses}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <StoreHouseSort
        SORTS_STORE_HOUSES={SORTS_STORE_HOUSES}
        storeHouses={storeHouses}
        setStoreHouses={setStoreHouses}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        inputRef={inputRef}
      />
    </div>
  );
}
