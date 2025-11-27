import { currencyFormatter } from "@/lib/function"
import { ReturnProps } from "@/types/types"

interface ReturnDataProps {
  codeSale: string
  createdAt: Date | null
  customerName: string
  customerLastName: string
  discount: number
  dollarChange: number
  products?: { name: string; quantity: number; price: number; discount: number }[]
  shippingCost: number
  subTotal: number
  total: number
  typeSale: number | null
}

interface ReturnVoucherProps {
  returnBillRef: React.RefObject<HTMLDivElement>
  companyName: string
  companyRuc: string
  companyPhone: string
  companyAddress: string
  returns: ReturnProps[]
  returnData: ReturnDataProps
}

export default function ReturnVoucher({ returnData, returnBillRef, companyAddress, companyPhone, companyRuc, companyName, returns }: ReturnVoucherProps) {
  return (
    <div
      ref={returnBillRef}
      id="return-bill"
      className="thermal-receipt return-bill bg-white overflow-hidden mb-4"
      style={{ width: "80mm", maxWidth: "80mm" }}
    >
      <div className="p-4">
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg">{companyName}</h1>
          <p className="text-xs">RUC: {companyRuc}</p>
          <p className="text-xs">{companyAddress}</p>
          <p className="text-xs">Tel: {companyPhone}</p>
        </div>

        <div className="border-t border-b border-gray-300 py-2 mb-4">
          <h2 className="font-bold text-center ">COMPROBANTE DE DEVOLUCIÓN</h2>
          <div className="flex justify-between text-xs">
            <span>Nº: {returnData.codeSale}-DEV</span>
            <span>{returnData.createdAt ? new Date(returnData.createdAt).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).replace('.', '') : ''}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-sm">Cliente:</h3>
          <p className="text-xs">{returnData.customerName + " " + returnData.customerLastName}</p>
        </div>

        <table className="w-full text-xs mb-4">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1">Descripción</th>
              <th className="text-right py-1">Cant.</th>
              <th className="text-right py-1">Precio</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="py-2 font-semibold text-left text-sm">
                Productos devueltos
              </td>
            </tr>
            {returns?.flatMap(({ returnDetail }, index) =>
              returnDetail
                .filter((detail) => detail.type === false)
                .map((detail, i) => (
                  <tr key={`return-${index}-${i}`} className="border-b border-gray-100">
                    <td className="py-1 break-words max-w-[120px] whitespace-pre-wrap">{detail.productName}</td>
                    <td className="text-right py-1">{detail.quantity}</td>
                    <td className="text-right py-1">
                      {currencyFormatter(detail.productPrice - detail.discount)}
                    </td>
                    <td className="text-right py-1">
                      {currencyFormatter(detail.quantity * (detail.productPrice - detail.discount))}
                    </td>
                  </tr>
                )),
            )}

            {returns?.some((r) => r.returnDetail.some((d) => d.type === true)) && (
              <>
                <tr>
                  <td colSpan={4} className="py-2 font-semibold text-left text-sm ">
                    Productos de cambio
                  </td>
                </tr>
                {returns?.flatMap(({ returnDetail }, index) =>
                  returnDetail
                    .filter((detail) => detail.type === true)
                    .map((detail, i) => (
                      <tr key={`change-${index}-${i}`} className="border-b border-gray-100">
                        <td className="py-1">{detail.productName}</td>
                        <td className="text-right py-1">{detail.quantity}</td>
                        <td className="text-right py-1">
                          {currencyFormatter(detail.productPrice - detail.discount)}
                        </td>
                        <td className="text-right py-1">
                          {currencyFormatter(detail.quantity * (detail.productPrice - detail.discount))}
                        </td>
                      </tr>
                    )),
                )}
              </>
            )}
          </tbody>
        </table>
        <div className="mb-4">
          <div className="flex justify-between text-xs">
            <span>Subtotal:</span>
            <span>{currencyFormatter(Math.abs(returns[0].subTotal))}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Descuento:</span>
            {returns[0].discount > 0 ? `-${currencyFormatter(returns[0].discount)}` : currencyFormatter(returns[0].discount)}
          </div>
          <div className="flex justify-between text-xs">
            <span>Envio:</span>
            <span>{currencyFormatter(returns[0].shippingCost)}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between font-bold border-t border-gray-300 mt-1 pt-1">
            <span>{returns[0].total > 0 ? "TOTAL" : "REEMBOLSADO"}:</span>
            <span>{currencyFormatter(Math.abs(returns[0].total))}</span>
          </div>
          {returns[0].total > 0 && (
            <>
              <div className="mt-2">
                <p className="text-xs font-semibold mb-1">Detalle de pago:</p>

                {returns[0].returnPaymentDetail
                  .filter((item) => item.currencyName === "Dolares")
                  .map((item, index) => (
                    <div key={`usd-return-${index}`} className="flex justify-between text-xs">
                      <span>
                        {item.namePaymentMethod} {item.bankName ? `(${item.bankName})` : ""}
                      </span>
                      <span>{currencyFormatter(item.amount, "USD")}</span>
                    </div>
                  ))}

                {returns[0].returnPaymentDetail.some((item) => item.currencyName === "Dolares") && (
                  <>
                    <div className="flex justify-between text-xs font-semibold mt-1">
                      <span>Cambio dólar:</span>
                      <span>{currencyFormatter(returnData.dollarChange, "NIO")}</span>
                    </div>

                    <div className="flex justify-between text-xs font-semibold mt-1">
                      <span></span>
                      <span>
                        {currencyFormatter(
                          returns[0].returnPaymentDetail
                            .filter((item) => item.currencyName === "Dolares")
                            .reduce((sum, item) => sum + item.amount, 0) * returnData.dollarChange,
                          "NIO",
                        )}
                      </span>
                    </div>
                  </>
                )}

                {returns[0].returnPaymentDetail
                  .filter((item) => item.currencyName === "Cordobas")
                  .map((item, index) => (
                    <div key={`nio-return-${index}`} className="flex justify-between text-xs">
                      <span>
                        {item.namePaymentMethod} {item.bankName ? `(${item.bankName})` : ""}
                      </span>
                      <span>{currencyFormatter(item.amount, "NIO")}</span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between text-xs mt-1 font-medium">
                <span>Total pagado:</span>
                <span>
                  {currencyFormatter(
                    returns[0].returnPaymentDetail.reduce((sum, item) => {
                      const amountInCordobas =
                        item.currencyName === "Dolares" ? item.amount * returnData.dollarChange : item.amount
                      return sum + amountInCordobas
                    }, 0),
                    "NIO",
                  )}
                </span>
              </div>

              {(() => {
                const cambio =
                  returns[0].returnPaymentDetail.reduce((sum, item) => {
                    const amountInCordobas =
                      item.currencyName === "Dolares" ? item.amount * returnData.dollarChange : item.amount
                    return sum + amountInCordobas
                  }, 0) - returns[0].total

                return cambio > 0 ? (
                  <div className="flex justify-between text-xs">
                    <span>Cambio:</span>
                    <span>{currencyFormatter(cambio, "NIO")}</span>
                  </div>
                ) : null
              })()}
            </>
          )}
        </div>

        <div className="text-center text-xs border-t border-gray-300 pt-2">
          <p>Devolución procesada</p>
          <p className="mt-1">Conserve este comprobante</p>
        </div>
      </div>
    </div>
  )
}
