import { useState } from "react";
import FieldSelect from "@/components/form/field-select";
import FormSection from "@/layout/form-section";
import SelectMultiple from "@/components/form/select-multiple";
import { ProductProps, ProductSupplierProps, SupplierProps } from "@/types/types";
import AddSupplierModal from "../supplier/add-supplier-modal";

interface OrganizationProductProps {
  handleChangeFormData: (
    name: "state" | "suppliers",
    value: string | string[] | boolean | ProductSupplierProps[]
  ) => void;
  formData: Omit<
    ProductProps,
    | "productId"
    | "nameRin"
    | "createdAt"
    | "brandName"
    | "storeHouseInventory"
    | "storeHouseId"
    | "storeHouseName"
    | "supplierId"
    | "nameSupplier"
  >;
  
  suppliers: SupplierProps[];
  onAddSupplier: (supplier: SupplierProps) => void;
}

export default function OrganizationProduct({
  formData,
  handleChangeFormData,
  suppliers,
  onAddSupplier,
}: OrganizationProductProps) {
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  const normalizedSuppliers = formData.suppliers.map((s) => ({
    ...s,
    supplierId: String(s.supplierId),
  }));

  const handleAddNewSupplier = (newSupplier: SupplierProps) => {
    onAddSupplier(newSupplier);
    setShowAddSupplierModal(false);
  };

  return (
    <>
      <FormSection name="Estado">
        <FieldSelect
          value={formData.state ? 1 : 0}
          onChange={(e) =>
            handleChangeFormData("state", Number(e.target.value) === 1)
          }
          id="state"
          options={[
            { name: "Activo", value: 1 },
            { name: "Inactivo", value: 0 },
          ]}
        />
      </FormSection>

      <FormSection name="Organización del producto">
        <SelectMultiple
          label="Proveedor"
          name="proveedor"
          value={normalizedSuppliers.map((supplier) => supplier.supplierId)}
          onChange={(selectedSupplierIds) => {
            const updatedSuppliers = selectedSupplierIds.map((supplierId) => {
              const existing = normalizedSuppliers.find(
                (s) => s.supplierId === supplierId
              );
              if (existing) return existing;

              return {
                supplierId,
                price: 0,
                cost: 0,
                minPrice: 0,
                suggestedPrice: 0,
                productSupplierId: "",
              };
            });

            handleChangeFormData("suppliers", updatedSuppliers);
          }}
          options={suppliers.map((supplier) => ({
            label: supplier.nameSupplier,
            value: String(supplier.supplierId),
          }))}
          onClickCreate={() => setShowAddSupplierModal(true)}
        />
      </FormSection>

      {showAddSupplierModal && (
        <AddSupplierModal
          onClose={() => setShowAddSupplierModal(false)}
          onCreated={handleAddNewSupplier}
        />
      )}
    </>
  );
}
