import Button from '@/components/form/button';
import FieldInput from '@/components/form/field-input';
import { CloseIcon } from '@/icons/icons';
import { ProductProps, ProductSupplierProps } from '@/types/types';
import { Link } from 'react-router-dom';

interface ProductSupplierTableRowProps {
  name: string;
  handleRemoveSupplier: (supplier: ProductSupplierProps) => void;
  handleInputChange: (
    name: keyof ProductSupplierProps,
    value: string,
    supplier: ProductSupplierProps,
  ) => void;
  formData: Omit<
    ProductProps,
    | 'productId'
    | 'nameRin'
    | 'createdAt'
    | 'brandName'
    | 'storeHouseInventory'
    | 'storeHouseId'
    | 'storeHouseName'
    | 'supplierId'
    | 'nameSupplier'
  >;
  supplier: ProductSupplierProps;
  selectedTab: string;
  isEditing: boolean;
  index: number;
}

export default function ProductSupplierTableRow({
  handleRemoveSupplier,
  handleInputChange,
  name,
  formData,
  selectedTab,
  supplier,
  index,
  isEditing,
}: ProductSupplierTableRowProps) {
  return (
    <tr
      className={`bg-white ${index !== formData.suppliers.length - 1 ? 'border-b' : ''} font-medium text-sm border-gray-200`}
    >
      <th scope="row" className="px-4 py-4 w-[30%]">
        <Link
          to={`/suppliers/add/${supplier.supplierId}`}
          className="text-blueprimary hover:underline font-medium cursor-pointer"
        >
          {name}
        </Link>
      </th>
      {selectedTab === 'Precio' ? (
        <>
          <td className="px-2 py-4">
            <FieldInput
              isNumber
              className="mb-0 bg-gray-100 cursor-not-allowed"
              value={supplier.price || ''}
              disabled={true} // Bloqueado: Ahora se calcula automáticamente con el Costo (+20%)
            />
          </td>
          <td className="px-2 py-4">
            <FieldInput
              isNumber
              className="mb-0 bg-gray-100 cursor-not-allowed"
              value={supplier.suggestedPrice || ''}
              disabled={true} // Bloqueado: Se calcula en base al Costo (+40%)
            />
          </td>
          <td className="px-2 py-4">
            <FieldInput
              isNumber
              className="mb-0 bg-gray-100 cursor-not-allowed"
              value={supplier.minPrice || ''}
              disabled={true} // Bloqueado: Se calcula en base al Costo (+15%)
            />
          </td>
        </>
      ) : (
        <>
          <td className="px-2 py-4">
            {/* ESTE ES EL ÚNICO CAMPO EDITABLE AHORA */}
            <FieldInput
              isNumber
              className="mb-0 border-blueprimary" // Opcional: resaltarlo un poco
              value={supplier.cost || ''}
              onChange={(e) =>
                handleInputChange('cost', e.target.value, supplier)
              }
            />
          </td>
          <td className="px-2 py-4">
            <FieldInput
              isNumber
              className="mb-0 bg-gray-100 cursor-not-allowed"
              value={
                Number(supplier.cost) > 0
                  ? Number(supplier.price) - Number(supplier.cost)
                  : 0
              }
              disabled={true} // Bloqueado: Es un cálculo
            />
          </td>
          <td className="px-2 py-4">
            <FieldInput
              className="mb-0 bg-gray-100 cursor-not-allowed"
              value={
                Number(supplier.price) > 0 && Number(supplier.cost) > 0
                  ? `${(((Number(supplier.price) - Number(supplier.cost)) / Number(supplier.price)) * 100).toFixed(2)}%`
                  : '--'
              }
              disabled={true} // Bloqueado: Es un cálculo
            />
          </td>
        </>
      )}
      {!isEditing && (
        <td className="px-2 py-4 text-right">
          <Button
            type="button"
            className="p-1.5 rounded-md hover:bg-[#f2f2f2]"
            styleButton="none"
            onClick={() => handleRemoveSupplier(supplier)}
          >
            <CloseIcon className="size-4 text-secondary/80" />
          </Button>
        </td>
      )}
    </tr>
  );
}
