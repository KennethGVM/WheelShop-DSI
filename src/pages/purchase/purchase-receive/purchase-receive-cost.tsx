/* eslint-disable react-hooks/exhaustive-deps */
import { useGeneralInformation } from '@/api/general-provider';
import CheckBox from '@/components/form/check-box';
import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function'
import { PurchaseOrderReceiptProps } from '@/types/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface PurchaseCostProps {
  formData: PurchaseOrderReceiptProps;
  setFormData: Dispatch<SetStateAction<PurchaseOrderReceiptProps>>;
  currencyName: string;
  isEditing: boolean;
}

export default function PurchaseReceiveCost({ isEditing, currencyName, formData, setFormData }: PurchaseCostProps) {
  const [quantity, setQuantity] = useState<number>(0);
  const { dollarValue } = useGeneralInformation();


  const convertCurrency = (value: number) => {
    if (!dollarValue) return value;
    return currencyName === 'Dolares' ? value / dollarValue : value;
  };

  useEffect(() => {
  if (isEditing) return;
    let newSubtotal = 0;
    let newQuantity = 0;
    formData.products.forEach(product => {
      newSubtotal += product.orderedQuantity * Number(product.cost);
      newQuantity += product.orderedQuantity;
    });

    const subTotal: number = Number((convertCurrency(newSubtotal) - formData.discount).toFixed(2))
    const total = subTotal;

    setFormData(prev => ({
      ...prev,
      subTotal: convertCurrency(newSubtotal),
      total,
      createdAt: new Date()
    }));

    setQuantity(newQuantity);
  }, []);

  return (
    <FormSection name="Resumen de costos">
      <>
        <div className="flex items-center justify-between text-secondary/80 font-medium md:text-2xs text-base">
          <div className="flex flex-col">
            <span className="text-secondary font-semibold">Subtotal</span>
            <span className="inline-block mt-1">{quantity} articulos</span>
          </div>
          <span className="text-secondary font-semibold">{currencyFormatter(formData.subTotal, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>

        <span className="text-secondary font-semibold md:text-2xs text-base inline-block mt-4">Ajuste de costos</span>

        <div className="flex items-center mb-1.5 justify-between text-secondary/80 font-medium md:text-2xs text-base">
          <span>Envío</span>
          <span>{currencyFormatter(formData.shippingCost, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>

        {formData.discount > 0 && (
          <div className="flex items-center mb-1.5 justify-between text-secondary/80 font-medium md:text-2xs text-base">
            <span>Descuento</span>
            <span>{currencyFormatter(formData.discount, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-secondary/80 font-medium md:text-2xs text-base">
          <span className="text-secondary font-semibold">Total</span>
          <span className="text-secondary font-semibold">{currencyFormatter(formData.total + formData.shippingCost, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>

        {formData.purchaseType === 1 && (
          <div className="border border-gray-300 flex items-center rounded-lg px-3 py-3 mt-3">
            <CheckBox
              disabled
              initialValue={formData.purchaseType === 1}
              classNameLabel="text-2xs"
            />

            <span className="text-secondary font-[550] md:text-2xs text-base">{formData.expirationDate && new Date(formData.expirationDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).replace('.', '')} - {formData.paymentConditionName}</span>
          </div>
        )}
      </>
    </FormSection>
  )
}