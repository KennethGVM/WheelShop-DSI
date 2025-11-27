import { currencyFormatter } from "@/lib/function"
import { salePaymentDetailProps } from "@/types/types"

interface SaleDataProps {
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
  state: number | boolean
}

interface SaleVoucherProps {
  mainBillRef: React.RefObject<HTMLDivElement>
  companyName: string
  companyRuc: string
  companyAddress: string
  companyPhone: string
  sale: SaleDataProps
  salePaymentDetail: salePaymentDetailProps[]
}

export default function SaleVoucher({ mainBillRef, salePaymentDetail, companyName, companyRuc, companyAddress, companyPhone, sale }: SaleVoucherProps) {
  return (
    <div className="border border-gray-200 rounded-lg shadow-lg">
      <div
        ref={mainBillRef}
        id="main-bill"
        className={`main-bill bg-white overflow-hidden mb-4`}
        style={{ width: "80mm", maxWidth: "80mm" }}
      >
        <div className="p-4">
          <div className="text-center mb-4">
            <h1 className="font-bold text-lg" >{companyName}</h1>
            <p className="text-xs">RUC: {companyRuc}</p>
            <p className="text-xs">{companyAddress}</p>
            <p className="text-xs">Tel: {companyPhone}</p>
          </div>

          <div className="border-t border-b border-gray-300 py-2 mb-4">
            <h2 className="font-bold text-center">{sale.state === 0 ? "VENTA ANULADA" : "COMPROBANTE DE VENTA"}</h2>
            <div className="flex justify-between text-xs">
              <span>Nº: {sale.codeSale}</span>
              <span>{sale.createdAt ? new Date(sale.createdAt).toLocaleString('es-ES', {
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
            <p className="text-xs capitalize">{sale.customerName + " " + sale.customerLastName}</p>
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
              {sale.products?.map(({ name, quantity, price, discount }, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1 break-words max-w-[120px] whitespace-pre-wrap">{name}</td>
                  <td className="text-right py-1">{quantity}</td>
                  <td className="text-right py-1">{currencyFormatter(price - discount)}</td>
                  <td className="text-right py-1">{currencyFormatter(quantity * (price - discount))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <div className="flex justify-between text-xs">
              <span>Subtotal:</span>
              <span>{currencyFormatter(sale.subTotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Descuento:</span>
              {sale.discount > 0 ? `-${currencyFormatter(sale.discount)}` : currencyFormatter(sale.discount)}
            </div>
            <div className="flex justify-between text-xs">
              <span>Envio:</span>
              <span>{currencyFormatter(sale.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-gray-300 mt-1 pt-1">
              <span>{sale.state === 2 ? "SALDO" : "TOTAL"}:</span>
              <span>{currencyFormatter(sale.total)}</span>
            </div>
            <>
              {sale.typeSale === 1 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Detalle de pago:</p>

                  {sale.typeSale === 1 &&
                    salePaymentDetail
                      .filter((item) => item.currencyName === "Dolares")
                      .map((item, index) => (
                        <div key={`usd-${index}`} className="flex justify-between text-xs">
                          <span>
                            {item.namePaymentMethod} {item.bankName ? `(${item.bankName})` : ""}
                          </span>
                          <span>{currencyFormatter(item.amount, "USD")}</span>
                        </div>
                      ))}

                  {sale.typeSale === 1 &&
                    salePaymentDetail.some((item) => item.currencyName === "Dolares") && (
                      <>
                        <div className="flex justify-between text-xs font-semibold mt-1">
                          <span>Cambio dólar:</span>
                          <span>{currencyFormatter(sale.dollarChange, "NIO")}</span>
                        </div>

                        <div className="flex justify-between text-xs font-semibold mt-1">
                          <span></span>
                          <span>
                            {currencyFormatter(
                              salePaymentDetail?.length &&
                              salePaymentDetail
                                .filter((item) => item.currencyName === "Dolares")
                                .reduce((sum, item) => sum + item.amount, 0) * sale.dollarChange,
                              "NIO",
                            )}
                          </span>
                        </div>
                      </>
                    )}

                  {sale.typeSale === 1 &&
                    salePaymentDetail
                      .filter((item) => item.currencyName === "Cordobas")
                      .map((item, index) => (
                        <div key={`nio-${index}`} className="flex justify-between text-xs">
                          <span>
                            {item.namePaymentMethod} {item.bankName ? `(${item.bankName})` : ""}
                          </span>
                          <span>{currencyFormatter(item.amount, "NIO")}</span>
                        </div>
                      ))}
                </div>
              )}
              {!(sale.typeSale === 0 && sale.state === 2) && (
                <div className="flex justify-between text-xs mt-1 font-medium">
                  <span className="font-semibold mt-1">Total pagado:</span>
                  {sale.typeSale === 0 ? (
                    <span className="font-semibold mt-1">
                      {currencyFormatter(sale.total)}
                    </span>
                  ) : (
                    <span className="font-semibold mt-1">
                      {currencyFormatter(
                        Array.isArray(salePaymentDetail)
                          ? salePaymentDetail.reduce((sum, item) => {
                            const amountInCordobas =
                              item.currencyName === "Dolares"
                                ? item.amount * sale.dollarChange
                                : item.amount;
                            return sum + amountInCordobas;
                          }, 0)
                          : 0,
                        "NIO"
                      )}
                    </span>
                  )}
                </div>
              )}

              {(() => {
                if (!Array.isArray(salePaymentDetail)) return null;
                const cambio =
                  salePaymentDetail.reduce((sum, item) => {
                    const amountInCordobas =
                      item.currencyName === "Dolares" ? item.amount * sale.dollarChange : item.amount
                    return sum + amountInCordobas
                  }, 0) - sale.total

                return cambio > 0 ? (
                  <div className="flex justify-between text-xs">
                    <span>Cambio:</span>
                    <span>{currencyFormatter(cambio, "NIO")}</span>
                  </div>
                ) : null
              })()}
            </>
          </div>

          <div className="text-center text-xs border-t border-gray-300 pt-2">
            <p>Gracias por su compra</p>
            <p className="mt-1">Conserve esta factura para posibles reclamaciones</p>
          </div>
        </div >
      </div>
    </div>
  )
}
