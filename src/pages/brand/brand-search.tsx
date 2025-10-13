import { BrandProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import BrandSegmentSearch from "@/pages/brand/brand-segment-search";
import BrandSort from "./brand-sort";

interface BrandsSearchProps {
  brands: BrandProps[];
  setBrands: Dispatch<SetStateAction<BrandProps[]>>;
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


export default function BrandSearch({ setTextSearch, textSearch, brands, setBrands, isSearching, setIsSearching }: BrandsSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORTS_BRANDS = ["Nombre de la marca", "Creado", "Estado"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre de la marca",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sortBrands(newFilters.sorts, newFilters.typeSort);
      return newFilters;
    });
  };


  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);

  const sortBrands = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_BRANDS.indexOf(field);

    const comparisonFunctions: ((a: BrandProps, b: BrandProps) => number)[] = [
      (a, b) => a.brandName.localeCompare(b.brandName),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.state) - Number(b.state),

    ];

    if (sortIndex === -1) return;

    const sortedBrands = [...brands].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setBrands(sortedBrands);
  };

  return (
    <>
      <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
        <BrandSegmentSearch
          inputRef={inputRef}
          isSearching={isSearching}
          brands={brands}
          selectedFilters={selectedFilters}
          setBrands={setBrands}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          textSearch={textSearch}
          setTextSearch={setTextSearch}
        />

        <BrandSort
          brands={brands}
          setTextSearch={setTextSearch}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          setIsSearching={setIsSearching}
          inputRef={inputRef}
          setBrands={setBrands}
          SORTS_BRANDS={SORTS_BRANDS}
        />
      </div>
    </>

  )
}