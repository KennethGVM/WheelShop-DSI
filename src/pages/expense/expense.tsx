import Container from "@/layout/container";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { ExpenseProps } from "@/types/types";
import ExpenseHeader from "./expense-header";
import ExpenseSearch from "./expense-search";
import ExpenseTable from "./expense-table";
import TablePagination from "@/components/table-pagination";
import ExpenseFilters from "./expense-filters";

export default function Expense() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseProps[]>([]);
  const expenseRef = useRef<ExpenseProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const [textSearch, setTextSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    segments: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
    isCommission: null as boolean | null,
  });

  const handleLoadExpenses = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getexpenses')
      .select('*', { count: 'exact' })
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
    if (filters.isCommission !== null) {
      query = query.eq("isCommission", filters.isCommission);
    }

    query = query.range(from, to);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `name.ilike.%${token}%`,
            `userName.ilike.%${token}%`,
            `currencyName.ilike.%${token}%`,
            `paymentMethodName.ilike.%${token}%`
          ].join(',')
        );
      });
    }

    const { data, count } = await query;

    if (data) {
      setExpenses(data as ExpenseProps[]);
      expenseRef.current = data as ExpenseProps[];
      setTotalExpenses(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadExpenses(page);
  }, [page, textSearch, filters]);

  const totalPages = Math.ceil(totalExpenses / pageSize);

  return (
    <Container>
      <>
        <ExpenseHeader expenses={expenses} setExpenses={setExpenses} />
        <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
          <ExpenseSearch
            expenses={expenseRef.current}
            setExpenses={setExpenses}
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            setTextSearch={setTextSearch}
            textSearch={textSearch}
          />
          <ExpenseFilters
            filters={filters}
            setFilters={setFilters}
            isSearching={isSearching}
            expenses={expenses}
          />
          <ExpenseTable expenses={expenses} setExpenses={setExpenses} isLoading={isLoading} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container>
  )
}