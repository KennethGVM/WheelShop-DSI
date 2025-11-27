import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import StatusTags from '@/components/status-tags';
import SubHeader from '@/components/sub-header';
import TablePagination from '@/components/table-pagination';
import { showToast } from '@/components/toast';
import { ArrowDownIcon, BranchIcon, CheckIcon, CustomersIcon, RefreshIcon } from '@/icons/icons';
import Container from '@/layout/container'
import FormSection from '@/layout/form-section'
import { currencyFormatter, getPermissions } from '@/lib/function';
import { AdjustmentHistoryProps, StoreHouseProps } from '@/types/types';
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom';
import AccessPage from '../access-page';

interface SupplierProductProps {
  productSupplierId: string;
  productId: string;
  supplierId: string;
  nameSupplier: string;
}

export default function AdjustmentHistory() {
  const { product_id } = useParams();
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('productName');
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentHistoryProps[]>([]);
  const [storeHouse, setStoreHouse] = useState<StoreHouseProps[]>([]);
  const [selectedStoreHouse, setSelectedStoreHouse] = useState<StoreHouseProps>();
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierProductProps>();
  const [supplier, setSupplier] = useState<SupplierProductProps[]>([]);
  const [totalAdjustment, setTotalAdjustment] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;
  const totalPages = Math.ceil(totalAdjustment / pageSize);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canViewAdjustment = getPermissions(permissions, "Inventario", "Ver movimientos")?.canAccess;

  const HEADERS = [
    { label: "Fecha", className: "px-2 py-3 w-[15%]" },
    { label: "Actividad", className: "px-2 py-3 w-[60%]" },
    { label: "Cantidad", className: "px-2 py-3 text-right" },
    { label: "Costo", className: "px-2 py-3 text-right" },
    { label: "Total", className: "px-2 py-3 text-right" },
  ]

  useEffect(() => {
    const handleLoadStoreHouse = async () => {
      const { data } = await supabase.from('storeHouse').select('*');
      setStoreHouse(data as StoreHouseProps[]);

      setSelectedStoreHouse(data?.[0]);
    }

    handleLoadStoreHouse();
  }, [])

  useEffect(() => {
    const handleLoadSupplier = async () => {
      const { data } = await supabase.from('getsupplierbyproduct').select('*').eq('productId', product_id);
      setSupplier(data as SupplierProductProps[]);
      setSelectedSupplier(data?.[0]);
    }

    handleLoadSupplier();
  }, [product_id])

  const handleLoadAdustmentHistory = useCallback(async (currentPage: number) => {
    if (!selectedStoreHouse || !selectedSupplier) return;
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase.from('getadjustmentinventory').select("*", { count: "exact" }).eq('storeHouseId', selectedStoreHouse?.storeHouseId).eq('productSupplierId', selectedSupplier?.productSupplierId).range(from, to);

    if (error) {
      showToast(error.message, false);
      return;
    }

    setAdjustmentHistory(data as AdjustmentHistoryProps[]);
    setTotalAdjustment(count || 0);
  }, [selectedStoreHouse, selectedSupplier]);

  useEffect(() => {
    handleLoadAdustmentHistory(page);
  }, [page, handleLoadAdustmentHistory]);


  const FiltersSelectors = () => (
    <div className='flex md:flex-row flex-col md:items-center md:space-x-4 md:space-y-0 space-y-4 px-4 md:mt-0 mt-4'>
      <Dropdown>
        <DropdownTrigger>
          <Button>
            <div className='flex items-center space-x-2'>
              <CustomersIcon className="md:size-4 size-5 fill-transparent stroke-secondary/80 stroke-[1.5]" />
              <span className='font-medium text-secondary/80 md:text-2xs text-base'>{selectedSupplier?.nameSupplier}</span>
              <ArrowDownIcon className='md:size-4 size-5 stroke-none fill-secondary/80' />
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownContent align='end' className='rounded-2xl space-y-0.5'>
          {supplier.map((supplier, key) => (
            <DropdownItem onClick={() => setSelectedSupplier(supplier)} key={key} className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${supplier.supplierId === selectedSupplier?.supplierId ? 'bg-whiting2' : ''}`}>
              <span>{supplier.nameSupplier}</span>
              {supplier.supplierId === selectedSupplier?.supplierId && <CheckIcon className="md:size-4 size-5 stroke-secondary/80" />}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger>
          <Button>
            <div className='flex items-center space-x-2'>
              <BranchIcon className="md:size-4 size-5 fill-transparent stroke-secondary/80 stroke-[1.5]" />
              <span className='font-medium text-secondary/80 md:text-2xs text-base'>{selectedStoreHouse?.name}</span>
              <ArrowDownIcon className='size-4 stroke-none fill-secondary/80' />
            </div>
          </Button>
        </DropdownTrigger>
        <DropdownContent align='end' className='rounded-2xl space-y-0.5'>
          {storeHouse.map((storeHouse, key) => (
            <DropdownItem onClick={() => setSelectedStoreHouse(storeHouse)} key={key} className={`text-secondary/80 font-medium md:text-2xs text-base justify-between ${storeHouse.storeHouseId === selectedStoreHouse?.storeHouseId ? 'bg-whiting2' : ''}`}>
              <span>{storeHouse.name}</span>
              {storeHouse.storeHouseId === selectedStoreHouse?.storeHouseId && <CheckIcon className="size-4 stroke-secondary/80" />}
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  )

  return (
    <Container>
      {canViewAdjustment ? (
        <>
          <SubHeader className='md:flex-row flex-col items-start' backUrl={`/products/add/${product_id}`} title={productName ?? ''}
            children={<FiltersSelectors />}
          />
          <FormSection name='Historial de ajustes' classNameLabel='md:mx-0 mx-4' className={`${adjustmentHistory.length > 0 ? 'md:rounded-b-none' : ''} md:pb-0 md:px-4 px-0`}>
            {adjustmentHistory && adjustmentHistory.length > 0 ? (
              <>
                <div className="relative overflow-x-auto my-2 px-px md:block hidden">
                  <table className="w-full text-left">
                    <thead className="text-primary px-4 font-semibold text-2xs border-b border-gray-300">
                      <tr>
                        {HEADERS.map((th, index) => (
                          <th key={index} className={th.className}>
                            {th.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentHistory && adjustmentHistory.map(({ createdAt, typeMovement, typeMovementName, cost, details, quantity, total }, key) => (
                        <tr
                          key={key}
                          className={`text-2xs font-medium text-secondary/80 ${key !== adjustmentHistory.length - 1 ? 'border-b border-gray-300' : 'border-0'}`}
                        >
                          <td className="px-2">
                            {`${new Date(createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} a las ${new Date().toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true })}`}
                          </td>
                          <td className="px-2 py-2">
                            <div className='flex flex-col space-y-1'>
                              {(typeMovement === 0 || typeMovement === 1 || typeMovement === 5 || typeMovement === 6) && (
                                <span>
                                  {typeMovementName} creada (
                                  <Link
                                    to={typeMovement === 0 ? `/purchases/receive/${details.purchaseOrderId}/` : `/sales/add/${details.saleId}/`}
                                    className='text-blueprimary underline'
                                  >
                                    {typeMovement === 0 ? details.codePurchaseOrder : details.salesCode}
                                  </Link>
                                  )
                                </span>
                              )}

                              {typeMovement === 2 && (
                                <span>
                                  Corrección de inventario (
                                  <span className='font-semibold'>{details.reason}</span>
                                  )
                                </span>
                              )}

                              {(typeMovement === 3 || typeMovement === 4) && (
                                <div className='flex items-center space-x-2'>
                                  <span>
                                    {typeMovementName} (
                                    <Link
                                      to={`/transfers/add/${details.transferId}/`}
                                      className='text-blueprimary underline'
                                    >
                                      {details.codeTransfer}
                                    </Link>
                                    )
                                  </span>

                                  <StatusTags className='w-fit' status={typeMovement === 4} text={typeMovement === 4 ? 'Entrada' : 'Salida'} />
                                </div>
                              )}
                            </div>

                          </td>
                          <td className="px-2 py-2 text-right">{typeMovement !== 3 ? quantity : quantity * -1}</td>
                          <td className="px-2 py-2 text-right">{currencyFormatter(cost)}</td>
                          <td className="px-2 py-2 text-right">{currencyFormatter(total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className='space-y-2 md:hidden block'>
                  {adjustmentHistory.map(({ total, typeMovement, typeMovementName, details, createdAt, cost, quantity }, index) => (
                    <div key={index} className={`${index !== adjustmentHistory.length - 1 ? 'border-b border-gray-300' : 'border-0'} px-4 py-2`}>
                      <time className='text-2xs mb-1 inline-block font-medium text-secondary/80'>{new Date(createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      }).replace('.', '')}
                      </time>

                      <div className='flex items-center justify-between'>
                        <div className='flex flex-col space-y-1'>
                          {(typeMovement === 0 || typeMovement === 1 || typeMovement === 5 || typeMovement === 6) && (
                            <span className='font-medium text-secondary text-base'>
                              {typeMovementName} creada (
                              <Link
                                to={typeMovement === 0 ? `/purchases/receive/${details.purchaseOrderId}/` : `/sales/add/${details.saleId}/`}
                                className='text-blueprimary underline'
                              >
                                {typeMovement === 0 ? details.codePurchaseOrder : details.salesCode}
                              </Link>
                              )
                            </span>
                          )}

                          {typeMovement === 2 && (
                            <span className='font-medium text-secondary text-base'>
                              Corrección de inventario (
                              <span className='font-semibold'>{details.reason}</span>
                              )
                            </span>
                          )}

                          {(typeMovement === 3 || typeMovement === 4) && (
                            <div className='flex items-center space-x-2'>
                              <span className='font-medium text-secondary text-base'>
                                {typeMovementName} (
                                <Link
                                  to={`/transfers/add/${details.transferId}/`}
                                  className='text-blueprimary underline'
                                >
                                  {details.codeTransfer}
                                </Link>
                                )
                              </span>

                              <StatusTags className='w-fit' status={typeMovement === 4} text={typeMovement === 4 ? 'Entrada' : 'Salida'} />
                            </div>
                          )}
                        </div>

                        <span className='font-medium text-secondary text-base'>{currencyFormatter(total)}</span>
                      </div>

                      <div className='flex mt-2 items-center justify-between'>
                        <span className='font-medium text-secondary/80 text-base'>Cantidad</span>
                        <span className='font-medium text-secondary/80 text-base'>{quantity}</span>
                      </div>
                      <div className='flex mt-2 items-center justify-between'>
                        <span className='font-medium text-secondary/80 text-base'>Costo</span>
                        <span className='font-medium text-secondary/80 text-base'>{currencyFormatter(cost)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className='flex items-center justify-center flex-col pb-20'>
                <RefreshIcon className='size-40 stroke-none' />
                <span className='font-medium text-primary text-sm'>No se han realizado ajustes en el inventario en la sucursal {selectedStoreHouse?.name} con el proveedor {selectedSupplier?.nameSupplier}</span>
                <p className='font-medium text-secondary/80 mt-2 text-2xs'>Intenta cambiar la sucursal seleccionada o el proveedor seleccionado</p>
              </div>
            )}
          </FormSection>
          <TablePagination className='border-t-0 border-x border-b border-gray-300' totalPages={totalPages} page={page} setPage={setPage} />
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  )
}


