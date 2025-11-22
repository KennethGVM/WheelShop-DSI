import { useEffect, useRef, useState } from 'react';
import { ArchingProps } from '@/types/types';
import { ArrowDownIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '@/components/table-skeleton';
import ArchingTableHeader from './arching-table-header';
import ArchingTableRow from './arching-table-row';
import CheckBox from '@/components/form/check-box';
import { currencyFormatter } from '@/lib/function';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import StatusTags from '@/components/status-tags';

interface ArchingTableProps {
  archings: ArchingProps[];
  isLoading: boolean;
}

export default function ArchingTable({ archings, isLoading }: ArchingTableProps) {
  const navigate = useNavigate();
  const [selectedArchingIds, setSelectedArchingIds] = useState<ArchingProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    { title: "Arqueado por", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Total", isNumeric: true, className: 'pr-11' },
    { title: "Total sistema", isNumeric: true },
    { title: "Faltante", isNumeric: true },
  ];

  const handleEditArching = (arching: ArchingProps) => {
    navigate(`/archings/add/${arching.cashBoxId}?archingId=${arching.archingId}`);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = archings.map(arching => arching);
      setSelectedArchingIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedArchingIds([]);
      setSelectAll(false);
    }
  };

  const handleSelectArching = (arching: ArchingProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedArchingIds, arching];
    } else {
      newSelectedIds = selectedArchingIds.filter(
        (id) => id.archingId !== arching.archingId
      );
    }

    setSelectedArchingIds(newSelectedIds);

    if (newSelectedIds.length !== archings.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === archings.length) {
      setSelectAll(true);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <ArchingTableHeader
            archings={archings}
            selectedArchingIds={selectedArchingIds}
            selectAll={selectAll}
            handleSelectAll={handleSelectAll}
            isScrolled={isScrolled}
            handleEditArching={handleEditArching}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {archings && archings.length > 0 ? (
                archings.map((arching, key) => (
                  <ArchingTableRow
                    key={key}
                    handleEditArching={handleEditArching}
                    archings={archings}
                    arching={arching}
                    selectedArchingIds={selectedArchingIds}
                    handleSelectArching={handleSelectArching}
                    isScrolled={isScrolled}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de arqueo</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${archings.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {archings && archings.length > 0 ? (
          archings.map((arching, index) => (
            <div key={arching.cashBoxId} className={`flex space-x-1 items-start px-4 py-3 ${index !== archings.length - 1 ? 'border-b' : ''}`}>
              <CheckBox
                initialValue={selectedArchingIds.includes(arching)}
                onChange={(value) => handleSelectArching(arching, value)}
              />
              <div className='flex flex-col space-y-1 w-full'>
                <span className='text-secondary/80 font-medium text-[15px]'>{new Date(arching.archingDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')}</span>
                <div className='flex items-center justify-between'>
                  <span className='text-secondary font-medium text-base'>{arching.cashBoxName}</span>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button className="flex items-center space-x-0.5">
                        <span className='text-secondary/80 font-medium text-base'>{currencyFormatter(arching.total)}</span>
                        <ArrowDownIcon className="size-5 stroke-none fill-secondary/80" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownContent align="end" className="rounded-2xl w-[300px]" >
                      <DropdownItem className="justify-between hover:bg-transparent">
                        <div className="flex items-center space-x-3">
                          <div className="size-2.5 rounded-[3px] border border-gray-400" />
                          <span className='text-base'>Total denominación</span>
                        </div>
                        <span className='text-base'>{currencyFormatter(arching.totalTicket)}</span>
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem className="justify-between hover:bg-transparent">
                        <div className="flex items-center space-x-3">
                          <div className="size-2.5 rounded-[3px] border border-gray-400" />
                          <span className='text-base'>Total tarjeta</span>
                        </div>
                        <span className='text-base'>{currencyFormatter(arching.totalBank)}</span>
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem className="justify-between hover:bg-transparent">
                        <div className="flex items-center space-x-3">
                          <div className="size-2.5 rounded-[3px] border border-gray-400" />
                          <span className='text-base'>Total transferencia</span>
                        </div>
                        <span className='text-base'>{currencyFormatter(arching.totalTransfer)}</span>
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </div>
                <StatusTags className='w-fit px-2 py-0.5 mt-1' status={arching.state} text={arching.state ? 'Completado' : 'Faltante'} />
                <span className='text-secondary/80 font-medium text-base'>{arching.email} • {currencyFormatter(arching.systemTotal)}</span>
                <div className='flex items-center justify-between'>
                  <span className='text-secondary font-[550] text-base'>Faltante:</span>
                  <span className='text-secondary font-[550] text-base'>{currencyFormatter(arching.diference)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de arqueo</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda
            </p>
          </div>
        )}
      </div>

      {selectedArchingIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedArchingIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {<DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {archings.length} en la página</DropdownItem>}
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
                    <DropdownItem onClick={() => handleEditArching(selectedArchingIds[0])} className='mx-0 rounded-t-none text-base py-3 px-4'>Ver arqueo</DropdownItem>
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