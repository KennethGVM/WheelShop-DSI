import Modal from "@/components/modal"
import FieldInput from "@/components/form/field-input"
import Button from "@/components/form/button"
import Line from "@/components/form/line"
import { currencyFormatter } from "@/lib/function";
import { CurrencyProps } from "@/types/types";
import { useGeneralInformation } from "@/api/general-provider";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface PaymentCommitmentDataProps {
  commitmentNumber: string;
  createdAt: Date;
  customerName: string;
  customerLastName: string;
  amount: number;
  total: number;
  balance: number;
  currencyId: string;
}

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentCommitmentData: PaymentCommitmentDataProps;
  currencies: CurrencyProps[];

}

export default function ThermalReceiptModal({ isOpen, onClose, paymentCommitmentData, currencies }: ThermalReceiptModalProps) {
  const { companyName, companyRuc, companyPhone, companyAddress } = useGeneralInformation()

  const mainBillRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: mainBillRef,
    documentTitle: `Comprobante de pago - ${paymentCommitmentData.commitmentNumber}`,
  });
  if (!isOpen) return null

  return (
    <>
      <Modal
        name="Generar Comprobante de Pago"
        onClose={onClose}
        onClickSave={handlePrint}
        principalButtonName="Imprimir"
        className="md:max-w-6xl"
        classNameModal="p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
              <FieldInput
                id="company"
                name="Empresa"
                value={companyName}
              />

              <FieldInput
                id="ruc"
                name="RUC"
                value={companyRuc}
              />
            </div>

            <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
              <FieldInput
                id="phone"
                name="Telefono"
                value={companyPhone}
              />

              <FieldInput
                id="address"
                name="Dirección"
                value={companyAddress}
              />
            </div>

            <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
              <FieldInput
                id="customer"
                name="Cliente"
                classNameInput="capitalize"
                value={paymentCommitmentData.customerName + " " + paymentCommitmentData.customerLastName}
              />
            </div>


            <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
              <FieldInput
                id="commitment"
                name="Numero de comprobante"
                value={paymentCommitmentData.commitmentNumber}
              />

              <FieldInput
                id="amount"
                name="Abono"
                value={currencyFormatter(paymentCommitmentData.amount ?? 0, (currencies.find(c => c.currencyId === paymentCommitmentData.currencyId)?.currencyName) === 'Cordobas' ? 'NIO' : 'USD')}
              />
            </div>

            <div className="flex items-center space-x-4 mt-4 [&>div]:w-full [&>div]:mb-0">
              <FieldInput
                id="total"
                name="Total"
                value={currencyFormatter(paymentCommitmentData.total)}
              />

              <FieldInput
                id="balance"
                name="Saldo pendiente"
                value={currencyFormatter(paymentCommitmentData.balance)}
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handlePrint} name="Imprimir" type="button" styleButton="secondary" className="text-2xs font-medium px-4 py-1.5" />
            </div>
          </div>

          <div className="flex justify-center" >
            <div
              className="thermal-receipt bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
              style={{ width: "300px", maxWidth: "300px" }}
            >
              <div
                ref={mainBillRef}
                className="receipt-content p-3 text-xs leading-tight"
              >
                <div className="text-center mb-4">
                  <h1 className="font-bold text-lg">{companyName}</h1>
                  <p className="text-xs">RUC: {companyRuc}</p>
                  <p className="text-xs">{companyAddress}</p>
                  <p className="text-xs">Tel: {companyPhone}</p>
                </div>

                <Line />

                <div className="text-center mb-2 mt-4">
                  <div className="font-bold">COMPROBANTE DE PAGO</div>
                  <div>N° {paymentCommitmentData.commitmentNumber}</div>
                </div>

                <Line />

                <div className="mb-2 mt-4">
                  <div>Fecha: {paymentCommitmentData.createdAt.toLocaleDateString('es-PE')}</div>
                  <div>Hora : {paymentCommitmentData.createdAt.toLocaleTimeString('es-PE')}</div>
                </div>

                <div className="mb-2 mt-4">
                  <div className="capitalize">Cliente: {paymentCommitmentData.customerName} {paymentCommitmentData.customerLastName}</div>
                </div>

                <Line />

                <div className="mb-2 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{currencyFormatter(paymentCommitmentData.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Monto Abonado:</span>
                    <span>{currencyFormatter(paymentCommitmentData.amount, (currencies.find(c => c.currencyId === paymentCommitmentData.currencyId)?.currencyName) === 'Cordobas' ? 'NIO' : 'USD')}</span>
                  </div>
                  <div className="border-t border-gray-400 my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span>Saldo Pendiente:</span>
                    <span>{currencyFormatter(paymentCommitmentData.balance)}</span>
                  </div>
                </div>

                <Line />

                <div className="mt-4 mb-2">
                  <div className="text-center mb-3">
                    <div>_______________________</div>
                    <div className="mt-1 text-xs">FIRMA DEL CLIENTE</div>
                  </div>
                  <div className="text-center mb-3">
                    <div>_______________________</div>
                    <div className="mt-1 text-xs">FIRMA AUTORIZADA</div>
                  </div>
                </div>

                <div className="text-center text-xs mt-3">
                  <div>¡Gracias por su pago!</div>
                  <div>Conserve este comprobante</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

    </>
  )
}