import { useEffect, useRef, useState } from 'react';
import { PurchaseProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/table-skeleton';
import CheckBox from '@/components/form/check-box';
import { currencyFormatter, getPermissions } from '@/lib/function';
import StatusTags from '@/components/status-tags';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import { useRolePermission } from '@/api/permissions-provider';
import PurchaseTableHeader from './purchase-table-header';
import PurchaseTableRow from './purchase-table-row';

interface PurchaseTableProps {
  purchases: PurchaseProps[];
  isLoading: boolean;
}

export default function PurchaseTable({ purchases, isLoading }: PurchaseTableProps) {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedPurchaseIds, setSelectedPurchaseIds] = useState<PurchaseProps[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
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
    { title: "Orden de compra", isNumeric: false, className: 'sticky' },
    { title: "Proveedor", isNumeric: false },
    { title: "Destino", isNumeric: false },
    { title: "Tipo de pago", isNumeric: false },
    { title: "Estado", isNumeric: false },
    { title: "Descuento", isNumeric: true },
    { title: "Total", isNumeric: true },
    { title: "Llegada esperada", isNumeric: false },
  ];

  const handleEditPurchase = (purchase: PurchaseProps) => {
    if (purchase.state === 0)
      navigate(`/purchases/add/${purchase.purchaseOrderId}`);
    else
      navigate(`/purchases/receive/${purchase.purchaseOrderId}`);
  };

  const handleSelectPurchase = (purchaseId: PurchaseProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedPurchaseIds, purchaseId];
    } else {
      newSelectedIds = selectedPurchaseIds.filter((id) => id.purchaseOrderId !== purchaseId.purchaseOrderId);
    }

    setSelectedPurchaseIds(newSelectedIds);

    if (newSelectedIds.length !== purchases.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === purchases.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = purchases.map(purchase => purchase);
      setSelectedPurchaseIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedPurchaseIds([]);
      setSelectAll(false);
    }
  };

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <PurchaseTableHeader
            handleSelectAll={handleSelectAll}
            isScrolled={isScrolled}
            purchases={purchases}
            selectedPurchaseIds={selectedPurchaseIds}
            selectAll={selectAll}
            handleEditPurchase={handleEditPurchase}
            HEADERS={HEADERS}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {purchases && purchases.length > 0 ? (
                purchases.map((purchase, key) => (
                  <PurchaseTableRow
                    key={key}
                    isScrolled={isScrolled}
                    handleEditPurchase={handleEditPurchase}
                    purchases={purchases}
                    purchase={purchase}
                    selectedPurchaseIds={selectedPurchaseIds}
                    handleSelectPurchase={handleSelectPurchase}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de orden de compras</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${purchases.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {purchases && purchases.length > 0 ? (
          purchases.map((purchase, index) => (
            <div className={`flex items-start justify-between ${index !== purchases.length - 1 ? 'border-b' : ''}`}>
              <div key={purchase.purchaseOrderId} className='flex space-x-1 items-start px-4 py-3'>
                <CheckBox
                  initialValue={selectedPurchaseIds.includes(purchase)}
                  onChange={(value) => handleSelectPurchase(purchase, value)}
                />
                <div className='flex flex-col space-y-1'>
                  <span className='text-secondary font-medium text-base'>{purchase.codePurchaseOrder}</span>
                  <span className='text-secondary/80 font-medium text-sm'>{purchase.nameSupplier}</span>
                  <span className='text-secondary/80 font-medium text-sm'>{purchase.namestorehouse}</span>
                </div>
              </div>

              <div className='px-4 py-3 flex flex-col space-y-1 items-end'>
                <StatusTags className='px-2 py-1 w-fit' status={purchase.purchaseType === 0 ? true : false} text={purchase.purchaseType === 0 ? 'Contado' : purchase.purchaseType === 1 ? 'Credito' : 'Pagado'} color={purchase.purchaseType === 0 ? 'bg-[#affebf]' : purchase.purchaseType === 1 ? 'bg-[#ffabab]' : 'bg-[#e9e9e9]'} textColor={purchase.purchaseType === 0 ? 'text-[#014b40]' : purchase.purchaseType === 1 ? 'text-[#d10000]' : 'text-[#656161]'} />
                <span className='text-secondary/80 font-medium text-sm'>{currencyFormatter(purchase.total, purchase.currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de orden de compras</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedPurchaseIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedPurchaseIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {purchases.length} en la página</DropdownItem>}
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
                    {getPermissions(permissions, 'Ordenes de compras', 'Editar ordenes de compra')?.canAccess && (
                      <DropdownItem onClick={() => handleEditPurchase(selectedPurchaseIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                        <ArchiveIcon className='size-5' />
                        <span>Editar orden de compra</span>
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