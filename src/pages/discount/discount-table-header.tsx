import CheckBox from '@/components/form/check-box';
import Button from '@/components/form/button';
import { DiscountProps } from '@/types/types';
import { Dispatch, SetStateAction, useState } from 'react';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';
import Modal from '@/components/modal';
import { showToast } from '@/components/toast';
import { supabase } from '@/api/supabase-client';

interface HeaderProps {
  title: string;
  isNumeric: boolean;
  className?: string;
};

interface DiscountTableHeaderProps {
  discounts: DiscountProps[];
  setDiscounts: Dispatch<SetStateAction<DiscountProps[]>>;
  selectedDiscountIds: DiscountProps[];
  selectAll: boolean;
  setSelectAll: Dispatch<SetStateAction<boolean>>;
  setSelectedDiscountIds: Dispatch<SetStateAction<DiscountProps[]>>;
  handleEditDiscount: (discountId: DiscountProps) => void;
  HEADERS: HeaderProps[];
  isScrolled: boolean;
}

export default function DiscountTableHeader({ setDiscounts, isScrolled, setSelectAll, setSelectedDiscountIds, selectedDiscountIds, selectAll, HEADERS, discounts, handleEditDiscount }: DiscountTableHeaderProps) {
  const { userPermissions } = useRolePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const permissions = userPermissions?.permissions || null;
  const canCreateDiscount = getPermissions(permissions, "Descuentos", "Crear y editar")?.canAccess;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = discounts.map(discount => discount);
      setSelectedDiscountIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedDiscountIds([]);
      setSelectAll(false);
    }
  };

  const handleUpdateDiscountState = async (newState: boolean) => {
    const { error } = await supabase
      .from('discount')
      .update({ state: newState })
      .in('discountId', selectedDiscountIds.map(discount => discount.discountId));

    if (error) {
      showToast(error.message, false);
      return;
    }

    const newProducts = discounts.map(discount =>
      selectedDiscountIds.includes(discount)
        ? { ...discount, state: newState }
        : discount
    );

    showToast(`Estado establecido como inactivo`, true);
    setIsModalOpen(false);
    setDiscounts(newProducts);
    setSelectedDiscountIds([]);
  };

  return (
    <thead className="text-2xs text-secondary/80 bg-[#f7f7f7] border-y border-gray-300">
      {discounts && discounts.length > 0 &&

        <tr className={`${selectedDiscountIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} relative`}>
          <th className={`px-2 py-2 sticky inset-y-0 h-full left-0 z-10 ${selectedDiscountIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} before:content-[''] before:absolute before:top-0 before:right-0 before:h-full before:w-[1px] before:bg-gray-300 before:transition-opacity ${isScrolled ? 'before:opacity-100' : 'before:opacity-0'} relative px-2 py-2.5`}>
            <div className='flex items-center space-x-2'>
              <CheckBox
                initialValue={selectAll}
                onChange={(value) => handleSelectAll(value)}
              />
              <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                {selectedDiscountIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedDiscountIds.length}</span>}
              </div>
              <span className={`text-secondary/80 font-semibold text-xs ${selectedDiscountIds.length === 0 ? 'visible' : 'invisible'}`}>{HEADERS[0].title}</span>
            </div>
          </th>
          {HEADERS.slice(1).map(({ title, isNumeric, className }, index) => (
            <th key={index} scope="col" className={`px-6 py-2.5 bg-[#F7F7F7] ${className} left-5 ${selectedDiscountIds.length === 0 ? 'visible' : 'invisible'} text-secondary/80 font-semibold text-xs ${isNumeric ? "text-right" : "text-left"}`}>
              {title}
            </th>
          ))}

          {selectedDiscountIds.length > 0 &&
            <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
              {canCreateDiscount && <Button onClick={() => setIsModalOpen(true)} name='Desactivar descuento' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
              {canCreateDiscount && <Button onClick={() => handleEditDiscount(selectedDiscountIds[0])} name='Editar descuento' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />}
            </div>
          }
        </tr>
      }

      {isModalOpen &&
        <Modal
          principalButtonName="Establecer como inactivos"
          onClose={() => setIsModalOpen(false)}
          onClickSave={() => handleUpdateDiscountState(false)}
          name={`¿Guardar descuento(s) ${selectedDiscountIds.length} como inactivo(s)?`}
        >
          <p className='font-medium py-4 text-secondary/80 md:text-sm text-wrap text-base px-4'>
            Desactivar este descuento no podrá volver a activarlo. Y ya no se podrá usar en el modulo de ventas.
          </p>
        </Modal>
      }
    </thead >
  )
}
