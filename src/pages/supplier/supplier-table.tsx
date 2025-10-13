import Button from "@/components/form/button";
import CheckBox from "@/components/form/check-box";
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import StatusTags from "@/components/status-tags";
import { showToast } from "@/components/toast";
import { ArchiveIcon, ArrowDownIcon, CheckIcon, DeleteIcon, SearchIcon } from "@/icons/icons";
import { SupplierProps } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabase-client";
import Modal from "@/components/modal";
import TableSkeleton from "@/components/table-skeleton";

interface SupplierTableProps {
  suppliers: SupplierProps[];
  setSuppliers: Dispatch<SetStateAction<SupplierProps[]>>;
  isLoading: boolean;
}

export default function SuppplierTable({ suppliers, setSuppliers, isLoading }: SupplierTableProps) {
  const navigate = useNavigate();
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const HEADERS = [
    { title: "Nombre", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Razón Social", isNumeric: false },
    { title: "RUC", isNumeric: false },
    { title: "Teléfono", isNumeric: false },
    { title: "Correo", isNumeric: false },
  ]

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = suppliers.map(supplier => supplier.supplierId);
      setSelectedSupplierIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedSupplierIds([]);
      setSelectAll(false);
    }
  };

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedSupplierIds, supplierId];
    } else {
      newSelectedIds = selectedSupplierIds.filter(id => id !== supplierId);
    }

    setSelectedSupplierIds(newSelectedIds);

    if (newSelectedIds.length !== suppliers.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === suppliers.length) {
      setSelectAll(true);
    }
  };

  const handleEditSupplier = (supplierId: string) => {
    navigate(`/suppliers/add/${supplierId}`)
  }
  const handleUpdateSupplierState = async (newState: boolean) => {
    const { error } = await supabase
      .from('supplier')
      .update({ state: newState })
      .in('supplierId', selectedSupplierIds);

    if (error) {
      showToast(error.message, false);
      return;
    }

    const newSuppliers = suppliers.map(supplier =>
      selectedSupplierIds.includes(supplier.supplierId)
        ? { ...supplier, state: newState }
        : supplier
    );
    showToast(`Estado establecido como ${newState ? 'activo' : 'inactivo'}`, true);
    setIsModalOpen(false);
    setSuppliers(newSuppliers)
    setSelectedSupplierIds([]);
  };

  const selectedStates = selectedSupplierIds.map(id => suppliers.find(supplier => supplier.supplierId === id)?.state);
  const allSelectedActive = selectedStates.every(state => state === true);
  const allSelectedInactive = selectedStates.every(state => state === false);
  const hasDifferentStates = !allSelectedActive && !allSelectedInactive;

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          {suppliers && suppliers.length > 0 &&
            <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
              <tr className={`${selectedSupplierIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
                <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedSupplierIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
                  <div className='flex items-center space-x-2'>
                    <CheckBox
                      initialValue={selectAll}
                      onChange={(value) => handleSelectAll(value)}
                    />
                    <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                      {selectedSupplierIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedSupplierIds.length}</span>}
                    </div>
                    <span className={`text-secondary/80 font-semibold text-xs ${selectedSupplierIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
                  </div>
                </th>

                {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
                  <th key={index} scope="col" className={`px-6 py-2.5 ${selectedSupplierIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
                    {title}
                  </th>
                ))}

                {selectedSupplierIds.length > 0 &&
                  <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
                    <Button name='Editar proveedores' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" onClick={() => handleEditSupplier(selectedSupplierIds[0])} />
                    {hasDifferentStates && (
                      <>
                        <Button name='Establecer como activo' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" onClick={() => { setModalAction('activate'); setIsModalOpen(true); }} />
                        <Button onClick={() => { setModalAction('deactivate'); setIsModalOpen(true); }} name='Establecer como inactivos' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
                      </>
                    )}
                    {allSelectedActive && (
                      <Button onClick={() => { setModalAction('deactivate'); setIsModalOpen(true); }} name='Establecer como inactivos' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
                    )}
                    {allSelectedInactive && (
                      <Button name='Establecer como activo' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" onClick={() => { setModalAction('activate'); setIsModalOpen(true); }} />
                    )}
                  </div>
                }
              </tr>
            </thead>
          }
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {suppliers && suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier.supplierId}
                    onClick={() => handleEditSupplier(supplier.supplierId)}
                    className={`${selectedSupplierIds.includes(supplier.supplierId)
                      ? 'bg-whiting2'
                      : 'bg-white'
                      } cursor-pointer group text-2xs font-medium ${supplier !== suppliers[suppliers.length - 1] ? 'border-b' : 'border-b-0'
                      } text-secondary/80 border-gray-300 hover:bg-[#F7F7F7]`}
                  >
                    <td
                      className={`px-2 py-4 md:w-auto w-[20%] sticky inset-y-0 h-full left-0 z-10 bg-white group-hover:bg-[#F7F7F7]
                            before:content-[''] before:absolute before:top-0 before:right-0
                            before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity
                            ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative ${selectedSupplierIds.includes(supplier.supplierId) ? 'bg-whiting2' : 'bg-white'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <CheckBox
                          initialValue={selectedSupplierIds.includes(supplier.supplierId)}
                          onChange={(value) => handleSelectSupplier(supplier.supplierId, value)}
                        />
                        <span>{supplier.nameSupplier}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusTags
                        status={supplier.state}
                        text={supplier.state ? 'Activo' : 'Inactivo'}
                      />
                    </td>
                    <td className="px-6 py-4">{supplier.socialReason || "N/A"}</td>
                    <td className="px-6 py-4">{supplier.ruc || "N/A"}</td>
                    <td className="px-6 py-4">{supplier.phone || "N/A"}</td>
                    <td className="px-6 py-4">{supplier.email || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center border-t text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de proveedores</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table >
      </div>

      <div className={`bg-white sm:hidden block ${suppliers.length > 0 ? 'border-t' : ''} border-gray-300`}>
        {suppliers && suppliers.length > 0 ? (
          suppliers.map((supplier, index) => (
            <div className={`flex items-start justify-between ${index !== suppliers.length - 1 ? 'border-b' : ''}`}>
              <div key={supplier.supplierId} className='flex space-x-1 items-start px-4 py-3'>
                <CheckBox
                  initialValue={selectedSupplierIds.includes(supplier.supplierId)}
                  onChange={(value) => handleSelectSupplier(supplier.supplierId, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-primary font-medium text-base'>{supplier.nameSupplier}</span>
                  <span className='text-secondary/80 font-medium text-base'>{supplier.socialReason}</span>
                  <span className='text-secondary/80 font-medium text-base'>{supplier.ruc}</span>
                </div>
              </div>

              <div className='px-4 py-3 flex flex-col space-y-1 items-end'>
                <StatusTags className='px-2 py-1 w-fit' status={supplier.state} text={supplier.state ? 'Activo' : 'Inactivo'} />
                <span className='text-secondary/80 font-medium text-[15px]'>{supplier.phone}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de proveedores</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedSupplierIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedSupplierIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {suppliers.length} en la página</DropdownItem>}
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
                    <DropdownItem onClick={() => handleEditSupplier(selectedSupplierIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                      <ArchiveIcon className='size-5' />
                      <span>Editar proveedor</span>
                    </DropdownItem>

                    {(allSelectedActive || hasDifferentStates) &&
                      <DropdownItem onClick={() => { setModalAction('deactivate'); setIsModalOpen(true); }} className='hover:bg-[#fec1c7] space-x-2 text-base py-3 px-4 mx-0 rounded-none text-red-900'>
                        <DeleteIcon className='size-5 fill-[#8e0b21]' />
                        <span>Establecer como inactivos</span>
                      </DropdownItem>
                    }
                    {(allSelectedInactive || hasDifferentStates) && (
                      <DropdownItem onClick={() => { setModalAction('activate'); setIsModalOpen(true); }} className='space-x-2 mx-0 rounded-none text-base py-3 px-4'>
                        <CheckIcon className='size-5' />
                        <span>Establecer como activos</span>
                      </DropdownItem>
                    )}
                    <DropdownSeparator className='my-0' />
                    <DropdownItem className='mx-0 rounded-t-none text-base py-3 px-4'>Ver inventario</DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>

            </div>
          </div>
        </div >
      )}

      {isModalOpen &&
        <Modal classNameModal='w-[1000px]' principalButtonName={modalAction === 'activate' ? 'Establecer como activo' : 'Establecer como inactivos'} onClose={() => setIsModalOpen(false)} onClickSave={() => handleUpdateSupplierState(modalAction === 'activate')} name={modalAction === 'activate' ? `¿Guardar ${selectedSupplierIds.length} proveedor(s) como activo(s)?` : `¿Guardar ${selectedSupplierIds.length} clientes como inactivos?`}>
          <p className='font-normal py-4 text-secondary/80 text-sm px-4'>
            {modalAction === 'activate' ? 'Activar los proveedores hará que estén disponibles nuevamente en todos los procesos del sistema.' : 'Guardar proveedores como inactivos los ocultará de todos los procesos del sistema.'}
          </p>
        </Modal>
      }
    </>
  )
}