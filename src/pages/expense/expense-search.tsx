import { ExpenseProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ExpenseSegmentSearch from "./expense-segment-search";
import ExpenseSort from "./expense-sort";

interface ExpenseSearchProps {
  expenses: ExpenseProps[];
  isSearching: boolean;
  setExpenses: Dispatch<SetStateAction<ExpenseProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}
interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}


export default function ExpenseSearch({ setTextSearch, textSearch, isSearching, setExpenses, expenses, setIsSearching }: ExpenseSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORTS_EXPENSES = ["Nombre", "Descripcion", "Monto", "Moneda", "Forma de pago", "Fecha", "Usuario", "Categoria"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sortExpenses(newFilters.sorts, newFilters.typeSort);
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortExpenses = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_EXPENSES.indexOf(field);

    const comparisonFunctions: ((a: ExpenseProps, b: ExpenseProps) => number)[] = [
      (a, b) => a.name.localeCompare(b.name),
      (a, b) => a.description.localeCompare(b.description),
      (a, b) => Number(a.amount) - Number(b.amount),
      (a, b) => a.currencyId.localeCompare(b.currencyId),
      (a, b) => a.paymentMethodId.localeCompare(b.paymentMethodId),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => a.userName.localeCompare(b.userName),
      (a, b) => Number(a.isCommission) - Number(b.isCommission),

    ];

    if (sortIndex === -1) return;

    const sortedExpenses = [...expenses].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setExpenses(sortedExpenses);
  };

  return (
    <>
      <div className={`flex items-center ${isSearching ? 'border-b' : 'border-none'} justify-between px-2 py-2 bg-white space-x-6 border-gray-300`}>
        <ExpenseSegmentSearch
          inputRef={inputRef}
          setTextSearch={setTextSearch}
          textSearch={textSearch}
        />

        <ExpenseSort
          expenses={expenses}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          setIsSearching={setIsSearching}
          setTextSearch={setTextSearch}
          setExpenses={setExpenses}
          SORTS_EXPENSES={SORTS_EXPENSES}
        />
      </div>
    </>
  )
}