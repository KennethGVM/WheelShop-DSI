import { useEffect, useRef, useState } from 'react';
import { OpeningProps } from '@/types/types';
import { ArrowDownIcon, BillingIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '@/components/table-skeleton';
import OpeningTableHeader from './opening-table-header';
import OpeningTableRow from './opening-table-row';
import CheckBox from '@/components/form/check-box';
import { currencyFormatter } from '@/lib/function';
import StatusTags from '@/components/status-tags';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';

interface OpeningTableProps {
  openings: OpeningProps[];
  isLoading: boolean;
}

export default function OpeningTable({ openings, isLoading }: OpeningTableProps) {
  const navigate = useNavigate();
  const [selectedOpeningIds, setSelectedOpeningIds] = useState<OpeningProps[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const HEADERS = [
    { title: "Caja", isNumeric: false, className: 'sticky' },
    { title: "Aperturado por", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Total", isNumeric: true, className: 'pr-11' },
  ];

  const handleEditOpening = (opening: OpeningProps) => {
    navigate(`/cash-box/opening/${opening.cashBoxId}?openingId=${opening.cashBoxOpeningId}`);
  };

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
      const allIds = openings.map(opening => opening);
      setSelectedOpeningIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedOpeningIds([]);
      setSelectAll(false);
    }
  }

  const handleSelectOpening = (openingId: OpeningProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedOpeningIds, openingId];
    } else {
      newSelectedIds = selectedOpeningIds.filter((id) => id.cashBoxOpeningId !== openingId.cashBoxOpeningId);
    }

    setSelectedOpeningIds(newSelectedIds);

    if (newSelectedIds.length !== openings.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === openings.length) {
      setSelectAll(true);
    }
  };


  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <OpeningTableHeader
            openings={openings}
            handleSelectAll={handleSelectAll}
            selectedOpeningIds={selectedOpeningIds}
            selectAll={selectAll}
            handleEditOpening={handleEditOpening}
            HEADERS={HEADERS}
            isScrolled={isScrolled}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {openings && openings.length > 0 ? (
                openings.map((opening, key) => (
                  <OpeningTableRow
                    key={key}
                    isScrolled={isScrolled}
                    handleEditOpening={handleEditOpening}
                    openings={openings}
                    opening={opening}
                    selectedOpeningIds={selectedOpeningIds}
                    handleSelectOpening={handleSelectOpening}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de apertura de caja</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${openings.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {openings && openings.length > 0 ? (
          openings.map((opening, index) => (
            <div className={`flex items-start justify-between ${index !== openings.length - 1 ? 'border-b' : ''} w-full`}>
              <div key={opening.cashBoxOpeningId} className='flex space-x-1 items-start px-4 py-3 w-full'>
                <CheckBox
                  initialValue={selectAll}
                  onChange={(value) => handleSelectOpening(opening, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-secondary font-medium text-base'>{opening.cashBoxName}</span>
                  <span className='text-secondary/80 font-medium text-base'>{opening.openingDate ? new Date(opening.openingDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}</span>
                  <span className='text-secondary/80 font-medium text-base'>{opening.email}</span>
                </div>
              </div>

              <div className='px-4 py-3 flex flex-col space-y-1 items-end'>
                <StatusTags className='px-2 py-1 w-fit' status={opening.status} text={opening.status ? 'Abierta' : 'Cerrada'} />
                <Dropdown>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-0.5">
                      <span className='font-medium text-base text-secondary/80'>{currencyFormatter(opening.total)}</span>
                      <ArrowDownIcon className="size-5 stroke-none fill-secondary/80" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="end" className="rounded-2xl">
                    {Object.entries(
                      opening.details.reduce((acc, detail) => {
                        const { currencyName } = detail;
                        if (!acc[currencyName]) acc[currencyName] = [];
                        acc[currencyName].push(detail);
                        return acc;
                      }, {} as Record<string, typeof opening.details>)
                    ).map(([currency, items], groupIndex) => (
                      <div key={currency}>
                        <DropdownItem className="text-base font-semibold text-secondary/60 cursor-default hover:bg-transparent">
                          {currency}
                        </DropdownItem>
                        {items.map(({ denominationName, total }, index) => (
                          <div key={`${currency}-${index}`}>
                            <DropdownItem className="justify-between w-[300px] hover:bg-transparent">
                              <div className="flex items-center space-x-3">
                                <div className="size-2.5 rounded-[3px] border border-gray-400" />
                                <span className='text-base'>{denominationName}</span>
                              </div>
                              <span className='text-base'>{currencyFormatter(total)}</span>
                            </DropdownItem>
                            {index !== items.length - 1 && <DropdownSeparator />}
                          </div>
                        ))}
                        {groupIndex !== Object.entries(opening.details).length - 1 && <DropdownSeparator />}
                      </div>
                    ))}

                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de apertura de caja</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedOpeningIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedOpeningIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {openings.length} en la página</DropdownItem>}
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
                    <DropdownItem onClick={() => handleEditOpening(selectedOpeningIds[0])} className='space-x-2 mx-0 rounded-none text-base py-3 px-4'>
                      <BillingIcon className='size-5 fill-secondary/80 stroke-none' />
                      <span>Ver apertura de caja</span>
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