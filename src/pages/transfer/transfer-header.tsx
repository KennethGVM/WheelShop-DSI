import { supabase } from "@/api/supabase-client";
import ExportDataModal from "@/components/export-data-modal";
import Button from "@/components/form/button";
import { TransferProps } from "@/types/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TransferHeaderProps {
  transfers: TransferProps[]
}

export default function TransferHeader({ transfers }: TransferHeaderProps) {
  const navigate = useNavigate();
  const [allTransfers, setAllTransfers] = useState<unknown[]>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);

  const handleLoadAllTransfers = async () => {
    const { data } = await supabase.from('gettransfers').select('*');
    const transfersData = data as TransferProps[];
    const all: unknown[] = transfersData.map(transfer => ({
      Origen: transfer.originName,
      Destino: transfer.destinationName,
      Referencia: transfer.referenceNumber,
      Usuario: transfer.email,
      Fecha: new Date(transfer.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      Productos: transfer.products.map(product => product.productName).join(", ")
    }));

    setAllTransfers(all);
    setIsShowModal(true);
  }

  const dataExport = transfers.map(transfer => ({
    Origen: transfer.originName,
    Destino: transfer.destinationName,
    Referencia: transfer.referenceNumber,
    Usuario: transfer.email,
    Fecha: new Date(transfer.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    Productos: transfer.products.map(product => product.productName).join(", ")
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Transferencias</h2>
      <div className="flex items-center space-x-2">
        <Button name="Exportar" onClick={handleLoadAllTransfers} className="md:px-3 md:py-1 p-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />
        <Button onClick={() => navigate('/transfers/add')} styleButton="secondary" className="md:px-3 md:py-1 px-4 py-2.5 md:text-2xs text-base font-medium" >
          <span className="hidden md:block">Crear transferencia</span>
          <span className="block md:hidden">Crear</span>
        </Button>
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={allTransfers} fileName="transferencias" allData={dataExport} />
    </header>
  )
}
