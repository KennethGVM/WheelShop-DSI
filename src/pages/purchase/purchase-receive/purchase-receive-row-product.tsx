import Button from '@/components/form/button'
import ProgressBar from '@/components/form/progress-bar'
import { CloseIcon } from '@/icons/icons'
import { currencyFormatter } from '@/lib/function'
import { PurchaseReceiptQuantityProductProps } from '@/types/types'

interface PurchaseRowProductProps {
  index: number;
  state: number;
  products: PurchaseReceiptQuantityProductProps[]
  receiveQuantity: number;
  pendingQuantity: number;
  orderedQuantity: number;
  cost: number
  name: string
}

export default function PurchaseReceiveRowProduct({ state, cost, name, orderedQuantity, receiveQuantity, pendingQuantity }: PurchaseRowProductProps) {
  return (
    <tr className="bg-white border-b font-medium text-sm border-gray-200">
      <th scope="row" className="px-4 py-4 w-[30%]">
        <span className="text-blueprimary hover:underline font-medium cursor-pointer">{name}</span>
      </th>
      <td className="px-2 py-4">
        <ProgressBar isShowLabel={false} total={orderedQuantity} value1={(state === 1 || state === 3) ? 0 : receiveQuantity} value2={(state === 1 || state === 3) ? 0 : pendingQuantity} />
      </td>
      <td className="px-2 py-4 text-right">
        <span className='text-2xs font-medium text-secondary/80'>{currencyFormatter(cost)}</span>
      </td>
      <td className={`py-4 text-right text-secondary/80 font-medium text-2xs ${state < 1 ? 'px-2' : 'px-4'}`}>
        {currencyFormatter(orderedQuantity * Number(cost))}
      </td>
      {state < 1 &&
        <td className="px-2 py-4 text-right">
          <Button type="button" className="p-1.5 rounded-md hover:bg-[#f2f2f2]" styleButton="none">
            <CloseIcon className="size-4 text-graying" />
          </Button>
        </td>
      }
    </tr >
  )
}