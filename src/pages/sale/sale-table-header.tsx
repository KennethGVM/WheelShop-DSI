import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { SaleProps } from '@/types/types';
import { getPermissions } from '@/lib/function';
import { useRolePermission } from '@/api/permissions-provider';
import { useState } from 'react';
import SaleBill from './sale-bill';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
};

interface SaleTableHeaderProps {
  sales: SaleProps[];
  selectedSaleIds: string[];
  selectAll: boolean;
  handleSelectAll: (checked: boolean) => void;
  handleEditSale: (saleId: string) => void;
  isScrolled: boolean;
  HEADERS: HeaderProps[];
}

export default function SaleTableHeader({ handleSelectAll, isScrolled, sales, selectedSaleIds, selectAll, HEADERS, handleEditSale }: SaleTableHeaderProps) {
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const navigate = useNavigate();

  const canCreateSale = getPermissions(permissions, "Pedidos", "Crear")?.canAccess;

  const [isModalOpen, setIsModalOpen] = useState({ saleBill: false });

  const handleChangeShowModal = (name: keyof typeof isModalOpen, value: boolean) => {
    setIsModalOpen(prev => ({ ...prev, [name]: value }));
  };
  const selected = sales.find(s => s.saleId === selectedSaleIds[0]);

  return (
    <>
      <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
        {sales.length > 0 &&
          <tr className={`${selectedSaleIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
            <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedSaleIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
              <div className='flex items-center space-x-2'>
                <CheckBox
                  initialValue={selectAll}
                  onChange={(value) => handleSelectAll(value)}
                />
                <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                  {selectedSaleIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedSaleIds.length}</span>}
                </div>
                <span className={`text-secondary/80 font-semibold text-xs ${selectedSaleIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
              </div>
            </th>

            {HEADERS.slice(1).map(({ title, isNumeric }, index) => (
              <th
                key={index}
                scope="col"
                className={`${selectedSaleIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 px-4 font-semibold text-xs ${isNumeric ? 'text-right' : 'text-left'}`}
              >
                {title}
              </th>
            ))}


            {selectedSaleIds.length > 0 &&
              <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
                <Button
                  onClick={() => handleChangeShowModal('saleBill', true)}
                  name="Imprimir"
                  styleButton="primary"
                  className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                />

                {canCreateSale && <Button onClick={() => handleEditSale(selectedSaleIds[0])} name='Ver venta' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
                {selected?.typeSale === 0 && selected?.state !== 0 && (
                  <Button
                    onClick={() => navigate(`/sales/payment/add/${selectedSaleIds[0]}`)}
                    name={selected?.state === 1 ? 'Ver Abonos' : selected?.state === 2 ? 'Abonar' : ''}
                    styleButton="primary"
                    className="px-2 py-1.5 text-xs font-semibold text-secondary/80"
                  />
                )}
              </div>

            }
          </tr>
        }
      </thead >
      {selected && (
        <SaleBill
          isOpen={isModalOpen.saleBill}
          onClose={() => handleChangeShowModal('saleBill', false)}
          codeSale={selected.salesCode ?? ''}
          salePaymentDetail={selected.salePaymentDetails}
          customerName={selected.customerName ?? ''}
          customerLastName={selected.customerLastName ?? ''}
          dollarChange={selected.dollarChange}
          discount={selected.discount}
          subTotal={selected.subTotal}
          total={selected.total}
          typeSale={selected.typeSale}
          state={selected.state}
          createdAt={selected.createdAt}
          shippingCost={selected.shippingCost}
          returns={selected.return}
          products={selected.products.map(p => ({ name: p.productName, quantity: p.quantity, price: Number(p.productPrice), discount: Number(p.productDiscount ?? 0) }))} />
      )}
    </>
  )
}
