import { supabase } from "@/api/supabase-client";
import Container from "@/layout/container";
import QuotationHeader from "./quotation-header";
import QuotationSearch from "./quotation-search";
import { useEffect, useRef, useState } from "react";
import { QuotationProps } from "@/types/types";
import QuotationFilters from "./quotation-filters";
import QuotationTable from "./quotation-table";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";


export default function Quotation() {
  const pageSize = 15;
  const quotationRef = useRef<QuotationProps[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [quotations, setQuotations] = useState<QuotationProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalQuotations, setTotalQuotations] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const totalPages = Math.ceil(totalQuotations / pageSize);

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateQuotation = getPermissions(permissions, "Cotizaciones", "Ver")?.canAccess;

  const handleLoadQuotations = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getquotations')
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

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `quotationCode.ilike.%${token}%`,
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
    setQuotations(data as QuotationProps[]);
    quotationRef.current = data as QuotationProps[];
    setTotalQuotations(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadQuotations(page);
  }, [filters, page, textSearch]);

  return (
    <Container>
      {canCreateQuotation ? (
        <>
          <QuotationHeader quotations={quotations}/>
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
            <QuotationSearch
              quotations={quotationRef.current}
              setQuotations={setQuotations}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              setIsLoading={setIsLoading}
              setTextSearch={setTextSearch}
              textSearch={textSearch}
            />
            <QuotationFilters
              isSearching={isSearching}
              quotations={quotations}
              filters={filters}
              setFilters={setFilters}
            />
            <QuotationTable quotations={quotations} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container >
  );
}
