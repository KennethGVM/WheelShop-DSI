import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { RoleProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface RoleTableHeaderProps {
  roles: RoleProps[];
  selectedRoleIds: RoleProps[];
  selectAll: boolean;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  setSelectedRoleIds: Dispatch<SetStateAction<RoleProps[]>>;
  HEADERS: HeaderProps[];
  handleEditRole: (roleId: string) => void;
}

export default function RoleTableHeader({ handleEditRole, roles, setSelectAll, selectedRoleIds, setSelectedRoleIds, selectAll, HEADERS }: RoleTableHeaderProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = roles.map(role => role);
      setSelectedRoleIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedRoleIds([]);
      setSelectAll(false);
    }
  };

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {roles && roles.length > 0 &&
        <tr className={`${selectedRoleIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th scope="col" className={`w-4 px-2`}>
            <CheckBox
              initialValue={selectAll}
              onChange={(value) => handleSelectAll(value)}
            />
            <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
              {selectedRoleIds.length > 0 && <span className='text-secondary/80 md:text-xs text-sm font-semibold'>Seleccionados: {selectedRoleIds.length}</span>}
            </div>
          </th>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={twMerge(`px-4 py-2.5 bg-[#F7F7F7] left-5 ${selectedRoleIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold md:text-xs text-sm ${isNumeric ? "text-right" : "text-left"}`, className)}>
              {title}
            </th>
          ))}

          {selectedRoleIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              <Button name='Ver permisos del rol' styleButton="primary" className="px-2 py-1.5 md:text-xs text-sm font-semibold text-secondary/80" onClick={() => handleEditRole(selectedRoleIds[0].roleId)} />
            </div>
          }
        </tr>
      }
    </thead>
  )
}
