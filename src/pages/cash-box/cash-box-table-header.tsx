import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { CashBoxProps } from '@/types/types';
import { useNavigate } from 'react-router-dom';
import { getPermissions } from '@/lib/function';
import { useRolePermission } from '@/api/permissions-provider';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface CashBoxTableHeaderProps {
  cashBoxes: CashBoxProps[];
  selectedCashBoxesIds: CashBoxProps[];
  selectAll: boolean;
  handleEditCashBox: (cashBoxId: CashBoxProps) => void;
  HEADERS: HeaderProps[];
  isScrolled: boolean;
  handleSelectAll: (checked: boolean) => void;
}

export default function CahsBoxTableHeader({ handleSelectAll, isScrolled, cashBoxes, selectedCashBoxesIds, selectAll, HEADERS, handleEditCashBox }: CashBoxTableHeaderProps) {
  const navigate = useNavigate();
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateCashBox = getPermissions(permissions, "Caja", "Crear y editar")?.canAccess;
  const canOpenCashBox = getPermissions(permissions, "Caja", "Gestionar apertura de caja")?.canAccess;
  const canArchingCashBox = getPermissions(permissions, "Caja", "Arquear caja")?.canAccess;
  const canClosingCashBox = getPermissions(permissions, "Caja", "Cerrar caja")?.canAccess;

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {cashBoxes && cashBoxes.length > 0 &&
        <tr className={`${selectedCashBoxesIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedCashBoxesIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedCashBoxesIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedCashBoxesIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedCashBoxesIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>

          {HEADERS.slice(1).map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`px-6 py-2.5 bg-[#F7F7F7] ${className} left-5 ${selectedCashBoxesIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}

          {selectedCashBoxesIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {canCreateCashBox && <Button onClick={() => handleEditCashBox(selectedCashBoxesIds[0])} name='Actualizar caja' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
              {canOpenCashBox && !selectedCashBoxesIds[0].isOpen && <Button onClick={() => navigate(`/cash-box/opening/${selectedCashBoxesIds[0].cashBoxId}`)} name='Aperturar caja' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
              {canArchingCashBox && selectedCashBoxesIds[0].isOpen && <Button onClick={() => navigate(`/archings/add/${selectedCashBoxesIds[0].cashBoxId}`)} name='Arquear caja' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
              {canClosingCashBox && selectedCashBoxesIds[0].isOpen && <Button onClick={() => navigate(`/closings/add/${selectedCashBoxesIds[0].cashBoxId}`)} name='Cerrar caja' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}

            </div>
          }
        </tr>
      }
    </thead >
  )
}
