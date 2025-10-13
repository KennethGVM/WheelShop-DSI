import { supabase } from "@/api/supabase-client";
import ExportDataModal from "@/components/export-data-modal";
import Button from "@/components/form/button";
import { SupplierProps } from "@/types/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SupplierHeaderProps {
  suppliers: SupplierProps[]
}

export default function SupplierHeader({ suppliers }: SupplierHeaderProps) {
  const navigate = useNavigate();
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const [allSuppliers, setAllSuppliers] = useState<unknown[]>([]);

  const handleLoadSuppliers = async () => {
    const { data } = await supabase.from('supplier').select('*').order('createdAt', { ascending: false });
    const suppliersData = data as SupplierProps[];
    const all: unknown[] = suppliersData.map(supplier => ({
      Nombre: supplier.nameSupplier,
      RUC: supplier.ruc,
      Teléfono: supplier.phone,
      Email: supplier.email,
      "Razón social": supplier.socialReason,
    }));
    setAllSuppliers(all);
    setIsShowModal(true);
  }

  const dataExport = suppliers.map(supplier => ({
    Nombre: supplier.nameSupplier,
    RUC: supplier.ruc,
    Teléfono: supplier.phone,
    Email: supplier.email,
    "Razón social": supplier.socialReason,
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Proveedores</h2>
      <div className="flex items-center space-x-2">
        <Button onClick={handleLoadSuppliers} name="Exportar" className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />
        <Button
          styleButton="secondary"
          onClick={() => navigate('/suppliers/add')}
          className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium"
        >
          <span className="hidden md:block">Añadir proveedor</span>
          <span className="block md:hidden">Crear</span>
        </Button>
      </div>

      <ExportDataModal allData={allSuppliers} data={dataExport} fileName="proveedores" isOpen={isShowModal} onClose={() => setIsShowModal(false)} />
    </header>
  )
}
