import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { CashBoxProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, BillingIcon, EyeIcon, SearchIcon } from '@/icons/icons';
import TableSkeleton from '../../components/table-skeleton';
import CahsBoxTableHeader from './cash-box-table-header';
import CashBoxTableRow from './cash-box-table-row';
import Modal from '@/components/modal';
import FieldInput from '@/components/form/field-input';
import { supabase } from '@/api/supabase-client';
import { showToast } from '@/components/toast';
import CheckBox from '@/components/form/check-box';
import StatusTags from '@/components/status-tags';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import { getPermissions } from '@/lib/function';
import { useRolePermission } from '@/api/permissions-provider';
import { useNavigate } from 'react-router-dom';

interface PurchaseTableProps {
  cashBoxes: CashBoxProps[];
  setCashBoxes: Dispatch<SetStateAction<CashBoxProps[]>>;
  isLoading: boolean;
}

export default function CashBoxTable({ cashBoxes, setCashBoxes, isLoading }: PurchaseTableProps) {
  const navigate = useNavigate();
  const [selectedCashBoxesIds, setSelectedCashBoxesIds] = useState<CashBoxProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [cashBoxName, setCashBoxName] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateCashBox = getPermissions(permissions, "Caja", "Crear y editar")?.canAccess;
  const canOpenCashBox = getPermissions(permissions, "Caja", "Gestionar apertura de caja")?.canAccess;
  const canArchingCashBox = getPermissions(permissions, "Caja", "Arquear caja")?.canAccess;
  const canClosingCashBox = getPermissions(permissions, "Caja", "Cerrar caja")?.canAccess;


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
    { title: "Caja", isNumeric: false, className: 'sticky' },
    { title: "Apertura", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha de creación", isNumeric: false }
  ];

  const handleEditCashBox = (cashBox: CashBoxProps) => {
    setIsShowModal(true);
    setCashBoxName(cashBox.name);
  };

  const handleSubmit = async () => {
    if (cashBoxName?.trim() === '') {
      showToast('El nombre no puede estar vacío', false)
      return;
    }

    const { error } = await supabase.from('cashBox').update({ name: cashBoxName }).eq('cashBoxId', selectedCashBoxesIds[0].cashBoxId);

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Caja actualizada', true)
    setIsShowModal(false);
    setCashBoxName('');
    setCashBoxes((prevCashBoxes) =>
      prevCashBoxes.map((cashBox) =>
        cashBox.cashBoxId === selectedCashBoxesIds[0].cashBoxId
          ? { ...cashBox, name: cashBoxName ?? '' }
          : cashBox
      )
    );

    setSelectedCashBoxesIds([]);
  }

  const handleSelectedCashBoxes = (cashBoxId: CashBoxProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedCashBoxesIds, cashBoxId];
    } else {
      newSelectedIds = selectedCashBoxesIds.filter((cash) => cash.cashBoxId !== cashBoxId.cashBoxId);
    }

    setSelectedCashBoxesIds(newSelectedIds);

    if (newSelectedIds.length !== cashBoxes.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === cashBoxes.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = cashBoxes.map(cashBox => cashBox);
      setSelectedCashBoxesIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedCashBoxesIds([]);
      setSelectAll(false);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <CahsBoxTableHeader
            HEADERS={HEADERS}
            selectAll={selectAll}
            cashBoxes={cashBoxes}
            isScrolled={isScrolled}
            handleSelectAll={handleSelectAll}
            handleEditCashBox={handleEditCashBox}
            selectedCashBoxesIds={selectedCashBoxesIds}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {cashBoxes && cashBoxes.length > 0 ? (
                cashBoxes.map((cashBox, key) => (
                  <CashBoxTableRow
                    key={key}
                    cashBox={cashBox}
                    cashBoxes={cashBoxes}
                    isScrolled={isScrolled}
                    selectedCashBoxesIds={selectedCashBoxesIds}
                    handleSelectCashBoxes={handleSelectedCashBoxes}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de cajas</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${cashBoxes.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {cashBoxes && cashBoxes.length > 0 ? (
          cashBoxes.map((cashBox, index) => (
            <div key={cashBox.cashBoxId} className={`flex space-x-1 items-start px-4 py-3 ${index !== cashBoxes.length - 1 ? 'border-b' : ''}`}>
              <CheckBox
                initialValue={selectedCashBoxesIds.includes(cashBox)}
                onChange={(value) => handleSelectedCashBoxes(cashBox, value)}
              />
              <div className='flex flex-col space-y-1 w-full'>
                <div className='flex items-center justify-between'>
                  <span className='text-secondary font-medium text-base'>{cashBox.name}</span>
                  <span className='text-secondary/80 font-medium text-[15px]'>{new Date(cashBox.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <StatusTags className='px-2 py-0.5' status={cashBox.state} text={cashBox.state ? 'Activa' : 'Inactiva'} />
                  <StatusTags className='px-2 py-0.5' status={cashBox.isOpen} text={cashBox.isOpen ? 'Abierta' : 'Cerrada'} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de cajas</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedCashBoxesIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedCashBoxesIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {cashBoxes.length} en la página</DropdownItem>}
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
                    {canCreateCashBox && (
                      <DropdownItem onClick={() => handleEditCashBox(selectedCashBoxesIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                        <ArchiveIcon className='size-5' />
                        <span>Actualizar cajas</span>
                      </DropdownItem>
                    )}

                    {canOpenCashBox && !selectedCashBoxesIds[0].isOpen && (
                      <DropdownItem onClick={() => navigate(`/cash-box/opening/${selectedCashBoxesIds[0].cashBoxId}`)} className='space-x-2 mx-0 rounded-none text-base py-3 px-4'>
                        <EyeIcon className='size-5 fill-secondary/80 stroke-2' />
                        <span>Aperturar caja</span>
                      </DropdownItem>
                    )}

                    {canArchingCashBox && (
                      <DropdownItem onClick={() => navigate(`/archings/add/${selectedCashBoxesIds[0].cashBoxId}`)} className='space-x-2 mx-0 rounded-none text-base py-3 px-4'>
                        <BillingIcon className='size-5 fill-secondary/80 stroke-none' />
                        <span>Arquear caja</span>
                      </DropdownItem>
                    )}

                    {canClosingCashBox && (
                      <DropdownItem onClick={() => navigate(`/closings/add/${selectedCashBoxesIds[0].cashBoxId}`)} className='space-x-2 mx-0 rounded-none text-base py-3 px-4'>
                        <BillingIcon className='size-5 fill-secondary/80 stroke-none' />
                        <span>Cerrar caja</span>
                      </DropdownItem>
                    )}
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </div>
        </div >
      )}

      {isShowModal &&
        <Modal classNameModal='px-4 py-3' name='Actualizar datos de caja' onClickSave={handleSubmit} onClose={() => setIsShowModal(false)} principalButtonName='Guardar'>
          <FieldInput name='Caja' value={cashBoxName} onChange={(e) => setCashBoxName(e.target.value)} className='mb-0' />
        </Modal>
      }
    </>
  )
}
