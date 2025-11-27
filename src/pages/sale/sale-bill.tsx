import Modal from "@/components/modal"
import FieldInput from "@/components/form/field-input"
import Button from "@/components/form/button"
import type { ReturnProps, salePaymentDetailProps } from "@/types/types"
import { useGeneralInformation } from "@/api/general-provider"
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import SaleVoucher from "./voucher/sale-voucher"
import ReturnVoucher from "./voucher/return-voucher"


interface SaleBillProps {
  isOpen: boolean
  onClose: () => void
  customerName: string
  customerLastName: string
  codeSale: string
  discount: number
  shippingCost: number
  subTotal: number
  total: number
  createdAt?: Date
  products?: { name: string; quantity: number; price: number; discount: number }[]
  returns: ReturnProps[]
  dollarChange: number
  typeSale: number | null
  state: boolean | number
  salePaymentDetail: salePaymentDetailProps[]
}

export default function SaleBill({
  customerName,
  customerLastName,
  codeSale,
  discount,
  shippingCost,
  subTotal,
  total,
  createdAt,
  products,
  isOpen,
  dollarChange,
  typeSale,
  state,
  returns,
  salePaymentDetail,
  onClose,
}: SaleBillProps) {
  const { companyName, companyRuc, companyPhone, companyAddress } = useGeneralInformation()
  const mainBillRef = useRef<HTMLDivElement>(null);
  const returnBillRef = useRef<HTMLDivElement>(null);

  const handlePrintMainBill = useReactToPrint({
    contentRef: mainBillRef,
    documentTitle: `Venta - ${codeSale}`,
  });


  const handlePrintReturnBill = useReactToPrint({
    contentRef: returnBillRef,
    documentTitle: `Devolución - ${codeSale}`,
  });

  if (!isOpen) return null

  return (
    <>
      <Modal
        name="Generar factura"
        onClose={onClose}
        principalButtonName="Imprimir venta"
        className="md:max-w-6xl"
        classNameModal="p-6"
        onClickSave={handlePrintMainBill}
      >
        {!returns || returns.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
                <FieldInput id="company" name="Empresa" value={companyName} />
                <FieldInput id="ruc" name="RUC" value="20123456789" />
              </div>

              <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
                <FieldInput id="phone" name="Telefono" value="(505) 1234-4567" />
                <FieldInput id="address" name="Dirección" value="Calle 1234 Barrio Puerto" />
              </div>

              <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
                <FieldInput className="capitalize" id="customer" name="Cliente" value={customerName + " " + customerLastName} />
              </div>

              <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
                <FieldInput id="commitment" name="Venta" value={codeSale} />
                <FieldInput id="total" name="Sub Total" value={subTotal.toString()} />
              </div>

              <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
                <FieldInput id="discount" name="Descuento" value={discount.toString()} />
                <FieldInput id="balance" name="Total" value={total.toString()} />
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handlePrintMainBill} className="text-2xs font-medium px-4 py-1.5">
                  Imprimir
                </Button>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <div className="flex flex-col items-center">
                <SaleVoucher companyName={companyName}
                  companyRuc={companyRuc}
                  companyAddress={companyAddress}
                  companyPhone={companyPhone}
                  sale={{
                    codeSale: codeSale,
                    createdAt: createdAt ? new Date(createdAt) : null,
                    customerName: customerName,
                    customerLastName: customerLastName,
                    discount: discount,
                    dollarChange: dollarChange,
                    products: products,
                    shippingCost: shippingCost,
                    subTotal: subTotal,
                    total: total,
                    typeSale: typeSale,
                    state: state
                  }} mainBillRef={mainBillRef as React.RefObject<HTMLDivElement>} salePaymentDetail={salePaymentDetail} />

                <Button onClick={handlePrintMainBill} className="text-xs font-medium px-4 py-2 mb-4">
                  Imprimir Comprobante
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-8 justify-center">
              <div className="flex flex-col items-center">
                <SaleVoucher companyName={companyName}
                  companyRuc={companyRuc}
                  companyAddress={companyAddress}
                  companyPhone={companyPhone}
                  sale={{
                    codeSale: codeSale,
                    createdAt: createdAt ? new Date(createdAt) : null,
                    customerName: customerName,
                    customerLastName: customerLastName,
                    discount: discount,
                    dollarChange: dollarChange,
                    products: products,
                    shippingCost: shippingCost,
                    subTotal: subTotal,
                    total: total,
                    typeSale: typeSale,
                    state: state
                  }} mainBillRef={mainBillRef as React.RefObject<HTMLDivElement>} salePaymentDetail={salePaymentDetail} />

                <Button onClick={handlePrintMainBill} className="text-xs font-medium px-4 py-2 mb-4">
                  Imprimir Venta
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="border border-gray-200 rounded-lg shadow-lg">
                  <ReturnVoucher companyAddress={companyAddress} companyName={companyName} companyPhone={companyPhone} companyRuc={companyRuc} returnBillRef={returnBillRef as React.RefObject<HTMLDivElement>} returnData={{
                    codeSale: codeSale,
                    createdAt: returns[0].createdAt ? new Date(returns[0].createdAt) : null,
                    customerName: customerName,
                    customerLastName: customerLastName,
                    discount: discount,
                    dollarChange: dollarChange,
                    products: products,
                    shippingCost: shippingCost,
                    subTotal: subTotal,
                    total: total,
                    typeSale: typeSale
                  }} returns={returns} />
                </div>

                <Button onClick={handlePrintReturnBill} className="text-xs font-medium px-4 py-2 mb-4">
                  Imprimir Devolución
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
