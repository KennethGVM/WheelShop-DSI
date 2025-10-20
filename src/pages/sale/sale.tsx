import { supabase } from "@/api/supabase-client";
import Container from "@/layout/container";
import SaleHeader from "./sale-header";
import SaleSearch from "./sale-search";
import { useEffect, useRef, useState } from "react";
import { SaleProps } from "@/types/types";
import SaleFilters from "./sale-filters";
import SaleTable from "./sale-table";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import { getPermissions } from "@/lib/function";
import { useRolePermission } from "@/api/permissions-provider";
import AccessPage from "../access-page";


export default function Sale() {
  const pageSize = 15;
  const saleRef = useRef<SaleProps[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [sales, setSales] = useState<SaleProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalSales / pageSize);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const canSeeSale = getPermissions(permissions, "Pedidos", "Ver")?.canAccess;

  const handleLoadSales = async (currentPage: number, searchTerm = "") => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getsales')
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
          [
            `salesCode.ilike.%${token}%`,
            `customerName.ilike.%${token}%`,
            `user.ilike.%${token}%`
          ].join(',')
        );
      });
    }

    const { data, count, error } = await query;

    if (error) {
      showToast(error.message, false);
      setIsLoading(false);
      return;
    }
    setSales(data as SaleProps[]);
    saleRef.current = data as SaleProps[];
    setTotalSales(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadSales(page, textSearch);
  }, [page, textSearch, filters]);

  return (
    <Container>
      {canSeeSale ? (
        <>
          <SaleHeader sales={sales} />
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
            <SaleSearch
              setTextSearch={setTextSearch}
              textSearch={textSearch}
              sales={saleRef.current}
              setSales={setSales}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              setIsLoading={setIsLoading}
            />
            <SaleFilters
              filters={filters}
              isSearching={isSearching}
              sales={sales}
              setFilters={setFilters}
            />
            <SaleTable sales={sales} isLoading={isLoading} setSales={setSales} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div >
        </>
      ) : (
        <AccessPage />
      )}
    </Container >
  );
}
