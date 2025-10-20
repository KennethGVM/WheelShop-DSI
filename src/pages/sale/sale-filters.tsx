import { Dispatch, SetStateAction } from "react";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import { SaleProps } from "@/types/types";
import Button from "@/components/form/button";

interface SaleFiltersProps {
  isSearching: boolean;
  sales: SaleProps[];
  filters: { segments: number; startDate: Date | null; endDate: Date | null };
  setFilters: Dispatch<SetStateAction<{ segments: number; startDate: Date | null; endDate: Date | null }>>;
}

export default function SaleFilters({ filters, setFilters, isSearching, sales }: SaleFiltersProps) {
  const handleDateFilter = (type: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (type) {
      case "7":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case "30":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        endDate = now;
        break;
      case "90":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
        endDate = now;
        break;
      case "12m":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        endDate = now;
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // último día mes pasado
        break;
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        startDate = null;
        endDate = null;
        break;
    }

    setFilters(prev => ({
      ...prev,
      startDate,
      endDate,
    }));
  };

  return (
    <div className={`overflow-hidden ${sales && sales.length > 0 ? 'border-0' : 'border-b border-gray-300'} transition-all duration-200 ease-out ${isSearching ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
      <div className="flex items-center space-x-2 py-1.5 px-2 bg-white transform transition-transform duration-200 ease-out translate-y-0">
        <Dropdown>
          <DropdownTrigger>
            <button className="flex items-center space-x-1 border border-dashed border-gray-300 rounded-md px-1.5 py-0.5 md:text-xs text-sm text-secondary/80 font-medium hover:border-solid">
              <span>Fecha de creación</span>
            </button>
          </DropdownTrigger>
          <DropdownContent align="start" className="space-y-0.5 md:[&>div]:text-2xs [&>div]:text-base">
            <DropdownItem onClick={() => handleDateFilter("7")}>Últimos 7 días</DropdownItem>
            <DropdownItem onClick={() => handleDateFilter("30")}>Últimos 30 días</DropdownItem>
            <DropdownItem onClick={() => handleDateFilter("90")}>Últimos 90 días</DropdownItem>
            <DropdownItem onClick={() => handleDateFilter("12m")}>Últimos 12 meses</DropdownItem>
            <DropdownItem onClick={() => handleDateFilter("last-month")}>Mes pasado</DropdownItem>
            <DropdownItem onClick={() => handleDateFilter("this-month")}>Este mes</DropdownItem>
            <div className="px-4 pt-2">
              <Button
                name="Borrar"
                className="text-blueprimary disabled:text-[#c0c0c0] disabled:no-underline disabled:cursor-autoo
                 md:text-2xs text-base font-medium hover:underline"
                onClick={() => handleDateFilter("null")}
                disabled={filters.startDate === null}
              />
            </div>
          </DropdownContent>
        </Dropdown>
      </div>
    </div>
  );
}