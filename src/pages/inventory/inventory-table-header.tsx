import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { InventoryProps } from '@/types/types';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

type SelectedItem = {
  inventoryId: string
  supplierIds: string[]
}

interface InventoryTableHeaderProps {
  inventory: InventoryProps[];
  selectedStoreHouse: string;
  selectedInventoryIds: SelectedItem[];
  HEADERS: HeaderProps[];
  handleSelectAll: (checked: boolean) => void;
  areAllSuppliersSelected: (inventory: InventoryProps) => boolean | undefined;
}

export default function InventoryTableHeader({ areAllSuppliersSelected, selectedStoreHouse, inventory, handleSelectAll, selectedInventoryIds, HEADERS }: InventoryTableHeaderProps) {
  const navigate = useNavigate();

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {inventory && inventory.length > 0 &&
        <tr className={`${selectedInventoryIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th scope="col" className={`w-4 pl-2`}>
            <CheckBox
              initialValue={inventory.every(areAllSuppliersSelected)}
              onChange={(checked) => handleSelectAll(!!checked)}
            />

            <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
              {selectedInventoryIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedInventoryIds.length}</span>}
            </div>
          </th>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={twMerge(`px-2 py-2.5 bg-[#F7F7F7] left-5 ${selectedInventoryIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`, className)}>
              {title}
            </th>
          ))}

          {selectedInventoryIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {selectedInventoryIds.length === 1 && (
                <>
                  <Button name='Crear transferencia' onClick={() => navigate(`/transfers/add/?productId=${selectedInventoryIds[0].inventoryId}&supplierId=${selectedInventoryIds[0].supplierIds[0]}&storeHouseId=${selectedStoreHouse}`)} styleButton="primary" className="px-2 md:block hidden py-1.5 text-xs font-semibold text-secondary/80" />
                  <Button name='Crear orden de compra' onClick={() => navigate(`/purchases/add/?productId=${selectedInventoryIds[0].inventoryId}&supplierId=${selectedInventoryIds[0].supplierIds[0]}`)} styleButton="primary" className="px-2 md:block hidden py-1.5 text-xs font-semibold text-secondary/80" />
                </>
              )}
            </div>
          }
        </tr>
      }
    </thead>
  )
}
