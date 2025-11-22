import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { InventoryProps, ProductAdjustmentProps, TypeAdjustmentProps } from '@/types/types';
import { ArrowDownIcon, SearchIcon } from '@/icons/icons';
import TableSkeleton from '../../components/table-skeleton';
import InventoryTableHeader from './inventory-table-header';
import InventoryTableRow from './inventory-table-row';
import { supabase } from '@/api/supabase-client';
import CheckBox from '@/components/form/check-box';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import { useNavigate } from 'react-router-dom';

interface InventoryTableProps {
  inventory: InventoryProps[];
  selectedStoreHouse: string;
  setInventory: Dispatch<SetStateAction<InventoryProps[]>>;
  isLoading: boolean;
  productAdjustments: ProductAdjustmentProps[];
  setProductAdjustments: Dispatch<SetStateAction<ProductAdjustmentProps[]>>;
}

type SelectedItem = {
  inventoryId: string
  supplierIds: string[]
}

export default function InventoryTable({ selectedStoreHouse, inventory, productAdjustments, setProductAdjustments, isLoading }: InventoryTableProps) {
  const navigate = useNavigate();
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<SelectedItem[]>([])
  const [typeAdjusment, setTypeAdjusment] = useState<TypeAdjustmentProps[]>([]);

  const HEADERS = [
    { title: "Producto", isNumeric: false },
    { title: "Numeración", isNumeric: false },
    { title: "Stock", isNumeric: false },
    { title: "En transito", isNumeric: true, className: "px-10" },
    { title: "En mano", isNumeric: true },
    { title: "Ultima actualización", isNumeric: false },
  ];

  useEffect(() => {
    const handleLoadTypeAdjustment = async () => {
      const { data } = await supabase.from('typeAdjustment').select('*');
      setTypeAdjusment(data as TypeAdjustmentProps[]);
    }

    handleLoadTypeAdjustment();
  }, []);

  const handleSelectProduct = (product: InventoryProps, checked: boolean) => {
    setSelectedInventoryIds((prev) => {
      if (checked) {
        const supplierIds = product.suppliers.map((s) => s.supplierId)
        const existing = prev.find((item) => item.inventoryId === product.productId)
        if (existing) {
          return prev.map((item) =>
            item.inventoryId === product.productId ? { ...item, supplierIds } : item
          )
        } else {
          return [...prev, { inventoryId: product.productId, supplierIds }]
        }
      } else {
        return prev.filter((item) => item.inventoryId !== product.productId)
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const all = inventory.map((p) => ({
        inventoryId: p.productId,
        supplierIds: p.suppliers.map((s) => s.supplierId),
      }))
      setSelectedInventoryIds(all)
    } else {
      setSelectedInventoryIds([])
    }
  }


  const getSelection = (productId: string) => {
    return selectedInventoryIds.find((item) => item.inventoryId === productId)
  }

  const areAllSuppliersSelected = (inventory: InventoryProps) => {
    const item = getSelection(inventory.productId)
    return item && item.supplierIds.length === inventory.suppliers.length
  }

  return (
    <>
      <div className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <InventoryTableHeader
            areAllSuppliersSelected={areAllSuppliersSelected}
            handleSelectAll={handleSelectAll}
            selectedStoreHouse={selectedStoreHouse}
            inventory={inventory}
            selectedInventoryIds={selectedInventoryIds}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {inventory && inventory.length > 0 ? (
                inventory.filter(inv => inv.suppliers.length > 0).map((inventories, key) => (
                  <InventoryTableRow
                    typeAdjustments={typeAdjusment}
                    productAdjustments={productAdjustments}
                    setProductAdjustments={setProductAdjustments}
                    key={key}
                    inventory={inventories}
                    selectedInventoryIds={selectedInventoryIds}
                    setSelectedInventoryIds={setSelectedInventoryIds}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de inventario</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${inventory.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {inventory && inventory.length > 0 ? (
          inventory.map((inv, index) => (
            <div className={`${index !== inventory.length - 1 ? 'border-b' : ''}`}>
              <div key={inv.inventoryId} className={`flex space-x-1 items-start px-4 py-3`}>
                <CheckBox
                  initialValue={areAllSuppliersSelected(inv)}
                  onChange={(checked) => handleSelectProduct(inv, !!checked)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-secondary font-medium text-base'>{inv.productName}</span>
                  <span className='text-secondary/80 font-medium text-base'>{inv.numeration}</span>
                </div>
              </div>
              <div className='flex items-center ml-14 pr-4 justify-between border-b pb-1 border-gray-300'>
                <span className='text-secondary/80 font-medium text-base'>Stock</span>
                <span className='text-secondary/80 font-medium text-base'>{inv.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0)}</span>
              </div>

              <div className='flex items-center ml-14 pr-4 justify-between border-b pb-1 border-gray-300 mt-5'>
                <span className='text-secondary/80 font-medium text-base'>En transito</span>
                <span className='text-secondary/80 font-medium text-base'>{inv.suppliers.reduce((acc, supplier) => acc + supplier.purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0), 0)}</span>
              </div>

              <div className='flex items-center ml-14 pr-4 justify-between border-b mb-4 pb-1 border-gray-300 mt-5'>
                <span className='text-secondary/80 font-medium text-base'>Total</span>
                <span className='text-secondary/80 font-medium text-base'>{Number(inv.suppliers.reduce((acc, supplier) => acc + supplier.stock, 0)) + inv.suppliers.reduce((acc, supplier) => acc + supplier.purchaseOrders.reduce((acc, purchaseOrder) => acc + purchaseOrder.quantity, 0), 0)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de inventario</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedInventoryIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedInventoryIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {<DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {inventory.length} en la página</DropdownItem>}
                    <DropdownItem onClick={() => handleSelectAll(false)} className='mx-0 rounded-t-none text-base py-3 px-4'>Deseleccionar todo</DropdownItem>
                  </DropdownContent>
                </Dropdown>

                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>Acciones</span>
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="end" position='top' className="rounded-xl px-0 py-0">
                    <DropdownItem onClick={() => navigate(`/transfers/add/?productId=${selectedInventoryIds[0].inventoryId}&supplierId=${selectedInventoryIds[0].supplierIds[0]}&storeHouseId=${selectedStoreHouse}`)} className='mx-0 rounded-b-none text-base py-3 px-4'>Crear transferencia</DropdownItem>
                    <DropdownItem onClick={() => navigate(`/purchases/add/?productId=${selectedInventoryIds[0].inventoryId}&supplierId=${selectedInventoryIds[0].supplierIds[0]}`)} className='mx-0 rounded-t-none text-base py-3 px-4'>Crear orden de compra</DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </div>
        </div >
      )}
    </>

  )
}
