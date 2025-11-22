import { InventoryProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import InventorySegmentSearch from "./inventory-segment-search";
import InventorySort from "./inventory-sort";

interface InventorySearchProps {
  inventory: InventoryProps[];
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
  setInventory: Dispatch<SetStateAction<InventoryProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function InventorySearch({ setTextSearch, textSearch, inventory, setInventory, isSearching, setIsSearching }: InventorySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_INVENTORY = ["Nombre del producto", "Ultima actualización", "Stock"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre del producto",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        handleSortInventory(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const handleSortInventory = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_INVENTORY.indexOf(field);

    const comparisonFunctions: ((a: InventoryProps, b: InventoryProps) => number)[] = [
      (a, b) => {
        const dateA = a.suppliers.reduce((acc, supplier) => acc + (supplier.lastUpdate ? new Date(supplier.lastUpdate).getTime() : 0), 0);
        const dateB = b.suppliers.reduce((acc, supplier) => acc + (supplier.lastUpdate ? new Date(supplier.lastUpdate).getTime() : 0), 0);
        return dateB - dateA;
      },
      (a, b) => a.productName.localeCompare(b.productName),
      (a, b) => b.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0) - a.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0)
    ];

    if (sortIndex === -1) return;

    const sortedProducts = [...inventory].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setInventory(sortedProducts);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 border-gray-300`}>
      <InventorySegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        setTextSearch={setTextSearch}
        textSearch={textSearch}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
      />

      <InventorySort
        setTextSearch={setTextSearch}
        SORTS_INVENTORY={SORTS_INVENTORY}
        inventory={inventory}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setInventory={setInventory}
      />
    </div>
  );
}
