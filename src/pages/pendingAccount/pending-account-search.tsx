import { PendingAccountProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import PendingAccountSegmentSearch from "./pending-account-segment-search";
import PenndingAccountSort from "./pending-account-sort";

interface PendingAccountSearchProps {
  pendingAccounts: PendingAccountProps[];
  setPendingAccounts: Dispatch<SetStateAction<PendingAccountProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function PendingAccountSearch({ setTextSearch, textSearch, pendingAccounts, setPendingAccounts, isSearching, setIsSearching, setIsLoading }: PendingAccountSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORTS_PENDING_ACCOUNT = ["Codigo de la venta", "Cliente", "Fecha", "Vencimiento", "Dias pendientes", "Total", "Saldo"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Codigo de la venta",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortPendingAccounts(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortPendingAccounts = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_PENDING_ACCOUNT.indexOf(field);

    const comparisonFunctions: ((a: PendingAccountProps, b: PendingAccountProps) => number)[] = [
      (a, b) => a.salesCode.localeCompare(b.salesCode),
      (a, b) => a.customerName.localeCompare(b.customerName),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => {
        const dateA = a.expirationDate ? new Date(a.expirationDate).getTime() : 0;
        const dateB = b.expirationDate ? new Date(b.expirationDate).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.daysPending) - Number(b.daysPending),
      (a, b) => Number(a.total) - Number(b.total),
      (a, b) => Number(a.saldo) - Number(b.saldo),
    ];


    if (sortIndex === -1) return;

    const sortedPendingAccounts = [...pendingAccounts].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setPendingAccounts(sortedPendingAccounts);
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <PendingAccountSegmentSearch
        inputRef={inputRef}
        isSearching={isSearching}
        pendingAccounts={pendingAccounts}
        selectedFilters={selectedFilters}
        setPendingAccounts={setPendingAccounts}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsLoading={setIsLoading}
        setTextSearch={setTextSearch}
        textSearch={textSearch}
      />

      <PenndingAccountSort
        SORTS_PENDING_ACCOUNT={SORTS_PENDING_ACCOUNT}
        pendingAccounts={pendingAccounts}
        isSearching={isSearching}
        selectedFilters={selectedFilters}
        setTextSearch={setTextSearch}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        setPendingAccounts={setPendingAccounts}
      />
    </div>
  );
}
