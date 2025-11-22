import { supabase } from "@/api/supabase-client";
import Container from "@/layout/container";
import PendingAccountHeader from "./pending-account-header";
import PendingAccountSearch from "./pending-account-search";
import { PendingAccountProps } from "@/types/types";
import { useState, useRef, useEffect } from "react";
import { showToast } from "@/components/toast";
import PendingAccountFilters from "./pending-account-filters";
import PendingAccountTable from "./pending-account-table";
import TablePagination from "@/components/table-pagination";
import { getPermissions } from "@/lib/function";
import { useRolePermission } from "@/api/permissions-provider";
import AccessPage from "../access-page";

export default function PendingAccount() {
  const pageSize = 15;
  const pendingAccountRef = useRef<PendingAccountProps[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccountProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPendingAccounts, setTotalPendingAccounts] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const totalPages = Math.ceil(totalPendingAccounts / pageSize);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeePendingAccount = getPermissions(permissions, "Clientes", "Ver transacciones de credito en tienda")?.canAccess;

  const handleLoadPendingAccounts = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getpendingaccounts')
      .select('*', { count: 'exact' })
      .order('salesCode')
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

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `customerName.ilike.%${token}%`,
            `salesCode.ilike.%${token}%`
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
    setPendingAccounts(data as PendingAccountProps[]);
    pendingAccountRef.current = data as PendingAccountProps[];
    setTotalPendingAccounts(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadPendingAccounts(page);
  }, [filters, page, textSearch]);

  return (
    <Container>
      {canSeePendingAccount ? (
        <>
          <PendingAccountHeader pendingAccounts={pendingAccounts} />
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
            <PendingAccountSearch
              setTextSearch={setTextSearch}
              textSearch={textSearch}
              pendingAccounts={pendingAccountRef.current}
              setPendingAccounts={setPendingAccounts}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              setIsLoading={setIsLoading}
            />
            <PendingAccountFilters
              isSearching={isSearching}
              pendingAccounts={pendingAccounts}
              filters={filters}
              setFilters={setFilters}
            />
            <PendingAccountTable pendingAccounts={pendingAccounts} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  )
}