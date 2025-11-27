import { useEffect, useRef, useState } from 'react';
import Container from '@/layout/container';
import { BrandProps } from '@/types/types';
import BrandTable from '@/pages/brand/brand-table';
import { supabase } from '@/api/supabase-client';
import TablePagination from '@/components/table-pagination';
import BrandHeader from './brand-header';
import BrandSearch from './brand-search';
import BrandFilters from './brand-filters';


export default function Brand() {
  const [isSearch, setIsSearch] = useState(false);
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalBrands, setTotalBrands] = useState<number>(0);
  const [textSearch, setTextSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const brandRef = useRef<BrandProps[]>([]);
  const [selectedBrandToEdit, setSelectedBrandToEdit] = useState<BrandProps | null>(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState<BrandProps[]>([]);
  const [filters, setFilters] = useState<{ category: string | null; state: string | null }>({
    category: null as string | null,
    state: null as string | null,
  });
  const handleLoadBrands = async (currentPage: number) => {
    setIsLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('getbrands')
      .select('*', { count: 'exact' })
      .order('createdAt', { ascending: false })
      .range(from, to);

    // 🔹 aplicar filtros
    if (filters.category) {
      query = query.eq("category", filters.category);
    }

    if (filters.state) {
      const isActive = filters.state === "Activo";
      query = query.eq("state", isActive);
    }

    // 🔹 aplicar búsqueda
    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(`brandName.ilike.%${token}%`);
      });
    }

    const { data, count } = await query;

    if (data) {
      setBrands(data as BrandProps[]);
      brandRef.current = data as BrandProps[];
      setTotalBrands(count || 0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadBrands(page);
  }, [page, textSearch, filters]);

  const totalPages = Math.ceil(totalBrands / pageSize);
  const clearSelectedBrands = () => {
    setSelectedBrandToEdit(null);
    setSelectedBrandIds([]);
  };

  const handleUpdateLocalBrand = (updatedBrand: BrandProps) => {
    console.log(updatedBrand)
    setBrands(prev => {
      const updated = prev.some(b => b.brandId === updatedBrand.brandId)
        ? prev.map(b => b.brandId === updatedBrand.brandId ? updatedBrand : b)
        : [{ brandName: updatedBrand.brandName, brandId: updatedBrand.brandId, state: updatedBrand.state, category: updatedBrand.category, createdAt: new Date }, ...prev];

      brandRef.current = updated;
      return updated;
    });
  };
  return (
    <Container>
      <>
        <BrandHeader
          selectedBrandToEdit={selectedBrandToEdit}
          setSelectedBrandToEdit={setSelectedBrandToEdit}
          onUpdateLocalBrand={handleUpdateLocalBrand}
          clearSelection={clearSelectedBrands}
        />        <div className="relative overflow-x-auto shadow-sm border border-gray-300 md:rounded-xl">
          <BrandSearch
            textSearch={textSearch}
            setTextSearch={setTextSearch}
            brands={brandRef.current}
            setBrands={setBrands}
            isSearching={isSearch}
            setIsSearching={setIsSearch}
          />
          <BrandFilters isSearching={isSearch} filters={filters} setFilters={setFilters} />
          <BrandTable brands={brands} setBrands={setBrands} isLoading={isLoading} setSelectedBrandToEdit={setSelectedBrandToEdit} selectedBrandIds={selectedBrandIds} setSelectedBrandIds={setSelectedBrandIds} />
          <TablePagination totalPages={totalPages} page={page} setPage={setPage} />
        </div>
      </>
    </Container >
  );
}