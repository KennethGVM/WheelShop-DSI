import Button from "@/components/form/button";
import FieldInput from "@/components/form/field-input";
import Modal from "@/components/modal";
import { showToast } from "@/components/toast";
import FormSection from "@/layout/form-section";
import { currencyFormatter } from "@/lib/function";
import { ReturnPaymentDetailProps, ReturnProps, SaleProps, SelectedProducts } from "@/types/types";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ReturnPaymentSystem from "./return-payment-system";

interface ReturnSummaryProps {
  productsSale: any[]
  quantities: number[]
  isModalOpen: { shippingCost: boolean };
  handleChangeShowModal: (name: 'shippingCost', value: boolean) => void;
  productsChange: SelectedProducts[]
  returnPaymentDetails: ReturnPaymentDetailProps[];
  setReturnPaymentDetails: Dispatch<SetStateAction<ReturnPaymentDetailProps[]>>;
  setPendingAmount?: (amount: number) => void;
  handleFormSubmit: () => void;
  setFormData: Dispatch<SetStateAction<Omit<ReturnProps, 'returnId' | 'returnDetail' | 'returnPaymentDetail'>>>;
  formData: Omit<ReturnProps, 'returnId' | 'returnDetail' | 'returnPaymentDetail'>;
  sale: SaleProps | undefined;

}

