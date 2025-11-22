import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client';
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input';
import Modal from '@/components/modal'
import { showToast } from '@/components/toast';
import { getPermissions } from '@/lib/function';
import { CashBoxProps } from '@/types/types';
import { Dispatch, SetStateAction, useState } from 'react';

interface CashBoxHeaderProps {
  cashBoxes: CashBoxProps[];
  setCashBoxes: Dispatch<SetStateAction<CashBoxProps[]>>;
}

export default function CashBoxHeader({ setCashBoxes, cashBoxes }: CashBoxHeaderProps) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [cashBoxName, setCashBoxName] = useState<string>('');
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateCashBox = getPermissions(permissions, "Caja", "Crear y editar")?.canAccess;

  const handleSubmit = async () => {
    if (cashBoxName === '') {
      showToast('El nombre de la caja no puede estar vacío', false)
      return;
    }

    const { data, error } = await supabase.from('cashBox').insert({ name: cashBoxName }).select();

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Caja creada', true)
    setIsShowModal(false);
    setCashBoxName('');
    setCashBoxes((prev) => [...prev, data?.[0] as CashBoxProps]);
  }

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Cajas</h2>
      {canCreateCashBox && cashBoxes && cashBoxes.length === 0 && <Button onClick={() => setIsShowModal(true)} name="Crear caja" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />}

      {isShowModal &&
        <Modal name='Agregar caja' onClickSave={handleSubmit} classNameModal='px-4 py-3' principalButtonName='Guardar' onClose={() => setIsShowModal(false)}>
          <FieldInput value={cashBoxName} onChange={(e) => setCashBoxName(e.target.value)} name='Caja' className='mb-0' />
        </Modal>
      }
    </header>
  )
}
