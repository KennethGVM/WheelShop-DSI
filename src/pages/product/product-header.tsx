import { useRolePermission } from '@/api/permissions-provider';
import ExportDataModal from '@/components/export-data-modal';
import Button from '@/components/form/button'
import { getPermissions } from '@/lib/function';
import { ProductProps } from '@/types/types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

interface ProductHeaderProps {
  products: ProductProps[]
  filter: "Llantas" | "Aceites" | "Productos Varios"
}

export default function ProductHeader({ products, filter }: ProductHeaderProps) {
  const navigate = useNavigate();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;

  let exportData: unknown[] = [];

  if (filter === "Llantas") {
    exportData = products.map((product) => ({
      Producto: product.name,
      Marca: product.brandName,
      Numeración: product.numeration,
      Stock: product.storeHouseInventory.reduce((acc, curr) => acc + curr.stock, 0),
      "Tipo de vehiculo": product.nameTypeVehicle,
      Proveedores: product.suppliers.map((supplier) => supplier.supplierName).join(", "),
    }));
  } else if (filter === "Aceites") {
    exportData = products.map((product) => ({
      Producto: product.name,
      Marca: product.brandOilName,
      Numeración: product.numerationOil,
      Aceite: product.isDiesel ? "Diesel" : "Gasolina",
      Proveedores: product.suppliers.map((supplier) => supplier.supplierName).join(", "),
    }));
  } else if (filter === "Productos Varios") {
    exportData = products.map((product) => ({
      Producto: product.name,
      Proveedores: product.suppliers.map((supplier) => supplier.supplierName).join(", "),
    }));
  }

  return (
    <header className="flex items-center justify-between md:px-0 px-4 mb-5">
      <h2 className="font-bold text-[20px] text-secondary/90">Productos</h2>
      <div className="flex items-center md:space-x-2 space-x-2">
        {getPermissions(permissions, "Productos", "Exportar")?.canAccess && <Button onClick={() => setIsShowModal(true)} name="Exportar" className="md:px-3 md:py-1 p-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />}
        {getPermissions(permissions, "Productos", "Crear y editar")?.canAccess && <Button onClick={() => navigate('/products/add')} name="Añadir producto" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />}
      </div>

      <ExportDataModal data={exportData} allData={exportData} fileName="productos" isOpen={isShowModal} onClose={() => setIsShowModal(false)} />
    </header>
  )
}
