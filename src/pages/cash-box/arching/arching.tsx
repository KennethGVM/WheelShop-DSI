import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { ArchingProps } from "@/types/types";
import TablePagination from "@/components/table-pagination";
import ArchingHeader from "./arching-header";
import ArchingSearch from "./arching-search";
import ArchingFilters from "./arching-filters";
import ArchingTable from "./arching-table";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "@/pages/access-page";

export default function Arching() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [archings, setArchings] = useState<ArchingProps[]>([]);
  const archingsRef = useRef<ArchingProps[]>([]);
  const [totalArchings, setTotalArchings] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalArchings / pageSize);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeArching = getPermissions(permissions, "Caja", "Arquear caja")?.canAccess;

  useEffect(() => {
    handleLoadArchings(page);
  }, [page, filters, textSearch]);

  const handleLoadArchings = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('getarchings').select('*', { count: 'exact' }).order('archingDate', { ascending: false });

    if (filters.startDate) {
      query = query.gte("archingDate", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("archingDate", filters.endDate.toISOString());
    }

    if (filters.segments && filters.segments !== 0) {
      query = query.eq("state", filters.segments - 1);
    }

    query = query.range(from, to);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          `email.ilike.%${token}%,cashBoxName.ilike.%${token}%`
        );
      });
    }

    query = query.range(from, to);

    const { data, count } = await query;

    setArchings(data as ArchingProps[]);
    archingsRef.current = data as ArchingProps[];
    setTotalArchings(count || 0);
    setIsLoading(false);
  }

  return (
    <Container>
      {canSeeArching ? (
        <>
          <ArchingHeader />
          <div className="overflow-x-auto shadow-sm border md:rounded-xl rounded-none border-gray-300 ">
            {!isLoading && (
              <>
              <ArchingSearch
                  archings={archingsRef.current}
                  setArchings={setArchings}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                  setTextSearch={setTextSearch}
                  textSearch={textSearch}
                />
                <ArchingFilters
                  filters={filters}
                  setFilters={setFilters}
                  isSearching={isSearching}
                  archings={archings}
                />
              </>
            )}
            <ArchingTable archings={archings} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}