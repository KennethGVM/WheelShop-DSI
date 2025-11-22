import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/form/dropdown';
import { PendingAccountProps } from '@/types/types';
import { ArchiveIcon, ThreeDotsIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
};

interface PendingAccountTableHeaderProps {
  pendingAccounts: PendingAccountProps[];
  selectedPendingAccountIds: string[];
  selectAll: boolean;
  handleEditPendingAccount: (saleId: string) => void;
  isScrolled: boolean;
  HEADERS: HeaderProps[];
  handleSelectAll: (checked: boolean) => void;
}

export default function PendingAccountTableHeader({ handleSelectAll, isScrolled, pendingAccounts, selectedPendingAccountIds, selectAll, HEADERS, handleEditPendingAccount }: PendingAccountTableHeaderProps) {
  const navigate = useNavigate();

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {pendingAccounts.length > 0 &&
        <tr className={`${selectedPendingAccountIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedPendingAccountIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedPendingAccountIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedPendingAccountIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedPendingAccountIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>

          {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
            <th
              key={index}
              scope="col"
              className={`${selectedPendingAccountIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 px-4 font-semibold text-xs ${isNumeric ? 'text-right' : 'text-left'}`}
            >
              {title}
            </th>
          ))}


          {selectedPendingAccountIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              <Button onClick={() => handleEditPendingAccount(selectedPendingAccountIds[0])} name='Abonar' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
              <Button onClick={() => navigate(`/sales/add/${selectedPendingAccountIds[0]}`)} name='Ver venta' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
            </div>
          }
        </tr>
      }
    </thead >
  )
}
