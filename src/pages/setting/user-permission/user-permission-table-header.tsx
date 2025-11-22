import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { UserPermissionProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface UserPermissionTableHeaderProps {
  users: UserPermissionProps[];
  selectedUserIds: UserPermissionProps[];
  selectAll: boolean;
  HEADERS: HeaderProps[];
  handleSelectAll: (checked: boolean) => void;
  hasDifferentStates: boolean;
  allSelectedActive: boolean;
  allSelectedInactive: boolean;
  setModalAction: Dispatch<SetStateAction<'activate' | 'deactivate' | null>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function UserPermissionTableHeader({ setIsModalOpen, setModalAction, allSelectedActive, allSelectedInactive, hasDifferentStates, handleSelectAll, users, selectedUserIds, selectAll, HEADERS }: UserPermissionTableHeaderProps) {
  const navigate = useNavigate();

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {users && users.length > 0 &&
        <tr className={`${selectedUserIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th scope="col" className={`w-4 px-2`}>
            <CheckBox
              initialValue={selectAll}
              onChange={(value) => handleSelectAll(value)}
            />
            <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
              {selectedUserIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedUserIds.length}</span>}
            </div>
          </th>
          {HEADERS.map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={twMerge(`px-2 py-2.5 bg-[#F7F7F7] left-5 ${selectedUserIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`, className)}>
              {title}
            </th>
          ))}

          {selectedUserIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {hasDifferentStates && (
                <>
                  <Button
                    name='Establecer como activo'
                    styleButton="primary"
                    className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                    onClick={() => {
                      setModalAction('activate');
                      setIsModalOpen(true);
                    }}
                  />
                  <Button
                    name='Establecer como inactivos'
                    styleButton="primary"
                    className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                    onClick={() => {
                      setModalAction('deactivate');
                      setIsModalOpen(true);
                    }}
                  />
                </>
              )}

              {allSelectedActive && (
                <Button
                  name='Establecer como inactivos'
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                  onClick={() => {
                    setModalAction('deactivate');
                    setIsModalOpen(true);
                  }}
                />
              )}

              {allSelectedInactive && (
                <Button
                  name='Establecer como activo'
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                  onClick={() => {
                    setModalAction('activate');
                    setIsModalOpen(true);
                  }}
                />
              )}
              <Button name='Editar usuario' onClick={() => navigate(`/settings/users/add/${selectedUserIds[0].userId}`)} styleButton="primary" className="px-2 md:block hidden py-1.5 text-xs font-semibold text-secondary/80" />
            </div>
          }
        </tr>
      }


    </thead>
  )
}
