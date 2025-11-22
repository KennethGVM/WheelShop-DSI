import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button';
import DropDownSelector from '@/components/form/dropdown-selector';
import Modal from '@/components/modal';
import { getPermissions } from '@/lib/function';
import { InventoryProps, ProductAdjustmentProps, StoreHouseProps } from '@/types/types';
import { Dispatch, SetStateAction, useState } from 'react';

interface InventoryHeaderProps {
  storeHouse: StoreHouseProps[];
  setSelectedStoreHouse: Dispatch<SetStateAction<string>>;
  setProductAdjustments: Dispatch<SetStateAction<ProductAdjustmentProps[]>>;
  productAdjustments: ProductAdjustmentProps[];
  inventory: InventoryProps[];
  selectedStoreHouse: string;
}

export default function InventoryHeader({
  storeHouse,
  productAdjustments,
  setProductAdjustments,
  setSelectedStoreHouse,
  selectedStoreHouse,
  inventory
}: InventoryHeaderProps) {
  const [allInventory, setAllInventory] = useState<InventoryProps[]>([]);
  const [isShowModal, setIsShowModal] = useState({
    adjustmentModal: false,
    exportModal: false,
  });
  const [pendingStoreHouse, setPendingStoreHouse] = useState<string | null>(null);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const cantExportInventory = getPermissions(permissions, "Inventario", "Exportar")?.canAccess;

  const handleLoadInventory = async () => {
    const { data } = await supabase.from('getinventory').select('*');
    const inventoryData = data as InventoryProps[];
    setAllInventory(inventoryData);
    handleChangeModal('exportModal', true);
  };

  const handleChangeModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeStoreHouse = (value: string) => {
    if (productAdjustments.length > 0) {
      setPendingStoreHouse(value);
      handleChangeModal('adjustmentModal', true);
      return;
    }

    setSelectedStoreHouse(value);
    setProductAdjustments([]);
  };


  const handleConfirmChange = () => {
    if (pendingStoreHouse) {
      setSelectedStoreHouse(pendingStoreHouse);
      setProductAdjustments([]);
      setPendingStoreHouse(null);
    }
    handleChangeModal('adjustmentModal', false);
  }

  const dataExport = inventory.map(inventory => ({
    Producto: inventory.productName,
    Numeración: inventory.numeration,
    Cantidad: inventory.suppliers.reduce((acc, curr) => acc + curr.stock, 0),
    Proveedores: inventory.suppliers.map(supplier => supplier.nameSupplier).join(", "),
    Sucursales: inventory.suppliers.map(supplier => supplier.storeHouseName).join(", "),
    "Ordenes de compras": inventory.suppliers.map(supplier => supplier.purchaseOrders.length).join(", "),
    "Total en inventario": inventory.suppliers.reduce((acc, curr) => acc + curr.stock, 0) + inventory.suppliers.map(supplier => supplier.purchaseOrders.map(po => po.quantity).reduce((acc, curr) => acc + curr, 0)).reduce((acc, curr) => acc + curr, 0),
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <div className='flex md:flex-row flex-col items-start md:space-x-2 md:w-auto w-full'>
        <div className='flex items-center justify-between md:w-auto w-full'>
          <h2 className="font-bold text-[20px] text-secondary/90">Inventario:</h2>
          {cantExportInventory && <Button onClick={handleLoadInventory} name="Exportar" className="md:px-3 md:hidden block md:py-1 px-4 py-3 bg-[#d4d4d4] text-base font-medium text-secondary" styleButton="simple" />}
        </div>
        <DropDownSelector
          items={storeHouse.map(sh => ({ name: sh.name, value: sh.storeHouseId }))}
          value={selectedStoreHouse}
          isCreated={false}
          className='border-0'
          isSearching={false}
          onChange={(handleChangeStoreHouse)}
          classNameTitle='font-bold text-secondary/90'
        />
      </div>
      {cantExportInventory && <Button name="Exportar" onClick={handleLoadInventory} className="px-3 md:block hidden py-1 bg-[#d4d4d4] text-2xs font-medium text-secondary" styleButton="simple" />}


      {isShowModal.adjustmentModal &&
        <Modal
          onClickSave={handleConfirmChange}
          onClose={() => {
            handleChangeModal('adjustmentModal', false);
            setPendingStoreHouse(null);
          }}
          classNameModal='p-4'
          name='Tienes cambios sin guardar'
          principalButtonName='Continuar'
        >
          <p className='text-2xs text-secondary/80 font-medium'>
            Esta acción eliminará todos los cambios de cantidad no guardados.
          </p>
        </Modal>
      }

      <ExportDataModal data={dataExport} allData={allInventory} fileName="inventario" isOpen={isShowModal.exportModal} onClose={() => handleChangeModal('exportModal', false)} />
    </header>
  )
}
