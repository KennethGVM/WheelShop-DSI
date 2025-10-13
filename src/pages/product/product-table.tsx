import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { ProductFilter, ProductProps } from '@/types/types';
import { ArchiveIcon, ArrowDownIcon, CheckIcon, DeleteIcon, SearchIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom';
import ProductTableHeader from './product-table-header';
import ProductTableRow from './product-table-row';
import TableSkeleton from '../../components/table-skeleton';
import CheckBox from '@/components/form/check-box';
import StatusTags from '@/components/status-tags';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/form/dropdown';
import Button from '@/components/form/button';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';
import { showToast } from '@/components/toast';
import Modal from '@/components/modal';
import { supabase } from '@/api/supabase-client';
import ToolTip from '@/components/tool-tip';

interface ProductTableProps {
  products: ProductProps[];
  filter: ProductFilter;
  setProducts: Dispatch<SetStateAction<ProductProps[]>>;
  isLoading: boolean;
}

export default function ProductTable({ filter, products, setProducts, isLoading }: ProductTableProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalAction, setModalAction] = useState<'activate' | 'deactivate' | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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

  const handleUpdateProductState = async (newState: boolean) => {
    const { error } = await supabase
      .from('product')
      .update({ state: newState })
      .in('productId', selectedProductIds);

    if (error) {
      showToast(error.message, false);
      return;
    }

    const newProducts = products.map(product =>
      selectedProductIds.includes(product.productId)
        ? { ...product, state: newState }
        : product
    );

    showToast(`Estado establecido como ${newState ? 'activo' : 'inactivo'}`, true);
    setIsModalOpen(false);
    setProducts(newProducts);
    setSelectedProductIds([]);
  };

  const HEADERS = useMemo(() => {
    if (filter === "Llantas") {
      return [
        { title: "Producto", isNumeric: false },
        { title: "Estado", isNumeric: false },
        { title: "Inventario", isNumeric: false },
        { title: "Tipo de vehículo", isNumeric: false },
        { title: "Marca", isNumeric: false },
        { title: "Numeración", isNumeric: false },
      ];
    } else if (filter === "Aceites") {
      return [
        { title: "Producto", isNumeric: false },
        { title: "Estado", isNumeric: false },
        { title: "Inventario", isNumeric: false },
        { title: "Marca", isNumeric: false },
        { title: "Tipo de aceite", isNumeric: false },
        { title: "Numeración", isNumeric: false },
      ];
    } else {
      return [
        { title: "Producto", isNumeric: false },
        { title: "Estado", isNumeric: false },
        { title: "Descripción", isNumeric: false },
        { title: "Inventario", isNumeric: false },
      ];
    }
  }, [filter]);

  const handleEditProduct = (productId: string) => {
    const selectedProduct = products.find(p => p.productId === productId);
    if (selectedProduct) {
      navigate(`/products/add/${productId}`);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedProductIds, productId];
    } else {
      newSelectedIds = selectedProductIds.filter(id => id !== productId);
    }

    setSelectedProductIds(newSelectedIds);

    if (newSelectedIds.length !== products.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === products.length) {
      setSelectAll(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = products.map(product => product.productId);
      setSelectedProductIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedProductIds([]);
      setSelectAll(false);
    }
  };

  const selectedStates = selectedProductIds.map(id => products.find(product => product.productId === id)?.state);
  const allSelectedActive = selectedStates.every(state => state === true);
  const allSelectedInactive = selectedStates.every(state => state === false);
  const hasDifferentStates = !allSelectedActive && !allSelectedInactive;

  return (
    <>
      <div ref={scrollContainerRef} className='relative overflow-x-auto sm:block hidden'>
        <table className="w-full min-w-[1200px] bg-white">
          <ProductTableHeader
            products={products}
            allSelectedActive={allSelectedActive}
            allSelectedInactive={allSelectedInactive}
            hasDifferentStates={hasDifferentStates}
            selectedProductIds={selectedProductIds}
            setIsModalOpen={setIsModalOpen}
            setModalAction={setModalAction}
            selectAll={selectAll}
            handleEditProduct={handleEditProduct}
            isScrolled={isScrolled}
            HEADERS={HEADERS}
            handleSelectAll={handleSelectAll}
          />
          {isLoading ? (
            <TableSkeleton columns={HEADERS.length + 1} />
          ) : (
            <tbody>
              {products && products.length > 0 ? (
                products.map((product, key) => (
                  <ProductTableRow
                    key={key}
                    isScrolled={isScrolled}
                    filter={filter}
                    handleEditProduct={handleEditProduct}
                    products={products}
                    product={product}
                    selectedProductIds={selectedProductIds}
                    handleSelectProduct={handleSelectProduct}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={HEADERS.length + 1} className="text-center text-secondary/80">
                    <div className='flex flex-col items-center justify-center space-y-3 py-4'>
                      <SearchIcon className='size-16 fill-[#8c9196]' />
                      <p className='text-primary font-semibold text-xl'>No se encontró ningún recurso de productos</p>
                      <p className='text-2xs font-medium text-secondary/80'>Prueba a cambiar los filtros o el término de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      <div className={`bg-white ${products.length > 0 ? 'border-t' : ''} sm:hidden block border-gray-300`}>
        {products && products.length > 0 ? (
          products.map((product, index) => (
            <div key={product.productId} className={`flex space-x-1 items-start px-4 py-3 ${index !== products.length - 1 ? 'border-b' : ''}`}>
              <CheckBox
                initialValue={selectedProductIds.includes(product.productId)}
                onChange={(value) => handleSelectProduct(product.productId, value)}
              />
              <div className='flex flex-col space-y-1'>
                <span data-tooltip-id={`tooltip-${product.productId}`} className="text-secondary font-medium text-base truncate max-w-[200px] block">
                  {product.name}
                </span>
                <ToolTip id={`tooltip-${product.productId}`} title={product.name} openOnClick={true} />
                <StatusTags className='w-fit text-base py-0 rounded-lg' status={product.state} text={product.state ? 'Activo' : 'Inactivo'} />
                <Dropdown>
                  <DropdownTrigger>
                    <button className="flex items-center space-x-1">
                      <span className={`font-medium text-base ${product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) < 10 ? 'text-red-900' : 'text-secondary/80'}`}>{product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0)} en stock</span>
                      <ArrowDownIcon className={`size-4 stroke-none ${product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) < 10 ? 'fill-red-900' : 'fill-secondary/80'}`} />
                    </button>
                  </DropdownTrigger>
                  {product.storeHouseInventory.reduce((acc, storeHouse) => acc + storeHouse.stock, 0) > 0 &&
                    <DropdownContent align="start" className="rounded-2xl">
                      {product.storeHouseInventory.map(({ stock, storeHouse }, index) => (
                        <>
                          <DropdownItem className="justify-between w-[300px] hover:bg-transparent">
                            <div className="flex items-center space-x-3">
                              <div className="size-2.5 rounded-[3px] border border-gray-400" />
                              <span className='text-base'>{storeHouse}</span>
                            </div>
                            <span className='text-base'>{stock}</span>
                          </DropdownItem>

                          {index !== product.storeHouseInventory.length - 1 && <DropdownSeparator />}
                        </>
                      ))}
                    </DropdownContent>
                  }
                </Dropdown>
                {filter === "Llantas" &&
                  <>
                    <span data-tooltip-id={`wheel-tooltip-${product.productId}`} className='text-secondary/80 font-medium text-base truncate max-w-[300px] block'>{product.nameTypeVehicle} • {product.brandName} • {product.numeration}</span>
                    <ToolTip id={`wheel-tooltip-${product.productId}`} title={product.numeration} openOnClick={true} />
                  </>
                }
                {filter === "Aceites" &&
                  <>
                    <span data-tooltip-id={`oil-tooltip-${product.productId}`} className='text-secondary/80 font-medium text-base truncate max-w-[300px] block'>{product.brandOilName} • {product.numerationOil} • {product.isDiesel ? "Diesel" : "Gasolina"}</span>
                    <ToolTip id={`oil-tooltip-${product.productId}`} title={product.numerationOil} openOnClick={true} />
                  </>
                }
              </div>
            </div>
          ))
        ) : (
          <div className='flex flex-col items-center justify-center space-y-3 py-4'>
            <SearchIcon className='size-16 fill-[#8c9196]' />
            <p className='text-primary font-semibold text-xl text-center'>No se encontró ningún recurso de productos</p>
            <p className='text-2xs font-medium text-secondary/80 text-center'>Prueba a cambiar los filtros o el término de búsqueda</p>
          </div>
        )}
      </div>

      {selectedProductIds.length > 0 && (
        <div className="fixed sm:hidden block bottom-4 left-4 right-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#F7F7F7] border border-gray-300 rounded-lg shadow-lg px-4 py-2">
              <div className="flex items-center justify-between">
                <Dropdown closeToClickOption>
                  <DropdownTrigger>
                    <Button className="flex items-center space-x-1 text-primary text-sm font-medium border border-gray-300 px-2 py-1 bg-white">
                      <span>{selectedProductIds.length} seleccionado(s)</span>
                      <ArrowDownIcon className='size-4 stroke-none fill-primary' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent align="start" position='top' className="rounded-xl px-0 py-0">
                    {!selectAll && <DropdownItem onClick={() => handleSelectAll(true)} className='mx-0 rounded-b-none text-base py-3 px-4'>Seleccionar los {products.length} en la página</DropdownItem>}
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
                    {getPermissions(permissions, "Productos", "Crear y editar")?.canAccess && (
                      <DropdownItem onClick={() => handleEditProduct(selectedProductIds[0])} className='space-x-2 mx-0 rounded-b-none text-base py-3 px-4'>
                        <ArchiveIcon className='size-5' />
                        <span>Editar productos</span>
                      </DropdownItem>
                    )}
                    {getPermissions(permissions, "Productos", "Eliminar")?.canAccess && (allSelectedActive || hasDifferentStates) &&
                      <DropdownItem onClick={() => { setModalAction('deactivate'); setIsModalOpen(true); }} className='hover:bg-[#fec1c7] space-x-2 text-base py-3 px-4 mx-0 rounded-none text-red-900'>
                        <DeleteIcon className='size-5 fill-[#8e0b21]' />
                        <span>Establecer como inactivos</span>
                      </DropdownItem>
                    }
                    {getPermissions(permissions, "Productos", "Crear y editar")?.canAccess && (allSelectedInactive || hasDifferentStates) && (
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
      {isModalOpen && (
        <Modal
          classNameModal='md:w-[1000px]'
          principalButtonName={modalAction === 'activate' ? 'Establecer como activo' : 'Establecer como inactivos'}
          onClose={() => setIsModalOpen(false)}
          onClickSave={() => handleUpdateProductState(modalAction === 'activate')}
          name={
            modalAction === 'activate'
              ? `¿Guardar ${selectedProductIds.length} producto(s) como activo(s)?`
              : `¿Guardar ${selectedProductIds.length} productos como inactivos?`
          }
        >
          <p className='font-normal py-4 text-secondary/80 md:text-sm text-base px-4'>
            {modalAction === 'activate'
              ? 'Activar los productos hará que estén disponibles nuevamente en todos los procesos del sistema.'
              : 'Guardar productos como inactivos los ocultará de todos los procesos del sistema.'}
          </p>
        </Modal>
      )}
    </>
  );
}
