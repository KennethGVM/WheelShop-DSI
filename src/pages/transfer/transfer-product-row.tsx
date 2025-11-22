import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import StatusTags from '@/components/status-tags';
import { CloseIcon } from '@/icons/icons'

interface PurchaseRowProductProps {
  index: number;
  quantity: number
  name: string,
  transferId: string | undefined,
  stock: number,
  nameSupplier: string,
  handleProductChange: (index: number, field: string, value: number | string) => void;
  handleDeleteProduct: (index: number) => void;
}

export default function TransferProductRow({ stock, transferId, index, nameSupplier, name, quantity, handleDeleteProduct, handleProductChange }: PurchaseRowProductProps) {
  return (
    <tr className="bg-white border-b text-secondary/80 font-medium text-sm border-gray-200">
      <th scope="row" className="px-4 py-4 space-x-2">
        <span className="text-blueprimary hover:underline font-medium cursor-pointer">{name}</span>
        <StatusTags status={true} text={nameSupplier} color="bg-[#e9e9e9]" textColor="text-[#656161]" />
      </th>
      {!transferId && (
        <th scope="row" className="px-4 py-4">
          {stock}
        </th>
      )}
      <td className="px-2 py-4">
        <FieldInput
          isNumber
          readOnly={transferId ? true : false}
          value={quantity}
          className="mb-0"
          onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
        />
      </td>
      {!transferId &&
        <td className="px-2 py-4 text-right">
          <Button onClick={() => handleDeleteProduct(index)} type="button" className="p-1.5 rounded-md hover:bg-[#f2f2f2]" styleButton="none">
            <CloseIcon className="size-4 text-graying" />
          </Button>
        </td>
      }
    </tr >
  )
}