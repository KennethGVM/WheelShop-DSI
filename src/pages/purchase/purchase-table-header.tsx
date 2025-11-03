import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { PurchaseProps } from '@/types/types';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface PurchaseTableHeaderProps {
  isScrolled: boolean;
  purchases: PurchaseProps[];
  selectedPurchaseIds: PurchaseProps[];
  handleEditPurchase: (purchaseId: PurchaseProps) => void;
  HEADERS: HeaderProps[];
  handleSelectAll: (checked: boolean) => void;
  selectAll: boolean;
}

export default function PurchaseTableHeader({ selectAll, isScrolled, handleSelectAll, purchases, selectedPurchaseIds, HEADERS, handleEditPurchase }: PurchaseTableHeaderProps) {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;

  return (
    <thead className="text-2xs sticky top-0 inset-x-0 w-full text-secondary/80 bg-[#f7f7f7] border-y z-40 border-gray-300">
      {purchases && purchases.length > 0 &&
        <tr className={`${selectedPurchaseIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedPurchaseIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedPurchaseIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedPurchaseIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedPurchaseIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>

          {HEADERS.slice(1).map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`px-6 py-2.5 bg-[#F7F7F7] ${className} left-5 ${selectedPurchaseIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}

          {selectedPurchaseIds.length > 0 &&
            <div className='absolute z-40 right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {getPermissions(permissions, 'Ordenes de compras', 'Editar ordenes de compra')?.canAccess && <Button onClick={() => handleEditPurchase(selectedPurchaseIds[0])} name='Editar orden de compra' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
            </div>
          }
        </tr>
      }
    </thead>
  )
}
