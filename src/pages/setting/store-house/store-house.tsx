import { useEffect, useRef, useState } from "react";
import { StoreHouseProps } from "@/types/types";
import { supabase } from "@/api/supabase-client";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import StoreHouseSearch from "./store-house-search";
import StoreHouseFilters from "./store-house-filters";
import StoreHouseTable from "./store-house-table";
import FormSection from "@/layout/form-section";
import Button from "@/components/form/button";
import { useNavigate } from "react-router-dom";

export default function StoreHouse() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storeHouses, setStoreHouses] = useState<StoreHouseProps[]>([]);
  const [totalStoreHouses, setTotalStoreHouses] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const totalPages = Math.ceil(totalStoreHouses / pageSize);
  const storeHousesRef = useRef<StoreHouseProps[]>([]);

  const handleLoadStoreHouses = async (currentPage: number) => {
    setIsLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
      .from('storeHouse')
      .select('*', { count: 'exact' })
      .range(from, to)

    if (error) {
      showToast(error.message, false)
      setIsLoading(false);
      return;
    }
    setStoreHouses(data as StoreHouseProps[]);
    storeHousesRef.current = data as StoreHouseProps[];
    setTotalStoreHouses(count || 0);
    setIsLoading(false);
  };

  useEffect(() => {
    handleLoadStoreHouses(page);
  }, [page]);

  return (
    <>
      <h2 className="text-[20px] md:px-0 px-4 font-semibold text-primary/80">Bodegas</h2>

      <FormSection className="py-4">
        <>
          <div className="flex items-center justify-between">
            <h3 className="md:text-2xs text-base font-semibold text-primary/80">Todas las bodegas</h3>
            <Button name="Agregar bodega" styleButton="primary" type="button" onClick={() => navigate('/settings/store-houses/add')} className="md:text-2xs text-base px-2 py-1 text-secondary/80 font-medium" />
          </div>
          <div className="relative overflow-x-auto shadow-sm border border-gray-300 rounded-xl mt-3">
            {!isLoading && (
              <>
                <StoreHouseSearch
                  storeHouses={storeHousesRef.current}
                  setStoreHouses={setStoreHouses}
                  isSearching={isSearching}
                  setIsSearching={setIsSearching}
                />
                <StoreHouseFilters
                  isSearching={isSearching}
                  setStoreHouses={setStoreHouses}
                  storeHouses={storeHouses}
                />
              </>
            )}

            <StoreHouseTable
              storeHouses={storeHouses}
              setStoreHouses={setStoreHouses}
              isLoading={isLoading}
            />

            <TablePagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </div>
        </>
      </FormSection>
    </>
  )
}
