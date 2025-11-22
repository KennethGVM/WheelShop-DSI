import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button'
import { getPermissions } from '@/lib/function';
import { QuotationProps } from '@/types/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

interface QuotationHeaderProps {
  quotations: QuotationProps[]
}

export default function QuotationHeader({ quotations }: QuotationHeaderProps) {
  const navigate = useNavigate();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [allQuotations, setAllQuotations] = useState<unknown[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateQuotation = getPermissions(permissions, "Cotizaciones", "Crear y editar")?.canAccess;

  const handleLoadAllQuotations = async () => {
    const { data } = await supabase.from('getquotations').select('*');
    const quotationsData = data as QuotationProps[];

    const all: unknown[] = quotationsData.map(quotation => ({
      "Codigo de cotización": quotation.quotationCode,
      Cliente: quotation.customerName,
      Identificación: quotation.dni,
      Correo: quotation.email,
      Telefono: quotation.phone,
      Usuario: quotation.user,
      Fecha: new Date(quotation.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      Productos: (quotation.products && quotation.newProducts) ? [quotation.products, quotation.newProducts].flat().map(product => product.productName).join(", ") : '',
      Observaciones: quotation.observation,
      Total: quotation.total
    }));

    setAllQuotations(all);
    setIsShowModal(true);
  }

  const dataExport = quotations.map(quotation => ({
    "Codigo de cotización": quotation.quotationCode,
    Cliente: quotation.customerName,
    Identificación: quotation.dni,
    Correo: quotation.email,
    Telefono: quotation.phone,
    Usuario: quotation.user,
    Fecha: new Date(quotation.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    Productos: (quotation.products && quotation.newProducts) ? [quotation.products, quotation.newProducts].flat().map(product => product.productName).join(", ") : '', Observaciones: quotation.observation,
    Total: quotation.total,
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Cotizaciones</h2>
      <div className="flex items-center space-x-2">
        <Button onClick={handleLoadAllQuotations} name="Exportar" className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />
        {canCreateQuotation && (
          <Button
            onClick={() => navigate('/quotations/add')}
            styleButton="secondary"
            className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium"
          >
            <span className="hidden md:block">Crear cotización</span>
            <span className="block md:hidden">Crear</span>
          </Button>
        )}
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={dataExport} fileName="cotizaciones" allData={allQuotations} />
    </header>
  )
}
