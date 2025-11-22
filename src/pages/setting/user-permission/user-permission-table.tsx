import { Dispatch, SetStateAction, useState } from 'react';
import { UserPermissionProps } from '@/types/types';
import { ArrowDownIcon, SearchIcon } from '@/icons/icons';
import TableSkeleton from '@/components/table-skeleton';
import UserPermissionTableHeader from './user-permission-table-header';
import UserPermissionTableRow from './user-permission-table-row';
import CheckBox from '@/components/form/check-box';
import StatusTags from '@/components/status-tags';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import { showToast } from '@/components/toast';
import { supabase } from '@/api/supabase-client';
import Modal from '@/components/modal';

interface UserPermissionTableProps {
  users: UserPermissionProps[];
  setUsers: Dispatch<SetStateAction<UserPermissionProps[]>>;
  isLoading: boolean;
}

export default function UserPermissionTable({ users, setUsers, isLoading }: UserPermissionTableProps) {
  const [selectedUsersIds, setSelectedUsersIds] = useState<UserPermissionProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  const HEADERS = [
    { title: "Usuario", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Rol", isNumeric: false },
  ];

  const handleSelectUser = (userId: UserPermissionProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedUsersIds, userId];
    } else {
      newSelectedIds = selectedUsersIds.filter((selectedUser) => selectedUser.userId !== userId.userId);
    }

    setSelectedUsersIds(newSelectedIds);

    if (newSelectedIds.length !== users.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === users.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = users.map(user => user);
      setSelectedUsersIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedUsersIds([]);
      setSelectAll(false);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);

  const selectedStates = selectedUsersIds.map(id => users.find(user => user.userId === id.userId)?.state);
  const allSelectedActive = selectedStates.every(state => state === true);
  const allSelectedInactive = selectedStates.every(state => state === false);
  const hasDifferentStates = !allSelectedActive && !allSelectedInactive;

  const handleUpdateUserState = async (newState: boolean) => {
    const { error } = await supabase
      .from('user')
      .update({ state: newState })
      .in('userId', selectedUsersIds.map(id => id.userId));

    if (error) {
      showToast(error.message, false);
      return;
    }

    const newUsers = users.map(user =>
      selectedUsersIds.includes(user)
        ? { ...user, state: newState }
        : user
    );

    showToast(`Estado establecido como ${newState ? 'activo' : 'inactivo'}`, true);
    setIsModalOpen(false);
    setUsers(newUsers);
    setSelectedUsersIds([]);
  };

  return (
    <>
      <div className='relative sm:block hidden overflow-x-auto'>
        <table className="w-full bg-white">
          <UserPermissionTableHeader
            users={users}
            allSelectedActive={allSelectedActive}
            allSelectedInactive={allSelectedInactive}
            hasDifferentStates={hasDifferentStates}
            handleSelectAll={handleSelectAll}
            setIsModalOpen={setIsModalOpen}
            selectedUserIds={selectedUsersIds}
            selectAll={selectAll}
            HEADERS={HEADERS}
            setModalAction={setModalAction}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {users && users.length > 0 ? (
                users.map((user, key) => (
                  <UserPermissionTableRow
                    key={key}
                    user={user}
                    users={users}
                    selectedUsersIds={selectedUsersIds}
                    handleSelectUser={handleSelectUser}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de usuarios</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className='bg-white border-t sm:hidden block border-gray-300'>
        {users && users.length > 0 &&
          users.map((user, index) => (
            <div className={`flex items-center justify-between px-4 py-3  ${index !== users.length - 1 ? 'border-b' : ''}`}>
              <div key={user.userId} className='flex space-x-1 items-start'>
                <CheckBox
                  initialValue={selectedUsersIds.includes(user)}
                  onChange={(value) => handleSelectUser(user, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-secondary font-medium text-base'>{user.roleName}</span>
                  <span className='text-secondary/80 font-medium text-base'>{user.email}</span>
                </div>
              </div>

              <StatusTags className='px-1.5 py-0.5 rounded-lg' status={user.state} text={user.state ? 'Activo' : 'Inactivo'} />
            </div>
          ))
        }
      </div>

      {selectedUsersIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedUsersIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {users.length} en la página</DropdownItem>}
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
                    {hasDifferentStates && (
                      <>
                        <DropdownItem
                          className="mx-0 rounded-b-none text-base py-3 px-4"
                          onClick={() => {
                            setModalAction('activate');
                            setIsModalOpen(true);
                          }}
                        >Establecer como activo</DropdownItem>
                        <DropdownItem
                          className="mx-0 rounded-b-none rounded-t-none text-base py-3 px-4"
                          onClick={() => {
                            setModalAction('deactivate');
                            setIsModalOpen(true);
                          }}
                        >Establecer como inactivos</DropdownItem>
                      </>
                    )}

                    {allSelectedActive && (
                      <DropdownItem
                        className="text-base mx-0 py-3 px-4 rounded-b-none"
                        onClick={() => {
                          setModalAction('deactivate');
                          setIsModalOpen(true);
                        }}
                      >Establecer como inactivos</DropdownItem>
                    )}

                    {allSelectedInactive && (
                      <Button
                        name='Establecer como activo'
                        styleButton="primary"
                        className="text-base mx-0 py-3 px-4 rounded-b-none"
                        onClick={() => {
                          setModalAction('activate');
                          setIsModalOpen(true);
                        }}
                      />
                    )}

                    <DropdownItem className='mx-0 rounded-t-none text-base py-3 px-4'>Editar usuario</DropdownItem>
                  </DropdownContent>
                </Dropdown>
                {isModalOpen && (
                  <Modal
                    classNameModal='md:w-[1000px]'
                    principalButtonName={modalAction === 'activate' ? 'Establecer como activo' : 'Establecer como inactivos'}
                    onClose={() => setIsModalOpen(false)}
                    onClickSave={() => handleUpdateUserState(modalAction === 'activate')}
                    name={
                      modalAction === 'activate'
                        ? `¿Guardar ${selectedUsersIds.length} producto(s) como activo(s)?`
                        : `¿Guardar ${selectedUsersIds.length} productos como inactivos?`
                    }
                  >
                    <p className='font-normal py-4 text-secondary/80 text-sm px-4'>
                      {modalAction === 'activate'
                        ? 'Activar los usuarios hará que estén disponibles nuevamente en el sistema.'
                        : 'Guardar usuarios como inactivos no les permitira el acceso al sistema.'}
                    </p>
                  </Modal>
                )}
              </div>
            </div>
          </div>
        </div >
      )
      }
    </>
  )
}
