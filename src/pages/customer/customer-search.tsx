import { CustomerProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import CustomerSegmentSearch from "@/pages/customer/customer-segment-search";
import CustomerSort from "@/pages/customer/customer-sort";

interface CustomerSearchProps {
  customers: CustomerProps[];
  isSearching: boolean;
  setCustomers: Dispatch<SetStateAction<CustomerProps[]>>;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
  setTextSearch: Dispatch<SetStateAction<string>>;
  textSearch: string;
}
interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function CustomerSearch({ setTextSearch, textSearch, isSearching, setCustomers, customers, setIsSearching }: CustomerSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const SORTS_CUSTOMERS = ["Nombre del cliente", "Creado", "Inactivo", "Apellido", "Identificacion", "Telefono", "Email", "Direccion", "Categoria"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Nombre del cliente",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      sortCustomers(newFilters.sorts, newFilters.typeSort);
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortCustomers = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_CUSTOMERS.indexOf(field);

    const comparisonFunctions: ((a: CustomerProps, b: CustomerProps) => number)[] = [
      (a, b) => a.customerName.localeCompare(b.customerName),
      (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      },
      (a, b) => Number(a.state) - Number(b.state),
      (a, b) => a.customerLastName.localeCompare(b.customerLastName),
      (a, b) => a.dni.localeCompare(b.dni),
      (a, b) => a.phone.localeCompare(b.phone),
      (a, b) => a.email.localeCompare(b.email),
      (a, b) => a.address.localeCompare(b.address),
      (a, b) => a.categoryCustomerName.localeCompare(b.categoryCustomerName),

    ];

    if (sortIndex === -1) return;

    const sortedCustomers = [...customers].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setCustomers(sortedCustomers);
  };

  return (
    <>
      <div className={`flex items-center justify-between sm:border-0 border-b px-2 py-2 bg-white space-x-6 border-gray-300`}>
        <CustomerSegmentSearch
          setTextSearch={setTextSearch}
          textSearch={textSearch}
          inputRef={inputRef}
          isSearching={isSearching}
          customers={customers}
          selectedFilters={selectedFilters}
          setCustomers={setCustomers}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
        />

        <CustomerSort
          customers={customers}
          isSearching={isSearching}
          selectedFilters={selectedFilters}
          handleChangeSelectedFilters={handleChangeSelectedFilters}
          setIsSearching={setIsSearching}
          setTextSearch={setTextSearch}
          setCustomers={setCustomers}
          SORTS_CUSTOMERS={SORTS_CUSTOMERS}
        />
      </div>
    </>
  )
}