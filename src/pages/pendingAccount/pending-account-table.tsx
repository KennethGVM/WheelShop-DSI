import { useEffect, useRef, useState } from 'react';
import { PendingAccountProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, EyeIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/table-skeleton';
import PendingAccountTableHeader from './pending-account-table-header';
import PendingAccountTableRow from './pending-account-table-row';
import CheckBox from '@/components/form/check-box';
import StatusTags from '@/components/status-tags';
import { currencyFormatter } from '@/lib/function';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';

interface PendingAccountTableProps {
  pendingAccounts: PendingAccountProps[];
  isLoading: boolean;
}

export default function PendingAccountTable({ pendingAccounts, isLoading }: PendingAccountTableProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const [selectedPendingAccountIds, setSelectedPendingAccountIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);


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
    { title: "Cliente", isNumeric: false },
    { title: "Codigo de venta", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Vencimiento", isNumeric: false },
    { title: "Dias pendientes", isNumeric: false },
    { title: "Total", isNumeric: true },
    { title: "Saldo", isNumeric: true }
  ]

  const handleEditPendingAccount = (saleId: string) => {
    const selectedSale = pendingAccounts.find(p => p.saleId === saleId);
    if (selectedSale) {
      navigate(`/sales/payment/add/${saleId}`);
    }
  };

  const handleSelectPendingAccount = (saleId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedPendingAccountIds, saleId];
    } else {
      newSelectedIds = selectedPendingAccountIds.filter(id => id !== saleId);
    }

    setSelectedPendingAccountIds(newSelectedIds);

    if (newSelectedIds.length !== pendingAccounts.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === pendingAccounts.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = pendingAccounts.map(pendingAccount => pendingAccount.saleId);
      setSelectedPendingAccountIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedPendingAccountIds([]);
      setSelectAll(false);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <PendingAccountTableHeader
            pendingAccounts={pendingAccounts}
            selectedPendingAccountIds={selectedPendingAccountIds}
            selectAll={selectAll}
            handleSelectAll={handleSelectAll}
            handleEditPendingAccount={handleEditPendingAccount}
            isScrolled={isScrolled}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {pendingAccounts && pendingAccounts.length > 0 ? (
                pendingAccounts.map((pendingAccount, key) => (
                  <PendingAccountTableRow
                    key={key}
                    handleSelectPendingAccount={handleSelectPendingAccount}
                    isScrolled={isScrolled}
                    handleEditPendingAccount={handleEditPendingAccount}
                    pendingAccounts={pendingAccounts}
                    pendingAccount={pendingAccount}
                    selectedPendingAccountIds={selectedPendingAccountIds}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de cuentas pendientes</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${pendingAccounts.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {pendingAccounts && pendingAccounts.length > 0 ? (
          pendingAccounts.map((pending, index) => (
            <div key={pending.saleId} className={`flex space-x-1 items-start px-4 py-3 ${index !== pendingAccounts.length - 1 ? 'border-b' : ''}`}>
              <CheckBox
                initialValue={selectedPendingAccountIds.includes(pending.saleId)}
                onChange={(value) => handleSelectPendingAccount(pending.saleId, value)}
              />
              <div className='flex flex-col w-full'>
                <span className='text-2xs font-semibold text-secondary/80'>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')} a las {new Date(pending.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace('.', '')}</span>
                <div className='flex items-center mt-1 justify-between'>
                  <span className='text-secondary font-medium text-base'>{pending.salesCode}</span>
                  <span className='text-secondary/80 font-semibold text-sm'>{currencyFormatter(pending.total)}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <span className='text-secondary/80 font-medium text-sm'>{pending.customerName} •</span>
                  <StatusTags
                    status={pending.daysPending > 0}
                    text={
                      pending.daysPending < 1
                        ? 'Vencido'
                        : pending.daysPending === 1
                          ? '1 día'
                          : `${pending.daysPending} días`
                    }
                    color={pending.daysPending > 0 ? 'bg-[#affebf]' : 'bg-[#ffabab]'}
                    textColor={pending.daysPending > 0 ? 'text-[#014b40]' : 'text-[#d10000]'}
                  />
                  <span className='text-secondary/80 font-medium text-sm'> • {currencyFormatter(pending.saldo === 0 || pending.saldo === null ? pending.total : pending.saldo)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de cuentas pendientes</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedPendingAccountIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedPendingAccountIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {pendingAccounts.length} en la página</DropdownItem>}
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
                    <DropdownItem onClick={() => navigate(`/sales/add/${selectedPendingAccountIds[0]}`)} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                      <EyeIcon className='size-5 stroke-none fill-secondary/80' />
                      <span>Ver ventas</span>
                    </DropdownItem>
                    <DropdownItem onClick={() => handleEditPendingAccount(selectedPendingAccountIds[0])} className='space-x-2 mx-0 rounded-t-none text-base py-3 px-4'>
                      <ArchiveIcon className='size-5' />
                      <span>Abonar</span>
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </div>
        </div >
      )}
    </>
  );
}