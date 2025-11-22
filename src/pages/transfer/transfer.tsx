import Container from "@/layout/container";
import { TransferProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import { useEffect, useRef, useState } from "react";
import TablePagination from "@/components/table-pagination";
import TransferHeader from "./transfer-header";
import TransferSearch from "./transfer-search";
import TransferFilters from "./transfer-filters";
import TransferTable from "./transfer-table";

export default function Transfer() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [transfers, setTransfers] = useState<TransferProps[]>([]);
  const transferRef = useRef<TransferProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const pageSize = 15;
  const handleLoadCustomers = async (currentPage: number, searchTerm = "") => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('gettransfers')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (filters.startDate) {
      query = query.gte("createdAt", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("createdAt", filters.endDate.toISOString());
    }

    if (filters.segments && filters.segments !== 0) {
      query = query.eq("state", filters.segments - 1);
    }

    query = query.range(from, to);

    if (searchTerm.trim().length > 0) {
      const tokens = searchTerm.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          `email.ilike.%${token}%,originName.ilike.%${token}%,destinationName.ilike.%${token}%,codeTransfer.ilike.%${token}%,referenceNumber.ilike.%${token}%`
        );
      });
    }

    const { data, count } = await query;

    if (data) {
      setTransfers(data as TransferProps[]);
      transferRef.current = data as TransferProps[];
      setTotalCustomers(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadCustomers(page, textSearch);
  }, [page, textSearch, filters]);

  const totalPages = Math.ceil(totalCustomers / pageSize);

  return (
    <Container>
      <>
        <TransferHeader transfers={transfers} />
        <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
          <TransferSearch
            setTextSearch={setTextSearch}
            textSearch={textSearch}
            transfers={transferRef.current}
            setTransfers={setTransfers}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
          />
          <TransferFilters
            filters={filters}
            setFilters={setFilters}
            isSearching={isSearching}
            transfers={transfers}
          />
          <TransferTable transfers={transfers} isLoading={isLoading} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container>
  )
}
