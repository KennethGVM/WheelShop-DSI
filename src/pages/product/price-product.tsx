import FormSection from "@/layout/form-section";
import { ProductProps, ProductSupplierProps, SupplierProps } from "@/types/types";
import ProductSupplierTableRow from "./product-supplier-table-row";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPermissions } from "@/lib/function";
import { useRolePermission } from "@/api/permissions-provider";
import FieldInput from "@/components/form/field-input";
import { CloseIcon } from "@/icons/icons";
import Button from "@/components/form/button";


interface PriceProductProps {
  handleChangeFormData: (name: keyof Omit<ProductProps, 'productId' | 'nameRin' | 'createdAt' | 'brandName' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>, value: string | number | string[] | boolean | ProductSupplierProps[]) => void;
  formData: Omit<ProductProps, 'productId' | 'nameRin' | 'createdAt' | 'brandName' | 'storeHouseInventory' | 'storeHouseId' | 'storeHouseName' | 'supplierId' | 'nameSupplier'>;
  suppliers: SupplierProps[];
  isEditing: boolean;
}

export default function PriceProduct({ isEditing, suppliers, formData, handleChangeFormData }: PriceProductProps) {
  const { product_id } = useParams();
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canViewCost = getPermissions(permissions, "Productos", "Ver", "Ver costo")?.canAccess;
  const canViewAdjustmentHistory = getPermissions(permissions, "Inventario", "Ver movimientos")?.canAccess;
  const HEADERS = [
    { label: "Proveedor", className: "px-4 py-3 w-[30%]" },
    { label: "Precio", className: "px-2 py-3" },
    { label: "Precio sugerido", className: "px-2 py-3 " },
    { label: "Precio minimo", className: "px-2 py-3" },
    { label: "Costo", className: "px-2 py-3" },
    { label: "Ganancia", className: "px-2 py-3" },
    { label: "Margen", className: "px-2 py-3" },
  ]
  const tabs = ["Precio", "Costo"]
  const [activeTab, setActiveTab] = useState<string>(tabs[0])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const handleInputChange = (field: keyof ProductSupplierProps, value: string, supplier: ProductSupplierProps) => {
    const numericValue = value.trim() === '' ? 0 : parseFloat(value);

    handleChangeFormData('suppliers', formData.suppliers.map(sup =>
      sup.supplierId === supplier.supplierId ? { ...sup, [field]: numericValue } : sup
    ));
  };

  const handleRemoveSupplier = (supplier: ProductSupplierProps) => {
    handleChangeFormData('suppliers', formData.suppliers.filter(sup => sup.supplierId !== supplier.supplierId));
  };

  return (
    <>
      {formData.suppliers.length > 0 &&
        <FormSection className="px-0 pb-2">
          <>
            <div className="flex items-center justify-between px-4">
              <h2 className='font-[550] md:text-sm text-base text-secondary/90 mb-3'>Fijar precio</h2>
              {canViewAdjustmentHistory && isEditing && <Link to={`/products/add/${product_id}/adjustment_history?productName=${formData.name}`} className='text-blueprimary font-medium md:text-2xs text-base hover:underline hover:text-bluesecondary'>Historial de ajustes</Link>}
            </div>

            {canViewCost &&
              <div className="w-full">
                <div className="flex border-y pt-3 border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`group mx-1.5 px-2.5 py-2 md:text-2xs text-base font-semibold relative ${activeTab === tab ? "text-secondary/80" : "text-secondary/80"}`}
                    >
                      {tab}
                      <div className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t-lg transition-all ${activeTab === tab ? "bg-black" : "bg-transparent group-hover:bg-[#bababa]"}`} />
                    </button>

                  ))}
                </div>
              </div>
            }
            <div className={`relative md:block hidden overflow-x-auto ${canViewCost ? 'mt-2' : ''}  px-px`}>
              <table className="w-full text-left">
                <thead className="text-primary px-4 font-semibold text-2xs border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 w-[30%]">Proveedor</th>
                    {(activeTab === "Precio"
                      ? HEADERS.slice(1, 4)
                      : HEADERS.slice(4, 7)
                    ).map((th, index) => (
                      <th key={index} className={th.className}>
                        {th.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {formData.suppliers.map((supplier, index) => (
                    <ProductSupplierTableRow
                      isEditing={isEditing ?? true}
                      handleRemoveSupplier={handleRemoveSupplier}
                      handleInputChange={handleInputChange}
                      formData={formData}
                      index={index}
                      key={index}
                      supplier={supplier}
                      selectedTab={activeTab}
                      name={suppliers.find(sup => sup.supplierId === supplier.supplierId)?.nameSupplier ?? ''}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden block px-4 py-4 space-y-4">
              {formData.suppliers.map((supplier, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <Link to={`/suppliers/add/${supplier.supplierId}`} className="text-blueprimary hover:underline text-base font-medium cursor-pointer">{suppliers.find(sup => sup.supplierId === supplier.supplierId)?.nameSupplier ?? ''}</Link>
                    <Button
                      type="button"
                      className="p-1.5 rounded-md hover:bg-[#f2f2f2]"
                      styleButton="none"
                      onClick={() => handleRemoveSupplier(supplier)}
                    >
                      <CloseIcon className="size-5 text-secondary/80" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 [&>div]:w-full">
                    <FieldInput
                      isNumber
                      name="Precio"
                      className='mb-0'
                      value={supplier.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value, supplier)}
                    />

                    <FieldInput
                      isNumber
                      className='mb-0'
                      name="Precio sugerido"
                      value={supplier.minPrice || ''}
                      onChange={(e) => handleInputChange('minPrice', e.target.value, supplier)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-4 [&>div]:w-full">
                    <FieldInput
                      isNumber
                      name="Precio minimo"
                      className='mb-0'
                      value={supplier.minPrice || ''}
                      onChange={(e) => handleInputChange('minPrice', e.target.value, supplier)}
                    />

                    <FieldInput
                      isNumber
                      name="Costo"
                      className='mb-0'
                      value={supplier.cost || ''}
                      onChange={(e) => handleInputChange('cost', e.target.value, supplier)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 mt-4 [&>div]:w-full">
                    <FieldInput
                      isNumber
                      className='mb-0'
                      name="Ganancia"
                      value={Number(supplier.cost) > 0 ? Number(supplier.price) - Number(supplier.cost) : 0}
                    />

                    <FieldInput
                      isNumber
                      className='mb-0'
                      name="Margen"
                      value={Number(supplier.price) > 0 && Number(supplier.cost) > 0 ?
                        `${((Number(supplier.price) - Number(supplier.cost)) / Number(supplier.price) * 100).toFixed(2)}%` : "--"
                      }
                    />
                  </div>
                </div>
              ))}

            </div>
          </>
        </FormSection>
      }
    </>
  )
}
