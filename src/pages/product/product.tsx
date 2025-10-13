import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/layout/container";
import ProductHeader from "@/pages/product/product-header";
import ProductSearch from "@/pages/product/product-search";
import ProductFilters from "@/pages/product/product-filters";
import ProductTable from "@/pages/product/product-table";
import { supabase } from "@/api/supabase-client";
import { ProductFilter, ProductProps } from "@/types/types";
import TablePagination from "@/components/table-pagination";
import { showToast } from "@/components/toast";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";

export default function Product() {
  const pageSize = 15;
  const productRef = useRef<ProductProps[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [filter, setFilter] = useState<ProductFilter>("Llantas");
  const [textSearch, setTextSearch] = useState<string>("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canViewProduct = getPermissions(permissions, "Productos", "Ver")?.canAccess;

  const typeByFilter: Record<ProductFilter, string> = {
    "Llantas": "wheel",
    "Aceites": "oil",
    "Productos Varios": "variety"
  };

  const loadProducts = async () => {
    setIsLoading(true);

    const productType = typeByFilter[filter] ?? "wheel";

    let query = supabase
      .rpc("get_products_by_supplier", {
        p_supplier_id: selectedSupplierId
      })
      .eq("type", productType);

    if (textSearch.trim().length > 0) {
      const tokens = textSearch.toLowerCase().trim().split(/\s+/);

      tokens.forEach((token) => {
        query = query.or(
          `name.ilike.%${token}%,brandName.ilike.%${token}%,brandOilName.ilike.%${token}%,numeration.ilike.%${token}%,numerationOil.ilike.%${token}%`
        );
      });
    }

    const { data, error } = await query;

    if (error) {
      showToast(error.message, false);
    } else {
      setProducts(data as ProductProps[]);
      productRef.current = data as ProductProps[];
      setPage(1);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [filter, selectedSupplierId, textSearch]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, page]);

  const totalPages = Math.ceil(products.length / pageSize);

  return (
    <Container>
      {canViewProduct ? (
        <>
          <ProductHeader filter={filter} products={products} />
          <div className="relative overflow-x-auto shadow-sm border md:rounded-xl rounded-none border-gray-300 ">
            <ProductSearch
              setTextSearch={setTextSearch}
              textSearch={textSearch}
              products={productRef.current}
              setProducts={setProducts}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              filter={filter}
            />
            <ProductFilters
              isSearching={isSearching}
              products={products}
              selectedSupplierId={selectedSupplierId}
              setSelectedSupplierId={setSelectedSupplierId}
              setProducts={setProducts}
              setFilter={setFilter}
            />
            <ProductTable
              filter={filter}
              products={paginatedProducts}
              setProducts={setProducts}
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
