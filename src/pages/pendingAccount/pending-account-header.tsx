import { supabase } from '@/api/supabase-client';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button'
import { PendingAccountProps } from '@/types/types';
import { useState } from 'react';

interface PendingAccountHeaderProps {
  pendingAccounts: PendingAccountProps[]
}

export default function PendingAccountHeader({ pendingAccounts }: PendingAccountHeaderProps) {
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [allPendingAccounts, setAllPendingAccounts] = useState<unknown[]>([]);

  const handleLoadAllPendingAccounts = async () => {
    const { data } = await supabase.from('getpendingaccounts').select('*');
    const pendingAccountsData = data as PendingAccountProps[];
    const all: unknown[] = pendingAccountsData.map(pendingAccount => ({
      Nombre: pendingAccount.customerName,
      Fecha: new Date(pendingAccount.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      Dias: pendingAccount.daysPending,
      Total: pendingAccount.total,
      Saldo: pendingAccount.saldo
    }));

    setAllPendingAccounts(all);
    setIsShowModal(true);
  }

  const dataExport = pendingAccounts.map(pendingAccount => ({
    Nombre: pendingAccount.customerName,
    Fecha: new Date(pendingAccount.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    Dias: pendingAccount.daysPending,
    Total: pendingAccount.total,
    Saldo: pendingAccount.saldo
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4" >
      <h2 className="font-bold text-[20px] text-secondary/90">Cuentas pendientes</h2>
      <div className="flex items-center space-x-2">
        <Button onClick={handleLoadAllPendingAccounts} name="Exportar" className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={dataExport} fileName="cuentas pendientes" allData={allPendingAccounts} />
    </header >
  )
}
