import { useRolePermission } from "@/api/permissions-provider";
import { supabase } from "@/api/supabase-client";
import ExportDataModal from "@/components/export-data-modal";
import Button from "@/components/form/button";
import { getPermissions } from "@/lib/function";
import { CustomerProps } from "@/types/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CustomerHeaderProps {
  customers: CustomerProps[]
}

export default function CustomerHeader({ customers }: CustomerHeaderProps) {
  const navigate = useNavigate();
  const [allCustomers, setAllCustomers] = useState<unknown[]>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canCreateCustomer = getPermissions(permissions, "Clientes", "Crear y editar")?.canAccess;
  const canExportCustomer = getPermissions(permissions, "Clientes", "Exportar")?.canAccess;

  const handleLoadAllCustomers = async () => {
    const { data } = await supabase.from('getcustomers').select('*')
    const customersData = data as CustomerProps[];
    const all: unknown[] = customersData.map(customer => ({
      Nombre: customer.customerName,
      Apellido: customer.customerLastName,
      DNI: customer.dni,
      Teléfono: customer.phone,
      Email: customer.email,
      Categoría: customer.categoryCustomerName,
      Departamento: customer.departmentName,
      Municipio: customer.municipalityName,
      Dirección: customer.address,
    }));

    setAllCustomers(all);
    setIsShowModal(true);
  }

  const exportData = customers.map(customer => ({
    Nombre: customer.customerName,
    Apellido: customer.customerLastName,
    DNI: customer.dni,
    Teléfono: customer.phone,
    Email: customer.email,
    Categoría: customer.categoryCustomerName,
    Departamento: customer.departmentName,
    Municipio: customer.municipalityName,
    Dirección: customer.address
  }));

  return (
    <header className="flex items-center justify-between mb-5 md:px-0 px-4">
      <h2 className="font-bold text-[20px] text-secondary/90">Clientes</h2>
      <div className="flex items-center space-x-2">
        {canExportCustomer && <Button onClick={handleLoadAllCustomers} name="Exportar" className="md:px-3 md:py-1 px-4 py-2.5 bg-[#d4d4d4] md:text-2xs text-base font-medium text-secondary" styleButton="simple" />}
        {canCreateCustomer && <Button onClick={() => navigate('/customers/add')} name="Añadir Clientes" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />}
      </div>

      <ExportDataModal isOpen={isShowModal} onClose={() => setIsShowModal(false)} data={allCustomers} fileName="clientes" allData={exportData} />
    </header>
  )
}
