import { useEffect, useRef, useState } from 'react';
import Container from '@/layout/container';
import { SupplierProps } from '@/types/types';
import SupplierTable from '@/pages/supplier/supplier-table';
import { supabase } from '@/api/supabase-client';
import SupplierHeader from './supplier-header';
import SupplierSearch from './supplier-search';
import TablePagination from '@/components/table-pagination';

export default function Supplier() {
  const [isSearch, setIsSearch] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalSuppliers, setTotalSuppliers] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [textSearch, setTextSearch] = useState<string>("");
  const pageSize = 15;
  const supplierRef = useRef<SupplierProps[]>([]);

  const hadleLoadSuppliers = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('supplier')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          [
            `nameSupplier.ilike.%${token}%`,
            `socialReason.ilike.%${token}%`,
            `ruc.ilike.%${token}%`,
            `phone.ilike.%${token}%`,
            `email.ilike.%${token}%`
          ].join(',')
        );
      });
    }

    const { data, count } = await query;

    if (data) {
      setSuppliers(data as SupplierProps[]);
      supplierRef.current = data as SupplierProps[];
      setTotalSuppliers(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    hadleLoadSuppliers(page);
  }, [page, textSearch]);
  const totalPages = Math.ceil(totalSuppliers / pageSize);

  return (
    <Container>
      <>
        <SupplierHeader suppliers={suppliers} />
        <div className="relative overflow-x-auto shadow-sm border border-gray-300 sm:rounded-xl">
          <SupplierSearch
            setTextSearch={setTextSearch}
            textSearch={textSearch}
            suppliers={supplierRef.current}
            setSuppliers={setSuppliers}
            isSearching={isSearch}
            setIsSearching={setIsSearch}
          />
          <SupplierTable suppliers={suppliers} setSuppliers={setSuppliers} isLoading={isLoading} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container >
  );
}