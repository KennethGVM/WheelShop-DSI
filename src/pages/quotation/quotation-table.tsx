import { useEffect, useRef, useState } from 'react';
import { newProduct, QuotationProductProps, QuotationProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, GeneralIcon, SearchIcon, UploadIcon } from '@/icons/icons';
import TableSkeleton from '../../components/table-skeleton';
import QuotationTableHeader from './quotation-table-header';
import QuotationTableRow from './quotation-table-row';
import { useNavigate } from 'react-router-dom';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import CheckBox from '@/components/form/check-box';
import { currencyFormatter, getPermissions } from '@/lib/function';
import StatusTags from '@/components/status-tags';
import { useRolePermission } from '@/api/permissions-provider';
import QuotationBill from './quotation-bill';

interface QuotationTableProps {
  quotations: QuotationProps[];
  isLoading: boolean;
}

export default function QuotationTable({ quotations, isLoading }: QuotationTableProps) {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedQuotationIds, setSelectedQuotationIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateQuotation = getPermissions(permissions, "Cotizaciones", "Crear y editar")?.canAccess;
  const [isModalOpen, setIsModalOpen] = useState({ quotationBill: false });
  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen(prev => ({ ...prev, [name]: value }));
  };

  const selected = quotations.find(q => q.quotationId === selectedQuotationIds[0]);

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
    { title: "Codigo de cotización", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Fecha", isNumeric: false },
    { title: "Usuario", isNumeric: false },
    { title: "Cliente", isNumeric: false },
    { title: "Total", isNumeric: true },
    { title: "Articulos", isNumeric: false },
    { title: "Forma de entrega", isNumeric: false },
  ]

  const handleViewQuotation = (quotationId: string) => {
    navigate(`/quotations/add/${quotationId}`);
  };

  const handleSelectQuotation = (saleId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedQuotationIds, saleId];
    } else {
      newSelectedIds = selectedQuotationIds.filter(id => id !== saleId);
    }

    setSelectedQuotationIds(newSelectedIds);

    if (newSelectedIds.length !== quotations.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === quotations.length) {
      setSelectAll(true);
    }
  };

  function groupProductsByStorehouse(
    products: QuotationProductProps[],
    newProducts: newProduct[]
  ) {
    const grouped = products.reduce((acc, product) => {
      const key = product.storeHouseId;
      if (!acc[key]) {
        acc[key] = {
          storeHouse: product.storeHouseName,
          items: []
        };
      }
      acc[key].items.push({
        productName: product.productName,
        quantity: product.quantity
      });
      return acc;
    }, {} as Record<string, {
      storeHouse: string;
      items: {
        productName: string;
        quantity: number;
      }[];
    }>);

    // Agregar productos personalizados como un grupo separado
    if (newProducts && newProducts.length > 0) {
      grouped["custom"] = {
        storeHouse: "Personalizados",
        items: newProducts.map((product) => ({
          productName: product.productName,
          quantity: product.quantity
        }))
      };
    }

    return Object.values(grouped);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = quotations.map(quotation => quotation.quotationId);
      setSelectedQuotationIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedQuotationIds([]);
      setSelectAll(false);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <QuotationTableHeader
            quotations={quotations}
            selectedQuotationIds={selectedQuotationIds}
            selectAll={selectAll}
            isScrolled={isScrolled}
            handleSelectAll={handleSelectAll}
            HEADERS={HEADERS}
            handleViewQuotation={handleViewQuotation}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {quotations && quotations.length > 0 ? (
                quotations.map((quotation, key) => (
                  <QuotationTableRow
                    key={key}
                    isScrolled={isScrolled}
                    quotations={quotations}
                    quotation={quotation}
                    selectedQuotationIds={selectedQuotationIds}
                    handleViewQuotation={handleViewQuotation}
                    handleSelectQuotation={handleSelectQuotation}
                    groupProductsByStorehouse={groupProductsByStorehouse}
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

      <div className={`bg-white ${quotations.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {quotations && quotations.length > 0 ? (
          quotations.map((quotation, index) => {
            const products = quotation.products ?? [];
            const newProducts = quotation.newProducts ?? [];

            const hasProducts = products.length > 0 || newProducts.length > 0;

            const totalProductCount =
              products.reduce((acc, p) => acc + (p.quantity || 0), 0) +
              newProducts.reduce((acc, p) => acc + (p.quantity || 0), 0);

            return (
              <div key={quotation.quotationId || index} className={`px-4 py-2 ${index !== quotations.length - 1 ? 'border-b' : ''}`}>
                <div className='flex items-start w-full space-x-1'>
                  <CheckBox
                    initialValue={selectedQuotationIds.includes(quotation.quotationId)}
                    onChange={(value) => handleSelectQuotation(quotation.quotationId, value)}
                  />
                  <div className='flex flex-col w-full'>
                    <span className='text-2xs font-semibold text-secondary/80'>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')} a las {new Date(quotation.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace('.', '')}</span>
                    <div className='flex mb-1 items-center mt-1 justify-between'>
                      <span className='text-secondary font-medium text-base'>{quotation.quotationCode}</span>
                      <span className='text-secondary/80 font-[550] text-[15px]'>{currencyFormatter(quotation.total)}</span>
                    </div>
                    {quotation.state === true ? (
                      <StatusTags
                        className='px-1 py-0.5 w-fit'
                        status={true}
                        text="Completada"
                        color="bg-[#affebf]"
                        textColor="text-[#014b40]"
                      />
                    ) : (
                      <StatusTags
                        status={false}
                        className='px-1 py-0.5 w-fit'
                        text="Pendiente"
                        color="bg-[#ffabab]"
                        textColor="text-[#d10000]"
                      />
                    )}
                    <Dropdown>
                      <DropdownTrigger>
                        <button className="flex mt-2 items-center space-x-1">
                          <span className='text-[15px] font-medium text-secondary/80'>
                            {quotation.customerName} • {totalProductCount} artículo{totalProductCount === 1 ? '' : 's'}
                          </span>
                          <ArrowDownIcon className="size-5 stroke-none fill-secondary/80" />
                        </button>
                      </DropdownTrigger>

                      {hasProducts && (
                        <DropdownContent align="end" className="rounded-2xl w-[300px] p-2 space-y-2">
                          {groupProductsByStorehouse(products, newProducts).map((group, index) => (
                            <div key={index} className="rounded-xl border bg-muted p-3">
                              <div className="flex items-center gap-2 md:text-2xs text-base px-2.5 py-1 rounded-full bg-[#F3F3F3]">
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
                                  <span className="md:text-2xs text-base">x {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </DropdownContent>
                      )}
                    </Dropdown>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de ventas</p>
            <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedQuotationIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedQuotationIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {quotations.length} en la página</DropdownItem>}
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
                    {canCreateQuotation && (
                      <>
                        <DropdownItem onClick={() => handleChangeShowModal('quotationBill', true)} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                          <UploadIcon className='size-5' />
                          <span>Imprimir PDF</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => handleViewQuotation(selectedQuotationIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                          <ArchiveIcon className='size-5' />
                          <span>Ver cotización</span>
                        </DropdownItem>
                      </>
                    )}
                  </DropdownContent>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      )}
      {selected && (
        <QuotationBill
          quotationData={{
            quotationNumber: selected.quotationCode,
            date: new Date(selected.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }),
            isOpen: isModalOpen.quotationBill,
            onClose: () => handleChangeShowModal('quotationBill', false),
            customerName: selected.customerName ?? '',
            customerLastName: selected.customerName ?? '',
            customerRuc: selected.dni,
            customerPhone: selected.phone,
            customerEmail: selected.email,
            products: [
              ...(selected?.products?.map(p => ({
                name: p.productName,
                quantity: p.quantity,
                productId: p.productId,
                cost: Number(p.productPrice),
                discount: Number(p.productDiscount ?? 0)
              })) ?? []),
              ...(selected?.newProducts?.map(np => ({
                name: np.productName,
                quantity: np.quantity,
                productId: np.productId,
                cost: Number(np.price),
                discount: Number(np.discount ?? 0)
              })) ?? [])
            ],
            observations: selected.observation,
            shippingCost: selected.shippingCost,
            subTotal: selected.subTotal,
            total: selected.total,
            discount: selected.discount,
          }}
        />
      )}
    </>
  );
}