export default function ReturnSummary({ productsSale, quantities, isModalOpen, handleChangeShowModal, productsChange, returnPaymentDetails, setReturnPaymentDetails, setPendingAmount, handleFormSubmit, setFormData, formData,sale  }: ReturnSummaryProps) {
  const [buttonDeleteSC, setButtonDeleteSC] = useState<boolean>(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [tempShippingCost, setTempShippingCost] = useState<number>(0);
  const [isShippingCostApplied, setIsShippingCostApplied] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState(0)




  const getTotalSelectedItems = () => {
    return quantities.reduce((total: number, qty: number) => total + qty, 0)
  }
  const getTotalAmount = () => {
    return quantities.reduce((total: number, qty: number, index: number) => {
      return total + qty * (productsSale[index].price - productsSale[index].discount)
    }, 0)
  }

  const handleApplyShippingCost = () => {
    if (tempShippingCost <= 0) {
      showToast("El costo de envío debe ser mayor que 0", false);
      return;
    }
    setShippingCost(tempShippingCost);
    setIsShippingCostApplied(true);
    handleChangeShowModal("shippingCost", false);
    setButtonDeleteSC(true);

  };

  const handleDeleteShipping = () => {
    setShippingCost(0);
    setTempShippingCost(0);
    handleChangeShowModal("shippingCost", false);
    setButtonDeleteSC(false);
  };


  const subtotal =
    -getTotalAmount() +
    productsChange.reduce(
      (total, p) => total + (Number(p.price || 0) - Number(p.discount || 0)) * Number(p.quantity || 0),
      0
    );


// 1. Total de unidades vendidas en la venta original
const totalUnitsSold = sale?.products?.reduce((acc, product) => acc + product.quantity, 0) ?? 0;

// 2. Total de unidades devueltas (en quantities)
const totalUnitsReturned = quantities.reduce((acc, qty) => acc + qty, 0);

// 3. Descuento proporcional devuelto
const discountPerUnit = totalUnitsSold > 0 ? (sale?.discount ?? 0) / totalUnitsSold : 0;
const discountReturned = discountPerUnit * totalUnitsReturned;



const adjustedShipping = isShippingCostApplied ? shippingCost : 0;
const totalWithShipping = subtotal + adjustedShipping - (subtotal > 0 ? discountReturned : -discountReturned);
  const finalAmount = totalWithShipping - totalPaid;
  // Si se quiere notificar al padre el monto pendiente

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subTotal: subtotal,
      total: totalWithShipping,
      shippingCost: shippingCost,
      discount: discountReturned,
      createdAt: new Date()
    }));
    if (setPendingAmount) setPendingAmount(finalAmount);
  }, [subtotal, totalWithShipping, shippingCost, finalAmount]);

  useEffect(() => {
    if (productsChange.length < 1 || totalWithShipping <= 0) {
      setReturnPaymentDetails([])
      setTotalPaid(0)
    }
  }, [productsChange])

  return (
    <>
      <FormSection name="Resumen">
        <>
          {(getTotalSelectedItems() > 0 || (productsChange.length > 0 && productsChange[0].quantity > 0)) ? (
            <div className="space-y-3 mb-6">
              {/* Artículos devueltos */}
              <div className="flex justify-between md:text-2xs text-base font-normal">
                <span>Artículo devuelto ({getTotalSelectedItems()}):</span>
                <span>-{currencyFormatter(getTotalAmount())}</span>
              </div>

              {/* Artículos de cambio */}
              {productsChange.length > 0 && (
                <>
                  <div className="flex justify-between md:text-2xs text-base font-normal">
                    <span>
                      Artículo de cambio (
                      {productsChange.reduce((total, p) => total + Number(p.quantity || 0), 0)}
                      ):
                    </span>
                    <span>
                      {currencyFormatter(
                        productsChange.reduce(
                          (total, p) => total + (Number(p.price || 0) - Number(p.discount || 0)) * Number(p.quantity || 0),
                          0
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between md:text-2xs text-base font-semibold border-t pt-2">
                    <span>Subtotal:</span>
                    <span>{currencyFormatter(subtotal)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between md:text-2xs text-base font-normal">
                <span>
                  Descuento del pedido 
                </span>
                <span>
                  {currencyFormatter(discountReturned)}
                </span>
              </div>
              {/* Envío */}
              <div className="flex justify-between md:text-2xs text-base font-medium">
                <span
                  className="cursor-pointer w-auto text-blueprimary hover:underline"
                  onClick={() => handleChangeShowModal("shippingCost", true)}
                >
                  Envío por devolución:
                </span>
                <span className="font-normal">
                  {isShippingCostApplied ? `${currencyFormatter(shippingCost)}` : "-"}
                </span>
              </div>

              {/* Reembolso esperado */}
              <div className="flex justify-between md:text-sm text-base font-medium border-t border-gray py-1">
                <span className="mt-3">
                  {totalWithShipping < 0 ? "Reembolso esperado:" : "Monto esperado a recaudar:"}
                </span>
                <span className="mt-3">{currencyFormatter(Math.abs(totalWithShipping))}</span>
              </div>
              {/* Total pagado */}

              {totalWithShipping > 0 && (
                <>
                  <div className="flex justify-between md:text-sm text-base font-medium">
                    <span>Total pagado:</span>
                    <span>{currencyFormatter(totalPaid)}</span>
                  </div>

                  <div className="flex justify-between md:text-sm text-base font-semibold">
                    <span>{(totalWithShipping - totalPaid) > 0 ? "Saldo pendiente:" : "Cambio"}</span>
                    <span className={`
    ${totalWithShipping - totalPaid > 0 ? "text-red-500" : "text-green-500"}
  `}>
                      {currencyFormatter(Math.abs(totalWithShipping - totalPaid))}
                    </span>
                  </div>
                </>
              )}
            </div>


          ) : (
            <p className="text-sm text-gray-500 mb-6">Ningún artículo seleccionado</p>
          )
          }
          <Button
            type="button"
            name="Crear devolución"
            onClick={handleFormSubmit}
            styleButton="secondary"
            className="bg-primary w-full text-center text-white py-2 text-sm font-medium rounded-md"
          />
        </>
      </FormSection>
      {totalWithShipping > 0 && (
        <FormSection name="Detalles de pago">
          <ReturnPaymentSystem
            totalSale={0}
            setReturnPaymentDetails={setReturnPaymentDetails}
            returnPaymentDetails={returnPaymentDetails}
            setPendingAmount={setPendingAmount}
            setTotalPaid={setTotalPaid}
            formDataReturns={formData}
          />
        </FormSection>
      )}

      {isModalOpen.shippingCost && (
        <Modal classNameModal="mt-6 w-full"
          onClickSave={handleApplyShippingCost}
          onClose={() => handleChangeShowModal("shippingCost", false)}
          name="Envio de devolución"
          showDeleteButton={buttonDeleteSC}
          deleteButtonLabel="Eliminar envio"
          onClickDelete={handleDeleteShipping} >
          <div className="mx-4 mb-4">
            <div className="flex items-center mb-3">
              <FieldInput
                className="mb-2 w-full mr-2"
                value={shippingCost}
                onChange={(e) => setTempShippingCost(Number(e.target.value))}
                min={0}
                isNumber
                appendChild={<span className="md:text-2xs text-base ">C$</span>}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}