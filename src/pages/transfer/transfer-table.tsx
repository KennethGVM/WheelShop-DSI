import { useEffect, useRef, useState } from 'react';
import { TransferProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/table-skeleton';
import TransferTableHeader from './transfer-table-header';
import TransferTableRow from './transfer-table-row';
import CheckBox from '@/components/form/check-box';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';

interface TransferTableProps {
  transfers: TransferProps[];
  isLoading: boolean;
}

export default function TransferTable({ transfers, isLoading }: TransferTableProps) {
  const navigate = useNavigate();
  const [selectedTransferIds, setSelectedTransferIds] = useState<TransferProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const HEADERS = [
    { title: "Transferencia", isNumeric: false, className: 'sticky' },
    { title: "Origen", isNumeric: false },
    { title: "Destino", isNumeric: false },
    { title: "Usuario", isNumeric: false },
    { title: "Fecha", isNumeric: false },
  ];

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

  const handleEditTransfer = (transfer: TransferProps) => {
    navigate(`/transfers/add/${transfer.transferId}`);
  };

  const handleSelectTransfer = (transferId: TransferProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedTransferIds, transferId];
    } else {
      newSelectedIds = selectedTransferIds.filter((tr) => tr.transferId !== transferId.transferId);
    }

    setSelectedTransferIds(newSelectedIds);

    if (newSelectedIds.length !== transfers.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === transfers.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = transfers.map(transfer => transfer);
      setSelectedTransferIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedTransferIds([]);
      setSelectAll(false);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <TransferTableHeader
            isScrolled={isScrolled}
            transfers={transfers}
            selectedTransferIds={selectedTransferIds}
            selectAll={selectAll}
            handleEditTransfer={handleEditTransfer}
            handleSelectAll={handleSelectAll}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {transfers && transfers.length > 0 ? (
                transfers.map((transfer, key) => (
                  <TransferTableRow
                    key={key}
                    isScrolled={isScrolled}
                    handleEditTransfer={handleEditTransfer}
                    transfers={transfers}
                    transfer={transfer}
                    selectedTransferIds={selectedTransferIds}
                    handleSelectTransfer={handleSelectTransfer}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de transferencia</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${transfers.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {transfers && transfers.length > 0 ? (
          transfers.map((transfer, index) => (
            <div className={`flex items-start justify-between ${index !== transfers.length - 1 ? 'border-b' : ''}`}>
              <div key={transfer.transferId} className='flex space-x-1 items-start px-4 py-3'>
                <CheckBox
                  initialValue={selectedTransferIds.includes(transfer)}
                  onChange={(value) => handleSelectTransfer(transfer, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-secondary font-semibold text-base'>{transfer.codeTransfer}</span>
                  <span className='text-secondary/80 font-[550] text-sm'>{transfer.originName} • {transfer.destinationName}</span>
                </div>
              </div>

              <div className='px-4 py-3 flex flex-col space-y-1 items-end'>
                <span className='text-secondary font-medium text-base text-nowrap'>{transfer.products.length} artículo{transfer.products.length > 1 ? 's' : ''}</span>
                <span className='text-secondary/80 font-medium text-base text-nowrap'>{transfer.createdAt ? new Date(transfer.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de transferencia</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedTransferIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedTransferIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {transfers.length} en la página</DropdownItem>}
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
                    <DropdownItem onClick={() => handleEditTransfer(selectedTransferIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                      <ArchiveIcon className='size-5' />
                      <span>Editar transferencia</span>
                    </DropdownItem>
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
