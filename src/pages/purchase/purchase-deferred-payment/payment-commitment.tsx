import Modal from "@/components/modal"
import FieldInput from "@/components/form/field-input"
import Button from "@/components/form/button"
import Line from "@/components/form/line"
import { currencyFormatter } from "@/lib/function";
import { useGeneralInformation } from "@/api/general-provider";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface PaymentCommitmentDataProps {
  commitmentNumber: string;
  createdAt: Date;
  supplierName: string;
  amount: number;
  total: number;
  balance: number;
}

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentCommitmentData: PaymentCommitmentDataProps;
}

export default function ThermalReceiptModal({ isOpen, onClose, paymentCommitmentData }: ThermalReceiptModalProps) {
  const mainBillRef = useRef<HTMLDivElement>(null);
  const { companyName, companyRuc, companyPhone, companyAddress } = useGeneralInformation()

  const handlePrintMainBill = useReactToPrint({
    contentRef: mainBillRef,
    documentTitle: `Comprobante de pago - ${paymentCommitmentData.commitmentNumber}`,
  });

  if (!isOpen) return null

  return (
    <>
      <Modal
        name="Generar Comprobante de Pago"
        onClose={onClose}
        onClickSave={handlePrintMainBill}
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
                name={companyRuc}
                value="20123456789"
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
                id="supplier"
                name="Proveedor"
                value={paymentCommitmentData.supplierName}
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
                value={currencyFormatter(paymentCommitmentData.amount)}
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
              <Button onClick={handlePrintMainBill} name="Imprimir" type="button" styleButton="secondary" className="text-2xs font-medium px-4 py-1.5" />
            </div>
          </div>

          <div className="flex justify-center">
            <div
              className="thermal-receipt bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
              style={{ width: "300px", maxWidth: "300px" }}
            >
              <div
                ref={mainBillRef}
                className="p-3 text-xs leading-tight"
              >
                <div className="text-center my-2 space-y-1">
                  <div className="font-bold text-lg break-words">{companyName}</div>
                  <div className="break-words">RUC: {companyRuc}</div>
                  <div className="break-words">{companyAddress}</div>
                  <div>Tel: {companyPhone}</div>
                </div>

                <Line />

                <div className="text-center mb-2 mt-4">
                  <div className="font-bold text-base">COMPROBANTE DE PAGO</div>
                  <div className="text-sm">N° {paymentCommitmentData.commitmentNumber}</div>
                </div>

                <Line />

                <div className="mb-2 mt-4">
                  <div className="text-2xs">Fecha: {paymentCommitmentData.createdAt.toLocaleDateString('es-PE')}</div>
                  <div className="text-2xs">Hora : {paymentCommitmentData.createdAt.toLocaleTimeString('es-PE')}</div>
                </div>

                <div className="mb-2 mt-4">
                  <div className="text-2xs">Proveedor: {paymentCommitmentData.supplierName}</div>
                </div>

                <Line />

                <div className="mb-2 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xs">Total:</span>
                    <span className="text-2xs">{currencyFormatter(paymentCommitmentData.total)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-2xs">Monto Abonado:</span>
                    <span className="text-2xs">{currencyFormatter(paymentCommitmentData.amount)}</span>
                  </div>
                  <div className="border-t border-gray-400 my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span className="text-2xs">Saldo Pendiente:</span>
                    <span className="text-2xs">{currencyFormatter(paymentCommitmentData.balance)}</span>
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
                  <div className="mt-1 text-xs">{new Date().toLocaleString("es-PE")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}