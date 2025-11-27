import FormSection from '@/layout/form-section'
import { PurchaseOrderReceiptProps, PurchaseReceiptQuantityProductProps } from '@/types/types'
import PurchaseReceiveRowProduct from './purchase-receive-row-product'
import { currencyFormatter } from '@/lib/function';
import ProgressBar from '@/components/form/progress-bar';

interface PurchaseProductsProps {
  formData: PurchaseOrderReceiptProps;
  products: PurchaseReceiptQuantityProductProps[]
}

export default function PurchaseReceiveProducts({ formData, products }: PurchaseProductsProps) {
  const HEADER = [
    { label: "Productos", className: "px-4 py-3 w-[30%]" },
    { label: formData?.state < 1 ? "Cantidad" : "Recibido", className: "px-2 py-3" },
    { label: "Costo", className: `px-2 py-3 ${formData?.state < 1 ? 'text-left' : 'text-right'}` },
    { label: "Total", className: `${formData.state < 1 ? 'px-2' : 'px-4'} py-3 text-right w-[15%]` },
    ...(formData?.state < 1 ? [{ label: "", className: "px-2 py-3" }] : []) // Solo agrega la última columna si state < 1
  ];

  return (
    <FormSection name={formData.state < 1 ? "Añadir productos" : "Productos ordenados"} className="px-0" classNameLabel="mx-4 md:mb-0 mb-8">
      <>
        {products.length > 0 &&
          <>
            <div className="md:block hidden relative overflow-x-auto mt-3 px-px">
              <table className="w-full text-left">
                <thead className="text-primary px-4 font-semibold text-2xs border-b border-gray-300">
                  <tr>
                    {HEADER.map((th, index) => (
                      <th key={index} scope="col" className={th.className}>
                        {th.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(({ productName, orderedQuantity, receivedQuantity, cost }, index) => (
                    <PurchaseReceiveRowProduct
                      key={index}
                      state={formData && formData!.state}
                      cost={Number(cost)}
                      index={index}
                      name={productName}
                      products={products}
                      receiveQuantity={receivedQuantity}
                      orderedQuantity={orderedQuantity}
                      pendingQuantity={(orderedQuantity - receivedQuantity)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className='md:hidden block'>
              {products.map(({ productName, orderedQuantity, receivedQuantity, cost }, index) => (
                <div key={index} className={`px-4 py-4 border-t border-gray-300 ${index === products.length - 1 ? 'border-b' : ''}`}>
                  <span className='text-base font-medium text-blueprimary hover:underline hover:text-bluesecondary'>{productName}</span>
                  <div className='grid grid-cols-2 gap-x-3 mb-5'>
                    <div className='flex flex-col font-medium mt-3 text-secondary/80 text-base'>
                      <span>Costo</span>
                      <span>{currencyFormatter(cost)}</span>
                    </div>
                    <div className='flex flex-col font-medium mt-3 text-secondary/80 text-base'>
                      <span>Total</span>
                      <span>{currencyFormatter(cost * orderedQuantity)}</span>
                    </div>
                  </div>

                  <ProgressBar isShowLabel={false} total={orderedQuantity} value1={(formData.state === 1 || formData.state === 3) ? 0 : receivedQuantity} value2={(formData.state === 1 || formData.state === 3) ? 0 : (orderedQuantity - receivedQuantity)} />
                </div>
              ))}
            </div>

            <span className="font-medium md:text-secondary text-secondary/80 md:text-2xs text-base secondary/90 inline-block mx-4 mt-4">{products.length} productos en la orden de compra</span>
          </>
        }
      </>
    </FormSection>
  )
}