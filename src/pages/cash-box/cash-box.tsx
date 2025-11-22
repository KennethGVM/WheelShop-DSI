import { useEffect, useRef, useState } from "react";
import Container from "@/layout/container";
import { supabase } from "@/api/supabase-client";
import { CashBoxProps } from "@/types/types";
import CashBoxHeader from "./cash-box-header";
import CashBoxSearch from "./cash-box-search";
import CashBoxTable from "./cash-box-table";
import TablePagination from "@/components/table-pagination";

export default function CashBox() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cashBoxes, setCashBoxes] = useState<CashBoxProps[]>([]);
  const cashBoxesRef = useRef<CashBoxProps[]>([]);
  const [totalCashBoxes, setTotalCashBoxes] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalCashBoxes / pageSize);

  useEffect(() => {
    handleLoadProducts(page);
  }, [page]);

  const handleLoadProducts = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase.from('cashBox').select('*', { count: 'exact' }).order('createdAt', { ascending: false }).range(from, to);;
    setCashBoxes(data as CashBoxProps[]);
    cashBoxesRef.current = data as CashBoxProps[];
    setTotalCashBoxes(count || 0);
    setIsLoading(false);
  }

  return (
    <Container>
      <>
        <CashBoxHeader cashBoxes={cashBoxes} setCashBoxes={setCashBoxes} />
        <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
          {!isLoading && (
            <>
              <CashBoxSearch
                cashBoxes={cashBoxesRef.current}
                setCashBoxes={setCashBoxes}
                isSearching={isSearching}
                setIsSearching={setIsSearching}
              />
            </>
          )}
          <CashBoxTable cashBoxes={cashBoxes} setCashBoxes={setCashBoxes} isLoading={isLoading} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container>
  );
}
