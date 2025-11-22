import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { ClosingProps } from "@/types/types";
import TablePagination from "@/components/table-pagination";
import ClosingHeader from "./closing-header";
import ClosingSearch from "./closing-search";
import ClosingFilters from "./closing-filters";
import ClosingTable from "./closing-table";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "@/pages/access-page";

export default function Closing() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [closings, setClosings] = useState<ClosingProps[]>([]);
  const closingsRef = useRef<ClosingProps[]>([]);
  const [totalClosings, setTotalClosings] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const totalPages = Math.ceil(totalClosings / pageSize);

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeClosing = getPermissions(permissions, "Caja", "Cerrar caja")?.canAccess;

  useEffect(() => {
    handleLoadClosing(page);
  }, [page, textSearch, filters]);

  const handleLoadClosing = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('getclosings').select('*', { count: 'exact' }).order('closingDate', { ascending: false })

    if (filters.startDate) {
      query = query.gte("closingDate", filters.startDate.toISOString());
    }

    if (filters.endDate) {
      query = query.lte("closingDate", filters.endDate.toISOString());
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

    const { data, count } = await query;
    setClosings(data as ClosingProps[]);
    closingsRef.current = data as ClosingProps[];
    setTotalClosings(count || 0);
    setIsLoading(false);
  }

  return (
    <Container>
      {canSeeClosing ? (
        <>
          <ClosingHeader />
          <div className="overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
            {!isLoading && (
              <>
                <ClosingSearch
                  textSearch={textSearch}
                  setTextSearch={setTextSearch}
                  closings={closingsRef.current}
                  setClosings={setClosings}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                />
                <ClosingFilters
                  isSearching={isSearching}
                  closings={closings}
                  filters={filters}
                  setFilters={setFilters}
                />
              </>
            )}
            <ClosingTable closings={closings} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}