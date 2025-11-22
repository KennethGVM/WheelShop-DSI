import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { OpeningProps } from "@/types/types";
import TablePagination from "@/components/table-pagination";
import OpeningHeader from "./opening-header";
import OpeningSearch from "./opening-search";
import OpeningFilters from "./opening-filters";
import OpeningTable from "./opening-table";

export default function Opening() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openings, setOpenings] = useState<OpeningProps[]>([]);
  const openingsRef = useRef<OpeningProps[]>([]);
  const [totalOpenings, setTotalOpenings] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalOpenings / pageSize);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  useEffect(() => {
    handleLoadOpening(page);
  }, [page, textSearch, filters]);

  const handleLoadOpening = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('getcashboxopening').select('*', { count: 'exact' }).order('openingDate', { ascending: false }).range(from, to);

    if (filters.startDate) {
      query = query.gte("openingDate", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("openingDate", filters.endDate.toISOString());
    }

    if (filters.segments && filters.segments !== 0) {
      query = query.eq("state", filters.segments - 1);
    }

    query = query.range(from, to);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `email.ilike.%${token}%`,
            `cashBoxName.ilike.%${token}%`
          ].join(',')
        );
      });
    }

    const { data, count } = await query;

    setOpenings(data as OpeningProps[]);
    openingsRef.current = data as OpeningProps[];
    setTotalOpenings(count || 0);
    setIsLoading(false);
  }

  return (
    <Container>
      <>
        <OpeningHeader />
        <div className="overflow-x-auto shadow-sm border md:rounded-xl rounded-none border-gray-300 ">
          {!isLoading && (
            <>
              <OpeningSearch
                openings={openingsRef.current}
                setOpenings={setOpenings}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
                setTextSearch={setTextSearch}
                textSearch={textSearch}
              />
              <OpeningFilters
                isSearching={isSearching}
                openings={openings}
                filters={filters}
                setFilters={setFilters}
              />
            </>
          )}
          <OpeningTable openings={openings} isLoading={isLoading} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container>
  );
}