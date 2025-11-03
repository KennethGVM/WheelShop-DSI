import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import { CloseIcon } from '@/icons/icons'
import { currencyFormatter } from '@/lib/function'
import { Link } from 'react-router-dom';

interface PurchaseRowProductProps {
  index: number;
  productId: string;
  state: number;
  quantity: number
  cost: number
  name: string,
  handleProductChange: (index: number, field: string, value: number | string) => void;
  handleDeleteProduct: (index: number) => void;
}

export default function PurchaseRowProduct({ productId, state, index, cost, name, quantity, handleDeleteProduct, handleProductChange }: PurchaseRowProductProps) {
  return (
    <tr className="bg-white border-b font-medium text-sm border-gray-200">
      <th scope="row" className="px-4 py-4 w-[30%]">
        <Link to={`/products/add/${productId}`} className="text-blueprimary hover:underline font-medium cursor-pointer">{name}</Link>
      </th>
      <td className="px-2 py-4">
        <FieldInput
          isNumber
          value={quantity}
          disabled={state >= 1}
          className="mb-0"
          onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
        />
      </td>
      <td className="px-2 py-4 text-right">
        <FieldInput
          isNumber
          appendChild={<span className="text-2xs font-medium text-secondary/80">C$</span>}
          value={cost}
          placeholder="0.00"
          className="mb-0"
          disabled={state >= 1}
          onChange={(e) => handleProductChange(index, 'cost', Number(e.target.value))}
        />
      </td>
      <td className={`py-4 text-right text-secondary/80 font-medium text-2xs ${state < 1 ? 'px-2' : 'px-4'}`}>
        {currencyFormatter(quantity * Number(cost))}
      </td>
      {state < 1 &&
        <td className="px-2 py-4 text-right">
          <Button onClick={() => handleDeleteProduct(index)} type="button" className="p-1.5 rounded-md hover:bg-[#f2f2f2]" styleButton="none">
            <CloseIcon className="size-4 text-graying" />
          </Button>
        </td>
      }
    </tr >
  )
}