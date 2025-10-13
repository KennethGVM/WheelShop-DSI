import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { ProductProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
};

interface ProductTableHeaderProps {
  products: ProductProps[];
  selectedProductIds: string[];
  handleEditProduct: (productId: string) => void;
  isScrolled: boolean;
  selectAll: boolean;
  HEADERS: HeaderProps[];
  handleSelectAll: (checked: boolean) => void;
  allSelectedActive: boolean;
  allSelectedInactive: boolean;
  hasDifferentStates: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  setModalAction: Dispatch<SetStateAction<'activate' | 'deactivate' | null>>;
}

export default function ProductTableHeader({ allSelectedActive, allSelectedInactive, hasDifferentStates, isScrolled, handleSelectAll, products, setIsModalOpen, setModalAction, selectedProductIds, selectAll, HEADERS, handleEditProduct }: ProductTableHeaderProps) {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;

  return (
    <thead className="text-2xs sticky top-0 z-20 text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {products.length > 0 &&
        <tr className={`${selectedProductIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedProductIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedProductIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedProductIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedProductIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>

          {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
            <th
              key={index}
              scope="col"
              className={`${selectedProductIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? 'text-right' : 'text-left'}`}
            >
              {title}
            </th>
          ))}

          {selectedProductIds.length > 0 && (
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {getPermissions(permissions, "Productos", "Crear y editar")?.canAccess &&
                <Button
                  onClick={() => handleEditProduct(selectedProductIds[0])}
                  name='Editar productos'
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                />
              }

              {getPermissions(permissions, "Productos", "Eliminar")?.canAccess && (
                <>
                  {hasDifferentStates && (
                    <>
                      <Button
                        name='Establecer como activo'
                        styleButton="primary"
                        className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                        onClick={() => {
                          setModalAction('activate');
                          setIsModalOpen(true);
                        }}
                      />
                      <Button
                        name='Establecer como inactivos'
                        styleButton="primary"
                        className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                        onClick={() => {
                          setModalAction('deactivate');
                          setIsModalOpen(true);
                        }}
                      />
                    </>
                  )}

                  {allSelectedActive && (
                    <Button
                      name='Establecer como inactivos'
                      styleButton="primary"
                      className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                      onClick={() => {
                        setModalAction('deactivate');
                        setIsModalOpen(true);
                      }}
                    />
                  )}

                  {allSelectedInactive && (
                    <Button
                      name='Establecer como activo'
                      styleButton="primary"
                      className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                      onClick={() => {
                        setModalAction('activate');
                        setIsModalOpen(true);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </tr>
      }
    </thead >
  )
}
