import { useRolePermission } from '@/api/permissions-provider';
import { supabase } from '@/api/supabase-client';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button'
import { getPermissions } from '@/lib/function';
import { PurchaseProps } from '@/types/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

interface PurchaseHeaderButtonsProps {
  purchases: PurchaseProps[]
}

export default function PurchaseHeaderButtons({ purchases }: PurchaseHeaderButtonsProps) {
  const navigate = useNavigate();
  const [allPurchases, setAllPurchases] = useState<unknown[]>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canExportPurchase = getPermissions(permissions, 'Ordenes de compras', 'Exportar')?.canAccess;
  const canCreatePurchase = getPermissions(permissions, 'Ordenes de compras', 'Editar ordenes de compra')?.canAccess;

  const handleExportPurchase = async () => {
    const { data } = await supabase.from("getpurchases")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false });

    const purchasesData = data as PurchaseProps[];
    const all: unknown[] = purchasesData.map(purchase => ({
      "Codigo de compra": purchase.codePurchaseOrder,
      "Referencia de compra": purchase.referenceNumber,
      "Costo de envío": purchase.shippingCost,
      "Fecha de entrega": new Date(purchase.arrivalDate ? purchase.arrivalDate : purchase.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      Fecha: new Date(purchase.createdAt? purchase.createdAt : purchase.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      "Método de pago": purchase.namePaymentMethod,
      "Proveedor": purchase.nameSupplier,
      "Almacén": purchase.namestorehouse,
      "Fecha de vencimiento": new Date(purchase.expirationDate ? purchase.expirationDate : purchase.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      "Tipo de compra": purchase.purchaseType,
      Productos: purchase.products
    }));

    setAllPurchases(all);
    setIsShowModal(true);
  }

  const dataExport = purchases.map(purchase => ({
    "Codigo de compra": purchase.codePurchaseOrder,
    "Referencia de compra": purchase.referenceNumber,
    "Costo de envío": purchase.shippingCost,
    "Fecha de entrega": new Date(purchase.arrivalDate ? purchase.arrivalDate : purchase.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    Fecha: purchase.createdAt,
    "Método de pago": purchase.namePaymentMethod,
    "Proveedor": purchase.nameSupplier,
    "Almacén": purchase.namestorehouse,
    "Fecha de vencimiento": new Date(purchase.expirationDate ? purchase.expirationDate : purchase.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    "Tipo de compra": purchase.purchaseType,
    Productos: purchase.products
  })) ;

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Órdenes  de compras</h2>
      <div className="flex items-center space-x-2">
        {canExportPurchase && <Button name="Exportar" onClick={handleExportPurchase} className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />}
        {canCreatePurchase && (
          <Button
            onClick={() => navigate('/purchases/add')}
            styleButton="secondary"
            className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium"
          >
            <span className="hidden md:block">Crear orden de compra</span>
            <span className="block md:hidden">Crear</span>
          </Button>
        )}
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={dataExport} fileName="ordenes de compra" allData={allPurchases} />
    </header>
  )
}
