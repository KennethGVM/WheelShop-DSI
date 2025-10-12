import Container from "@/layout/container";
import CustomerSearch from "./customer-search";
import { CustomerProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import { useEffect, useRef, useState } from "react";
import CustomerTable from "./customer-table";
import CustomerHeader from "./customer-header";
import TablePagination from "@/components/table-pagination";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";

export default function Customer() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const customerRef = useRef<CustomerProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const pageSize = 15;
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeCustomer = getPermissions(permissions, "Clientes", "Ver")?.canAccess;

  const handleLoadCustomers = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getcustomers')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `customerName.ilike.%${token}%`,
            `customerLastName.ilike.%${token}%`,
            `dni.ilike.%${token}%`,
            `phone.ilike.%${token}%`,
            `email.ilike.%${token}%`,
            `categoryCustomerName.ilike.%${token}%`
          ].join(',')
        );
      });
    }

    const { data, count } = await query;

    if (data) {
      setCustomers(data as CustomerProps[]);
      customerRef.current = data as CustomerProps[];
      setTotalCustomers(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadCustomers(page);
  }, [page, textSearch]);

  const totalPages = Math.ceil(totalCustomers / pageSize);

  return (
    <Container>
      {canSeeCustomer ? (
        <>
          <CustomerHeader customers={customers} />
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
            <CustomerSearch
              setTextSearch={setTextSearch}
              textSearch={textSearch}
              customers={customerRef.current}
              setCustomers={setCustomers}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
            />
            <CustomerTable customers={customers} setCustomers={setCustomers} isLoading={isLoading} />
            <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  )
}
