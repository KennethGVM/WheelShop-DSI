import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { PurchaseProps } from "@/types/types";
import { getPermissions } from "@/lib/function";
import { useRolePermission } from "@/api/permissions-provider";
import AccessPage from "../access-page";
import TablePagination from "@/components/table-pagination";
import PurchaseHeaderButtons from "./purchase-header-buttons";
import PurchaseSearch from "./purchase-search";
import PurchaseFilters from "./purchase-filters";
import PurchaseTable from "./purchase-table";

export default function Purchase() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchase, setPurchase] = useState<PurchaseProps[]>([]);
  const purchaseRef = useRef<PurchaseProps[]>([]);
  const { userPermissions } = useRolePermission();
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const permissions = userPermissions?.permissions || null;
  const canViewPurchase = getPermissions(permissions, "Ordenes de compras", "Ver")?.canAccess;
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalPurchases / pageSize);

  useEffect(() => {
    handleLoadPurchase(page, textSearch);
  }, [page, textSearch, filters]);

  const handleLoadPurchase = async (
    currentPage: number,
    searchTerm = ""
  ) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("getpurchases")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false });

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
          `codePurchaseOrder.ilike.%${token}%,referenceNumber.ilike.%${token}%,namePaymentMethod.ilike.%${token}%,nameSupplier.ilike.%${token}%,namestorehouse.ilike.%${token}%`
        );
      });
    }

    const { data, count, error } = await query;

    if (error) {
      setPurchase([]);
      purchaseRef.current = [];
      setTotalPurchases(0);
    } else {
      setPurchase(data as PurchaseProps[]);
      purchaseRef.current = data as PurchaseProps[];
      setTotalPurchases(count || 0);
    }
    setIsLoading(false);
  };

  return (
    <Container>
      {canViewPurchase ? (
        <>
          <PurchaseHeaderButtons purchases={purchase} />
          <div className="overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
            {!isLoading && (
              <>
                <PurchaseSearch
                  textSearch={textSearch}
                  purchases={purchaseRef.current}
                  setPurchases={setPurchase}
                  setTextSearch={setTextSearch}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                />
                <PurchaseFilters
                  filters={filters}
                  setFilters={setFilters}
                  isSearching={isSearching}
                  purchases={purchase}
                  setPurchases={setPurchase}
                />
              </>
            )}

            <PurchaseTable
              purchases={purchase}
              isLoading={isLoading}
            />

            <TablePagination
              totalPages={totalPages}
              page={page}
              setPage={setPage}
            />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}
