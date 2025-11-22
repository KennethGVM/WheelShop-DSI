import { useGeneralInformation } from "@/api/general-provider"
import Modal from "@/components/modal"
import { currencyFormatter } from "@/lib/function"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

interface OpeningBillProps {
  date: string
  time: string
  denominations: { name: string, quantity: number, value: number, currencyName: string }[]
  denominationsTotal: number
  banks: { bank: string, value: number, currencyName: string }[]
  banksTotal: number
  transfers: { name: string, value: number, currencyName: string }[]
  transfersTotal: number
  grandTotal: number
  onClose: () => void
  name: string
}

export default function OpeningBill({ name, onClose, banks, banksTotal, denominationsTotal, grandTotal, transfers, transfersTotal, date, time, denominations }: OpeningBillProps) {
  const openingBillRef = useRef<HTMLDivElement>(null)
  const { companyName, companyRuc, companyAddress, companyPhone } = useGeneralInformation()

  const handlePrint = useReactToPrint({
    contentRef: openingBillRef,
    documentTitle: `Apertura de caja`,
  });

  return (
    <Modal onClickSave={handlePrint} principalButtonName="Imprimir" classNameModal="md:py-10 py-4" name="Apertura de caja" onClose={onClose}>
      <div className="max-w-4xl h-full mx-auto space-y-6">
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border-gray-300 border shadow-lg">
            <div
              ref={openingBillRef}
              className="thermal-receipt bg-white p-4"
              style={{
                width: "80mm",
                fontFamily: "monospace",
                fontSize: "12px",
                lineHeight: "1.2",
              }}
            >
              <div className="text-center mb-4">
                <div className="font-bold text-lg">{companyName}</div>
                <div className="text-xs">{companyPhone}</div>
                <div className="text-xs">{companyRuc}</div>
                <div className="text-xs">{companyAddress}</div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="mb-4">
                <div className="text-center font-bold text-sm mb-2 uppercase">***TICKET DE {name}***</div>
                <div className="text-xs">
                  <div>FECHA: {date}</div>
                  <div>HORA: {time}</div>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="mb-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Denominación</th>
                      <th className="text-right">Cantidad</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {denominations.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td className="text-right">{currencyFormatter(item.quantity, item.currencyName.toLocaleLowerCase() === "cordobas" ? "NIO" : "USD")}</td>
                        <td className="text-right">{currencyFormatter(item.value, item.currencyName.toLocaleLowerCase() === "cordobas" ? "NIO" : "USD")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-gray-400 mt-1 pt-1">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL C$</span>
                    <span></span>
                    <span>{currencyFormatter(denominationsTotal)}</span>
                  </div>
                </div>
              </div>

              {banks.length > 0 && (
                <>
                  <div className="border-t border-dashed border-gray-400 my-2"></div>
                  <div className="mb-4">
                    <div className="text-center font-bold text-sm mb-2">BANCOS</div>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left">Banco</th>
                          <th className="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {banks.map((item, index) => (
                          <tr key={index}>
                            <td>{item.bank}</td>
                            <td className="text-right">{currencyFormatter(item.value, item.currencyName.toLocaleLowerCase() === "cordobas" ? "NIO" : "USD")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-gray-400 mt-1 pt-1">
                      <div className="flex justify-between font-bold">
                        <span>TOTAL BANCOS C$</span>
                        <span>{currencyFormatter(banksTotal)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {transfers.length > 0 && (
                <>
                  <div className="border-t border-dashed border-gray-400 my-2"></div>
                  <div className="mb-4">
                    <div className="text-center font-bold text-sm mb-2">TRANSFERENCIAS</div>
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left">Referencia</th>
                          <th className="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td className="text-right">{currencyFormatter(item.value, item.currencyName.toLocaleLowerCase() === "cordobas" ? "NIO" : "USD")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="border-t border-gray-400 mt-1 pt-1">
                      <div className="flex justify-between font-bold">
                        <span>TOTAL TRANSFERENCIA C$</span>
                        <span>{currencyFormatter(transfersTotal)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-dashed border-gray-400 my-2"></div>

              <div className="mb-4 px-4">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL GENERAL C$</span>
                  <span>{currencyFormatter(grandTotal)}</span>
                </div>
              </div>
            </div>



            <div className="border-t border-dashed border-gray-400 my-2"></div>

            <div className="mb-4 px-4">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL GENERAL C$</span>
                <span>{currencyFormatter(grandTotal)}</span>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </Modal >
  )
}
