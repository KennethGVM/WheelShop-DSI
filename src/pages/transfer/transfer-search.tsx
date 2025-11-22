import { TransferProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import TransferSegmentSearch from "./transfer-segment-search";
import TransferSort from "./transfer-sort";

interface TransferSearchProps {
  transfers: TransferProps[];
  isSearching: boolean;
  setTransfers: Dispatch<SetStateAction<TransferProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  textSearch: string;
  setTextSearch: Dispatch<SetStateAction<string>>;
}
interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}


export default function TransferSearch({ setTextSearch, textSearch, isSearching, setTransfers, transfers, setIsSearching }: TransferSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORT_TRANSFER = ["Nombre del usuario", "Creado", "Codigo de transferencia", "Origen", "Destino"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre del usuario",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sortTransfer(newFilters.sorts, newFilters.typeSort);
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortTransfer = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORT_TRANSFER.indexOf(field);

    const comparisonFunctions: ((a: TransferProps, b: TransferProps) => number)[] = [
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.state) - Number(b.state),
      (a, b) => a.codeTransfer.localeCompare(b.codeTransfer),
      (a, b) => a.origin.localeCompare(b.origin),
      (a, b) => a.destination.localeCompare(b.destination),
    ];

    if (sortIndex === -1) return;

    const sortedTransfers = [...transfers].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setTransfers(sortedTransfers);
  };

  return (
    <>
      <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
        <TransferSegmentSearch
          inputRef={inputRef}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          setTextSearch={setTextSearch}
          textSearch={textSearch}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
        />

        <TransferSort
          transfers={transfers}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          setIsSearching={setIsSearching}
          inputRef={inputRef}
          setTransfers={setTransfers}
          SORT_TRANSFER={SORT_TRANSFER}
        />
      </div>
    </>
  )
}