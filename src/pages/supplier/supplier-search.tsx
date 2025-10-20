import { SupplierProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import SupplierSegmentSearch from "@/pages/supplier/supplier-segment-search";
import SupplierSort from "@/pages/supplier/supplier-sort";

interface SupplierSearchProps {
  suppliers: SupplierProps[];
  setSuppliers: Dispatch<SetStateAction<SupplierProps[]>>;
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

export default function SupplierSearch({ setTextSearch, textSearch, suppliers, setSuppliers, isSearching, setIsSearching }: SupplierSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORTS_SUPPLIERS = ["Nombre del proveedor", "Creado", "Estado", "Razon Social", "RUC", "Telefono", "Email"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre del proveedor",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sortSuppliers(newFilters.sorts, newFilters.typeSort);
      return newFilters;
    });
  };


  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);

  const sortSuppliers = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_SUPPLIERS.indexOf(field);

    const comparisonFunctions: ((a: SupplierProps, b: SupplierProps) => number)[] = [
      (a, b) => a.nameSupplier.localeCompare(b.nameSupplier),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.state) - Number(b.state),
      (a, b) => a.socialReason.localeCompare(b.socialReason),
      (a, b) => a.ruc.localeCompare(b.ruc),
      (a, b) => a.phone.localeCompare(b.phone),
      (a, b) => a.email.localeCompare(b.email),
    ];

    if (sortIndex === -1) return;

    const sortedSuppliers = [...suppliers].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setSuppliers(sortedSuppliers);
  };

  return (
    <>
      <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 border-gray-300`}>
        <SupplierSegmentSearch
          setTextSearch={setTextSearch}
          textSearch={textSearch}
          inputRef={inputRef}
          isSearching={isSearching}
          suppliers={suppliers}
          selectedFilters={selectedFilters}
          setSuppliers={setSuppliers}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
        />

        <SupplierSort
          setTextSearch={setTextSearch}
          suppliers={suppliers}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          setIsSearching={setIsSearching}
          setSuppliers={setSuppliers}
          SORTS_SUPPLIERS={SORTS_SUPPLIERS}
        />
      </div>
    </>

  )
}