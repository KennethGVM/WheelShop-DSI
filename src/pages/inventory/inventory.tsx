import Container from "@/layout/container";
import InventoryHeader from "./inventory-header";
import InventorySearch from "./inventory-search";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import {
  InventoryProps,
  ProductAdjustmentProps,
  StoreHouseProps,
} from "@/types/types";
import InventoryTable from "./inventory-table";
import TablePagination from "@/components/table-pagination";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import AccessPage from "../access-page";

export default function Inventory() {
  const pageSize = 15;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [textSearch, setTextSearch] = useState<string>("");
  const [inventory, setInventory] = useState<InventoryProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storeHouse, setStoreHouse] = useState<StoreHouseProps[]>([]);
  const [selectedStoreHouse, setSelectedStoreHouse] = useState<string>("");
  const [totalInventory, setTotalInventory] = useState<number>(0);
  const inventoryRef = useRef<InventoryProps[]>([]);
  const [productAdjustments, setProductAdjustments] = useState<ProductAdjustmentProps[]>([]);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.ceil(totalInventory / pageSize);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canViewInventory = getPermissions(permissions, "Inventario", "Ver")?.canAccess;

  useEffect(() => {
    const handleLoadStoreHouse = async () => {
      const { data } = await supabase.from("storeHouse").select("*");
      if (!data || data.length === 0) return;

      setStoreHouse(data as StoreHouseProps[]);
      setSelectedStoreHouse(data[0].storeHouseId);
    };

    handleLoadStoreHouse();
  }, []);

  useEffect(() => {
    const handleLoadInventory = async () => {
      if (!selectedStoreHouse) return;

      setIsLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("getinventory")
        .select("*", { count: "exact" })
        .range(from, to);

      if (textSearch.trim().length > 0) {
        const tokens = textSearch.toLowerCase().trim().split(/\s+/);

        tokens.forEach((token) => {
          query = query.or(
            `numeration.ilike.%${token}%,productName.ilike.%${token}%`
          );
        });
      }

      const { data, error, count } = await query;

      if (error) {
        showToast(error.message, false);
        setIsLoading(false);
        return;
      }

      const filtered = (data as InventoryProps[])
        .map((product) => ({
          ...product,
          suppliers: product.suppliers.filter(
            (supplier) => supplier.storeHouseId === selectedStoreHouse
          ),
        }))

      setInventory(filtered);
      inventoryRef.current = filtered;
      setTotalInventory(count || 0);
      setIsLoading(false);
    };

    handleLoadInventory();
  }, [selectedStoreHouse, page, textSearch]);

  const handleSubmit = async () => {
    const movements = productAdjustments.map(({ productSupplierId, quantity, cost, reason }) => ({
      productSupplierId,
      typeMovement: 2,
      quantity: Number(quantity),
      cost: Number(cost.toFixed(2)),
      reason,
      storeHouseId: selectedStoreHouse,
      total: Number((Number(quantity) * Number(cost)).toFixed(2)),
    }));

    const { error } = await supabase.rpc("createinventorymovements", { movements });

    if (error) {
      showToast(error.message, false);
    } else {
      showToast("Cantidad actualizada", true);
    }
  };

  return (
    <Container
      save={productAdjustments.length > 0}
      onSaveClick={handleSubmit}
      text="Cambios no guardados"
      isLoading={isLoading}
    >
      {canViewInventory ? (
        <>
          <InventoryHeader
            inventory={inventory}
            productAdjustments={productAdjustments}
            setProductAdjustments={setProductAdjustments}
            selectedStoreHouse={selectedStoreHouse}
            setSelectedStoreHouse={setSelectedStoreHouse}
            storeHouse={storeHouse}
          />
          <div className="relative overflow-x-auto shadow-sm border md:rounded-xl rounded-none border-gray-300 ">
            <InventorySearch
              setTextSearch={setTextSearch}
              textSearch={textSearch}
              inventory={inventoryRef.current}
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              setInventory={setInventory}
            />
            <InventoryTable
              selectedStoreHouse={selectedStoreHouse}
              inventory={inventory}
              productAdjustments={productAdjustments}
              setProductAdjustments={setProductAdjustments}
              setInventory={setInventory}
              isLoading={isLoading}
            />
            <TablePagination
              page={page}
              totalPages={totalPages}
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
