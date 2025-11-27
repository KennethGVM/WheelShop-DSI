import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { DiscountProps } from "@/types/types";
import DiscountHeader from "./discount-header";
import DiscountSearch from "./discount-search";
import DiscountFilters from "./discount-filters";
import DiscountTable from "./discount-table";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";
import TablePagination from "@/components/table-pagination";

export default function Discount() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [discounts, setDiscounts] = useState<DiscountProps[]>([]);
  const discountRef = useRef<DiscountProps[]>([]);
  const [totalDiscounts, setTotalDiscounts] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalDiscounts / pageSize);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeDiscount = getPermissions(permissions, "Descuentos", "Ver")?.canAccess;

  const handleLoadDiscounts = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("discount").select("*");


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
        query = query.or(`title.ilike.%${token}%`);
      });
    }

    const { data, error, count } = await query.order("createdAt", { ascending: false });

    if (error) {
      setDiscounts([]);
      discountRef.current = [];
      setTotalDiscounts(0);
    } else {
      setDiscounts(data as DiscountProps[]);
      discountRef.current = data as DiscountProps[];
      setTotalDiscounts(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadDiscounts(page);
  }, [filters, textSearch, page]);

  return (
    <Container>
      {canSeeDiscount ? (
        <>
          <DiscountHeader />
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
            {!isLoading && (
              <>
                <DiscountSearch
                  discounts={discountRef.current}
                  setDiscounts={setDiscounts}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                  setTextSearch={setTextSearch}
                  textSearch={textSearch}
                />
                <DiscountFilters
                  filters={filters}
                  isSearching={isSearching}
                  discounts={discounts}
                  setFilters={setFilters}
                  setDiscounts={setDiscounts}
                />
              </>
            )}
            <DiscountTable discounts={discounts} setDiscounts={setDiscounts} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
}
