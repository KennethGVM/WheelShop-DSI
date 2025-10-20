import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button'
import { getPermissions } from '@/lib/function';
import { SaleProps } from '@/types/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

interface SaleHeaderProps {
  sales: SaleProps[]
}

export default function SaleHeader({ sales }: SaleHeaderProps) {
  const navigate = useNavigate();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [allSales, setAllSales] = useState<unknown[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateSale = getPermissions(permissions, "Pedidos", "Crear")?.canAccess;
  const canExportSale = getPermissions(permissions, "Pedidos", "Exportar")?.canAccess;

  const handleLoadAllSales = async () => {
    const { data } = await supabase.from('getsales').select('*');
    const salesData = data as SaleProps[];
    const all: unknown[] = salesData.map(sale => ({
      "Codigo de venta": sale.salesCode,
      "Cliente": sale.customerName,
      Usuario: sale.user,
      "Fecha": new Date(sale.expirationDate ? sale.expirationDate : sale.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      "Expiración": new Date(sale.expirationDate ? sale.expirationDate : sale.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      Productos: sale.products.map(product => product.productName).join(", "),
      Descuento: sale.discount,
      Total: sale.total,
    }));

    setAllSales(all);
    setIsShowModal(true);
  }

  const dataExport = sales.map(sale => ({
    "Codigo de venta": sale.salesCode,
    "Cliente": sale.customerName,
    Usuario: sale.user,
    "Fecha": new Date(sale.expirationDate ? sale.expirationDate : sale.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    "Expiración": new Date(sale.expirationDate ? sale.expirationDate : sale.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    Productos: sale.products.map(product => product.productName).join(", "),
    Descuento: sale.discount,
    Total: sale.total,
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Ventas</h2>
      <div className="flex items-center space-x-2">
        {canExportSale && <Button onClick={handleLoadAllSales} name="Exportar" className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />}
        {canCreateSale && <Button onClick={() => navigate('/sales/add')} name="Añadir venta" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />}
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={dataExport} fileName="ventas" allData={allSales} />
    </header>
  )
}
