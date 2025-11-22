import { useState } from 'react';
import { RoleProps } from '@/types/types';
import { SearchIcon } from '@/icons/icons';
import TableSkeleton from '@/components/table-skeleton';
import RoleTableHeader from './role-table-header';
import RoleTableRow from './role-table-row';
import { useNavigate } from 'react-router-dom';


interface RolesTableProps {
  roles: RoleProps[];
  isLoading: boolean;
}

export default function RoleTable({ roles, isLoading }: RolesTableProps) {
  const navigate = useNavigate();
  const [selectedRoleIds, setSelectedRoleIds] = useState<RoleProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const HEADERS = [
    { title: "Rol", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Empleados", isNumeric: true },
  ];

  const handleEditRole = (roleId: string) => {
    navigate(`/settings/roles/add/${roleId}`);
  };

  return (
    <div className='relative overflow-x-auto'>
      <table className="w-full  bg-white">
        <RoleTableHeader
          roles={roles}
          selectedRoleIds={selectedRoleIds}
          selectAll={selectAll}
          setSelectAll={setSelectAll}
          setSelectedRoleIds={setSelectedRoleIds}
          HEADERS={HEADERS}
          handleEditRole={handleEditRole}
        />
        {isLoading ? (
          <TableSkeleton columns={HEADERS.length + 1} />
        ) : (
          <tbody>
            {roles && roles.length > 0 ? (
              roles.map((role, key) => (
                <RoleTableRow
                  key={key}
                  role={role}
                  roles={roles}
                  selectedRoleIds={selectedRoleIds}
                  setSelectedRoleIds={setSelectedRoleIds}
                  setSelectAll={setSelectAll}
                  handleEditRole={handleEditRole}
                />
              ))
            ) : (
              <tr>
                <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                  <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                    <SearchIcon className='size-16 fill-[#8c9196]' />
                    <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de rol</p>
                    <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
    </div>
  )
}
