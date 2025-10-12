import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import StatusTags from "@/components/status-tags";
import { ArchiveIcon, ArrowDownIcon, SearchIcon } from "@/icons/icons";
import { CustomerProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase-client";
import { showToast } from "@/components/toast";
import Modal from "@/components/modal";
import TableSkeleton from "@/components/table-skeleton";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";

interface CustomerTableProps {
  customers: CustomerProps[];
  setCustomers: Dispatch<SetStateAction<CustomerProps[]>>;
  isLoading: boolean;
}

export default function CustomerTable({ customers, setCustomers, isLoading }: CustomerTableProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateCustomer = getPermissions(permissions, "Clientes", "Crear y editar")?.canAccess;
  const canDeleteCustomer = getPermissions(permissions, "Clientes", "Eliminar")?.canAccess;


  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollLeft > 0);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const HEADERS = [
    { title: "Nombres", isNumeric: false },
    { title: "Apellidos", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Identificación", isNumeric: false },
    { title: "Teléfono", isNumeric: false },
    { title: "Correo", isNumeric: false },
    { title: "Direccion", isNumeric: false },
    { title: "Municipio", isNumeric: false },
    { title: "Categoría", isNumeric: false },
  ]

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = customers.map(customer => customer.customerId);
      setSelectedCustomerIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedCustomerIds([]);
      setSelectAll(false);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedCustomerIds, customerId];
    } else {
      newSelectedIds = selectedCustomerIds.filter(id => id !== customerId);
    }

    setSelectedCustomerIds(newSelectedIds);

    if (newSelectedIds.length !== customers.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === customers.length) {
      setSelectAll(true);
    }
  };

  const handleEditCustomer = (customerId: string) => {
    navigate(`/customers/add/${customerId}`)
  }

  const handleUpdateCustomerState = async (newState: boolean) => {
    const { error } = await supabase
      .from('customer')
      .update({ state: newState })
      .in('customerId', selectedCustomerIds);

    if (error) {
      showToast(error.message, false);
      return;
    }

    const newCostumers = customers.map(customer =>
      selectedCustomerIds.includes(customer.customerId)
        ? { ...customer, state: newState }
        : customer
    );

    showToast(`Estado establecido como ${newState ? 'activo' : 'inactivo'}`, true);
    setIsModalOpen(false);
    setCustomers(newCostumers)
  };

  const selectedStates = selectedCustomerIds.map(id => customers.find(customer => customer.customerId === id)?.state);
  const allSelectedActive = selectedStates.every(state => state === true);
  const allSelectedInactive = selectedStates.every(state => state === false);
  const hasDifferentStates = !allSelectedActive && !allSelectedInactive;

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1400px] bg-white">
          {customers && customers.length > 0 &&
            <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
              <tr className={`${selectedCustomerIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
                <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedCustomerIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
                  <div className='flex items-center space-x-2'>
                    <CheckBox
                      initialValue={selectAll}
                      onChange={(value) => handleSelectAll(value)}
                    />
                    <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                      {selectedCustomerIds.length > 0 && <span className='text-secondary/80 text-nowrap text-xs font-semibold'>Seleccionados: {selectedCustomerIds.length}</span>}
                    </div>
                    <span className={`text-secondary/80 font-semibold text-xs ${selectedCustomerIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
                  </div>
                </th>
                {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
                  <th key={index} scope="col" className={`px-6 py-2.5 ${selectedCustomerIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
                    {title}
                  </th>
                ))}

                {selectedCustomerIds.length > 0 &&
                  <>
                    <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
                      {canCreateCustomer && <Button name='Editar clientes' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" onClick={() => handleEditCustomer(selectedCustomerIds[0])} />}
                      {canDeleteCustomer && (
                        <>
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
                                onClick={() => {
                                  setModalAction('deactivate');
                                  setIsModalOpen(true);
                                }}
                                name='Establecer como inactivos'
                                styleButton="primary"
                                className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                              />
                            </>
                          )}
                          {allSelectedActive && (
                            <Button
                              onClick={() => {
                                setModalAction('deactivate');
                                setIsModalOpen(true);
                              }}
                              name='Establecer como inactivos'
                              styleButton="primary"
                              className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
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
                        </>
                      )}
                    </div>
                    {isModalOpen &&
                      <Modal classNameModal='md:w-[1000px]' principalButtonName={modalAction === 'activate' ? 'Establecer como activo' : 'Establecer como inactivos'} onClose={() => setIsModalOpen(false)} onClickSave={() => handleUpdateCustomerState(modalAction === 'activate')} name={modalAction === 'activate' ? `¿Guardar ${selectedCustomerIds.length} cliente(s) como activo(s)?` : `¿Guardar ${selectedCustomerIds.length} clientes como inactivos?`}>
                        <p className='font-normal py-4 text-secondary/80 text-sm px-4'>
                          {modalAction === 'activate' ? 'Activar los clientes hará que estén disponibles nuevamente en todos los procesos del sistema.' : 'Guardar clientes como inactivos los ocultará de todos los procesos del sistema.'}
                        </p>
                      </Modal>
                    }
                  </>
                }

              </tr>
            </thead>
          }
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                  <tr
                    key={customer.customerId}
                    onClick={() => handleEditCustomer(customer.customerId)}
                    className={`${selectedCustomerIds.includes(customer.customerId)
                      ? 'bg-whiting2'
                      : 'bg-white'
                      } cursor-pointer group text-2xs font-medium ${customer !== customers[customers.length - 1] ? 'border-b' : 'border-b-0'
                      } text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
                  >
                    <td
                      className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
          before:content-[''] before:absolute before:top-0 before:right-0
          before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
          ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedCustomerIds.includes(customer.customerId) ? 'bg-whiting2' : 'bg-white'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <CheckBox
                          initialValue={selectedCustomerIds.includes(customer.customerId)}
                          onChange={(value) => handleSelectCustomer(customer.customerId, value)}
                        />
                        <span className="text-nowrap capitalize">{customer.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-nowrap capitalize">{customer.customerLastName}</td>
                    <td className="px-6 py-4">
                      <StatusTags
                        status={customer.state}
                        text={customer.state ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                    <td className="px-6 py-4 text-nowrap uppercase">{customer.dni|| "N/A"} </td>
                    <td className="px-6 py-4 text-nowrap">{customer.phone || "N/A"}</td>
                    <td className="px-6 py-4 text-nowrap">{customer.email || "N/A"}</td>
                    <td className="px-6 py-4">{customer.address || "N/A"}</td>
                    <td className="px-6 py-4 text-nowrap">{customer.municipalityName || "N/A"}</td>
                    <td className="px-6 py-4 text-nowrap">{customer.categoryCustomerName}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center border-t text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de clientes</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white sm:hidden ${customers.length > 0 ? 'border-t' : ''} block border-gray-300`}>
        {customers && customers.length > 0 ? (
          customers.map((customer, index) => (
            <div className={`flex items-start justify-between ${index !== customers.length - 1 ? 'border-b' : ''}`}>
              <div key={customer.customerId} className='flex space-x-1 items-start px-4 py-3'>
                <CheckBox
                  initialValue={selectedCustomerIds.includes(customer.customerId)}
                  onChange={(value) => handleSelectCustomer(customer.customerId, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-primary font-medium text-base'>{`${customer.customerName} ${customer.customerLastName}`}</span>
                  <span className='text-secondary/80 font-medium text-base'>{customer.departmentName}</span>
                  <span className='text-secondary/80 font-medium text-base'>{customer.municipalityName}</span>
                </div>
              </div>

              <div className='px-4 py-3 flex flex-col space-y-1 items-end'>
                <StatusTags className='px-2 py-1 w-fit' status={customer.state} text={customer.state ? 'Activo' : 'Inactivo'} />
                <span className='text-secondary/80 font-medium text-[15px]'>{customer.phone}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de clientes</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedCustomerIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedCustomerIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {customers.length} en la página</DropdownItem>}
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
                    {canCreateCustomer && (
                      <DropdownItem onClick={() => handleEditCustomer(selectedCustomerIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                        <ArchiveIcon className='size-5' />
                        <span>Editar clientes</span>
                      </DropdownItem>
                    )}
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