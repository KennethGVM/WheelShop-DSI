import { ReportProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ReportSort from "./report-sort";
import { SearchIcon } from "@/icons/icons";

interface ReportSearchProps {
  reports: ReportProps[];
  setReports: Dispatch<SetStateAction<ReportProps[]>>;
  isSearching: boolean;
  setIsSearching: Dispatch<SetStateAction<boolean>>;
}

interface SelectedFilters {
  segments: number;
  sorts: string;
  typeSort: 'recent' | 'ancient';
}

export default function ReportSearch({ reports, setReports, isSearching, setIsSearching }: ReportSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const SORTS_REPORTS = ["Titulo del reporte"];
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    segments: 0,
    sorts: "Titulo del reporte",
    typeSort: 'recent'
  });

  const handleChangeSelectedFilters = (name: keyof typeof selectedFilters, value: number | string) => {
    setSelectedFilters((prev) => {
      const newFilters = { ...prev, [name]: value };

      if (name !== 'segments') {
        sortDiscount(newFilters.sorts, newFilters.typeSort);
      }
      return newFilters;
    });
  };

  useEffect(() => {
    if (!isSearching) return;
    inputRef.current?.focus();
  }, [isSearching]);


  const sortDiscount = (field: string, direction: 'recent' | 'ancient') => {
    const sortIndex = SORTS_REPORTS.indexOf(field);

    const comparisonFunctions: ((a: ReportProps, b: ReportProps) => number)[] = [
      (a, b) => a.name.localeCompare(b.name),
    ];

    if (sortIndex === -1) return;

    const sortedReports = [...reports].sort((a, b) => {
      const result = comparisonFunctions[sortIndex](a, b);
      return direction === 'recent' ? result * -1 : result;
    });

    setReports(sortedReports);
  };

  const handleSearchReports = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const query = value.toLowerCase().trim();

    if (query) {
      const searchTerms = query.split(' ');
      const filtered = reports.filter((report) => {
        return searchTerms.every((term) => {
          return (
            report.name.toLowerCase().includes(term)
          );
        });
      });

      setReports(filtered);
    } else {
      setReports(reports);
    }
  };

  return (
    <div className={`flex items-center justify-between px-2 py-2 bg-white space-x-6 ${isSearching ? 'border-b' : 'border-b-0'} border-gray-300`}>
      <div className="border border-transparent rounded-lg flex items-center px-3 h-full py-1 w-full group focus-within:border-blue-500">
        <div className='flex items-center space-x-2 w-full'>
          <SearchIcon className="md:size-[18px] size-[22px] text-secondary/80 stroke-2 -ml-1" />
          <input
            ref={inputRef}
            onChange={handleSearchReports}
            placeholder="Buscando en todos los reportes"
            className="outline-none md:text-2xs text-base font-medium h-full w-full text-secondary/80 placeholder-secondary/80 md:placeholder:text-2xs placeholder:text-base"
          />
        </div>
      </div>
      <ReportSort
        SORTS_REPORTS={SORTS_REPORTS}
        selectedFilters={selectedFilters}
        handleChangeSelectedFilters={handleChangeSelectedFilters}
        setIsSearching={setIsSearching}
        inputRef={inputRef}
        setReports={setReports}
      />
    </div>
  );
}
