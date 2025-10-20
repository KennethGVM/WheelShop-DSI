import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { SaleProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, GeneralIcon, InformationCircleIcon, SearchIcon, UploadIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/table-skeleton';
import SaleTableHeader from './sale-table-header';
import SaleTableRow from './sale-table-row';
import CheckBox from '@/components/form/check-box';
import { currencyFormatter, getPermissions } from '@/lib/function';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import StatusTags from '@/components/status-tags';
import Button from '@/components/form/button';
import { useRolePermission } from '@/api/permissions-provider';
import { groupProductsByStorehouseWithReturns } from './sale-table-row-group-products';
import SaleBill from './sale-bill';

interface SaleTableProps {
  sales: SaleProps[];
  setSales: Dispatch<SetStateAction<SaleProps[]>>;
  isLoading: boolean;
}

export default function SaleTable({ sales, isLoading }: SaleTableProps) {
  const navigate = useNavigate();
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateSale = getPermissions(permissions, "Pedidos", "Crear")?.canAccess;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedSaleIds, setSelectedSaleIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState({ saleBill: false });
  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen(prev => ({ ...prev, [name]: value }));
  };

  const selected = sales.find(s => s.saleId === selectedSaleIds[0]);

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
    { title: "Codigo de venta", isNumeric: false },
    { title: "Tipo de venta", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Usuario", isNumeric: false },
    { title: "Cliente", isNumeric: false },
    { title: "Total", isNumeric: true },
    { title: "Articulos", isNumeric: false },
    { title: "Forma de entrega", isNumeric: false },

  ]

  const handleEditSale = (saleId: string) => {
    const selectedSale = sales.find(p => p.saleId === saleId);
    if (selectedSale) {
      navigate(`/sales/add/${saleId}`);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = sales.map(sale => sale.saleId);
      setSelectedSaleIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedSaleIds([]);
      setSelectAll(false);
    }
  }

  const handleSelectSale = (saleId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedSaleIds, saleId];
    } else {
      newSelectedIds = selectedSaleIds.filter(id => id !== saleId);
    }

    setSelectedSaleIds(newSelectedIds);

    if (newSelectedIds.length !== sales.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === sales.length) {
      setSelectAll(true);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1400px] bg-white">
          <SaleTableHeader
            sales={sales}
            selectedSaleIds={selectedSaleIds}
            selectAll={selectAll}
            handleEditSale={handleEditSale}
            handleSelectAll={handleSelectAll}
            isScrolled={isScrolled}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {sales && sales.length > 0 ? (
                sales.map((sale, key) => (
                  <SaleTableRow
                    key={key}
                    handleSelectSale={handleSelectSale}
                    isScrolled={isScrolled}
                    handleEditSale={handleEditSale}
                    sales={sales}
                    sale={sale}
                    selectedSaleIds={selectedSaleIds}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de ventas</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${sales.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {sales && sales.length > 0 ? (
          sales.map((sale, index) => (
            <div className={`px-4 py-2 ${index !== sales.length - 1 ? 'border-b' : ''}`}>
              <div className='flex items-start w-full space-x-1'>
                <CheckBox
                  initialValue={selectedSaleIds.includes(sale.saleId)}
                  onChange={(value) => handleSelectSale(sale.saleId, value)}
                />
                <div className='flex flex-col w-full'>
                  <span className='text-2xs font-semibold text-secondary/80'>{new Date(sale.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')} a las {new Date(sale.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace('.', '')}</span>
                  <div className='flex items-center mt-1 justify-between'>
                    <span className='text-secondary font-medium text-base'>{sale?.return?.length > 0 ? `${sale.salesCode}-DEV` : sale.salesCode}</span>
                    <span className='text-secondary/80 font-semibold text-sm'>{currencyFormatter(sale.total)}</span>
                  </div>
                  <div className="flex my-1 items-center gap-2">
                    {sale.state === 3 ? (
                      <StatusTags
                        status={true}
                        className='px-1 py-0.5'
                        text="Borrador"
                        color="bg-[#d2ecf8]"
                        textColor="text-[#005c84]"
                      />
                    ) : (
                      <StatusTags
                        className='px-1 py-0.5'
                        status={true} text={sale.state === 1 ? 'Pagado' : sale.state === 0 ? 'Anulado' : 'Pendiente'}
                        color={sale.state === 1 ? 'bg-[#affebf]' : sale.state === 0 ? 'bg-[#ffabab]' : 'bg-yellow-200'}
                        textColor={sale.state === 1 ? 'text-[#014b40]' : sale.state === 0 ? 'text-[#d10000]' : 'text-yellow-800'}
                      />
                    )}

                    {sale.state === 0 && (
                      <Dropdown>
                        <DropdownTrigger>
                          <button className="flex items-center text-xs text-red-600 hover:underline">
                            <InformationCircleIcon className="size-5 fill-red-600 stroke-none" />
                          </button>
                        </DropdownTrigger>
                        <DropdownContent align="start" className="rounded-2xl w-[280px] p-3 space-y-2 bg-white shadow md:text-2xs text-base text-gray-800">
                          <p><strong>Anulado por:</strong> {sale.cancellationUser || 'N/A'}</p>
                          <p><strong>Razón:</strong> {sale.cancellationReason || 'N/A'}</p>
                          <p><strong>Fecha:</strong> {sale.cancellationDate ? new Date(sale.cancellationDate).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }).replace('.', '')
                            : ''}</p>
                        </DropdownContent>
                      </Dropdown>
                    )}

                    {sale.typeSale === 2 ? (
                      <StatusTags
                        status={true}
                        className='px-1 py-0.5'
                        text="Cotización"
                        color="bg-[#d2ecf8]"
                        textColor="text-[#005c84]"
                      />
                    ) : (
                      <StatusTags
                        className='px-1 py-0.5'
                        status={sale.typeSale === 1}
                        text={sale.typeSale ? 'Contado' : 'Crédito'}
                        color={sale.typeSale ? 'bg-[#affebf]' : 'bg-yellow-200'}
                        textColor={sale.typeSale ? 'text-[#014b40]' : 'text-yellow-800'}
                      />
                    )}
                  </div>
                  <Dropdown>
                    <DropdownTrigger>
                      <button className="flex items-center space-x-1">
                        <span className='text-[15px] font-medium text-secondary/80'>{sale.customerName} • {sale.productCount} artículo{sale.productCount === 1 ? '' : 's'}</span>
                        <ArrowDownIcon className="size-5 stroke-none fill-secondary/80" />
                      </button>
                    </DropdownTrigger>

                    {sale.products.length > 0 && (
                      <DropdownContent align="end" className="rounded-2xl w-[300px] p-2 space-y-2">
                        {groupProductsByStorehouseWithReturns(sale).length > 0 ? (
                          groupProductsByStorehouseWithReturns(sale).map((group, index) => (
                            <div key={index} className="rounded-xl border bg-muted p-3">
                              <div className="flex items-center gap-2 md:text-2xs text-base  px-2.5 py-1 rounded-full bg-[#F3F3F3]">
                                <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                                {group.storeHouse}
                              </div>
                              {group.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center justify-between rounded-lg bg-background p-2 shadow-sm mb-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div className="md:text-2xs text-base">{item.productName}</div>
                                    </div>
                                  </div>
                                  <span className="md:text-2xs text-base ">x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 md:text-2xs text-base  px-2.5 py-1 rounded-full bg-[#F3F3F3]">
                            <GeneralIcon className="size-4 fill-secondary/80 stroke-none" />
                            DEVUELTOS
                          </div>
                        )}
                      </DropdownContent>
                    )}
                  </Dropdown>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de ventas</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedSaleIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedSaleIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {sales.length} en la página</DropdownItem>}
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
                    {canCreateSale && (
                      <>
                        <DropdownItem onClick={() => handleChangeShowModal('saleBill', true)} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                          <UploadIcon className='size-5' />
                          <span>Imprimir PDF</span>
                        </DropdownItem>

                        <DropdownItem onClick={() => handleEditSale(selectedSaleIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                          <ArchiveIcon className='size-5' />
                          <span>Editar venta</span>
                        </DropdownItem></>
                    )}
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </div>
        </div >
      )}
      {selected && (
        <SaleBill
          isOpen={isModalOpen.saleBill}
          onClose= {() => handleChangeShowModal('saleBill', false)}
          codeSale={selected.salesCode}
          typeSale={selected.typeSale} 
          state={selected.state}
          salePaymentDetail={selected.salePaymentDetails} 
          customerName={selected.customerName ?? ''}
          customerLastName={selected.customerLastName ?? ''}
          dollarChange={selected.dollarChange}
          discount={selected.discount}
          subTotal={selected.subTotal}
          total={selected.total}
          createdAt={selected.createdAt}
          shippingCost={selected.shippingCost}
          returns={selected.return}
          products={selected.products.map(p => ({
            name: p.productName,
            quantity: p.quantity,
            price: Number(p.productPrice),
            discount: Number(p.productDiscount ?? 0)
          }))}
        />
      )}
    </>
  );
}