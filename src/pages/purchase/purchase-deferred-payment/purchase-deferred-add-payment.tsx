import { useGeneralInformation } from '@/api/general-provider'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import FieldSelect from '@/components/form/field-select'
import { showToast } from '@/components/toast'
import { CreditPaymentIcon, PlusIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { CurrencyProps, PaymentMethodProps, PurchaseDeferredPaymentProps, PurchaseProps } from '@/types/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface PurchaseDeferredAddPaymentProps {
  payments: PurchaseDeferredPaymentProps[];
  purchaseId: string;
  allPayments: PurchaseDeferredPaymentProps[];
  purchase: PurchaseProps | null;
  paymentMethods: PaymentMethodProps[];
  currencies: CurrencyProps[];
  setNewPayments: Dispatch<SetStateAction<PurchaseDeferredPaymentProps[]>>;
}

export default function PurchaseDeferredAddPayment({ currencies, paymentMethods, purchaseId, allPayments, purchase, setNewPayments }: PurchaseDeferredAddPaymentProps) {
  const [isShowForm, setIsShowForm] = useState<boolean>(false);
  const { dollarValue = 0 } = useGeneralInformation();
  const [formData, setFormData] = useState({
    amount: 0,
    currencyId: '',
    paymentMethodId: '',
    balance: 0,
    dollarChange: 0,
  });

  useEffect(() => {
    if (currencies.length > 0 || paymentMethods.length > 0) {
      setFormData(prev => ({
        ...prev,
        currencyId: currencies[0]?.currencyId ?? '',
        paymentMethodId: paymentMethods[0]?.paymentMethodId ?? '',
        dollarChange: dollarValue ?? 0,
      }));
    }
  }, [currencies, paymentMethods]);

  const handleAddPayment = () => {
    if (!dollarValue) return;

    const { amount, currencyId, paymentMethodId } = formData;

    if (!amount || !currencyId || !paymentMethodId || !purchase) return;

    const formCurrencyName = currencies.find(c => c.currencyId === currencyId)?.currencyName;
    const purchaseCurrencyName = purchase.currencyName;

    const amountInPurchaseCurrency =
      formCurrencyName === "Dolares" && purchaseCurrencyName === "Cordobas"
        ? amount * dollarValue
        : formCurrencyName === "Cordobas" && purchaseCurrencyName === "Dolares"
          ? amount / dollarValue
          : amount;

    const totalPaidInPurchaseCurrency = allPayments.reduce((acc, payment) => {
      const paymentCurrencyName = currencies.find(c => c.currencyId === payment.currencyId)?.currencyName;
      const convertedAmount =
        paymentCurrencyName === "Dolares" && purchaseCurrencyName === "Cordobas"
          ? payment.amount * (payment.dollarChange || 0)
          : paymentCurrencyName === "Cordobas" && purchaseCurrencyName === "Dolares"
            ? payment.amount / (payment.dollarChange || 0)
            : payment.amount;

      return acc + convertedAmount;
    }, 0);

    const remainingBalance = purchase.total - totalPaidInPurchaseCurrency;

    if (amountInPurchaseCurrency > remainingBalance + 0.01) {
      showToast('Abono no puede exceder el total comprado', false);
      return;
    }

    const currentBalance = remainingBalance - amountInPurchaseCurrency;

    const newPayment: PurchaseDeferredPaymentProps = {
      purchaseDeferredPaymentId: crypto.randomUUID(),
      purchaseOrderId: purchaseId ?? '',
      createdAt: new Date(),
      amount,
      currencyId,
      paymentMethodId,
      balance: currentBalance,
      state: true,
      paymentCode: '',
      dollarChange: dollarValue,
    };

    setNewPayments(prev => [...prev, newPayment]);

    setFormData({
      amount: 0,
      balance: 0,
      currencyId: currencies[0]?.currencyId ?? '',
      paymentMethodId: paymentMethods[0]?.paymentMethodId ?? '',
      dollarChange: dollarValue,
    });

    setIsShowForm(false);
  };

  return (
    <>
      {purchase?.purchaseType !== 2 &&
        <FormSection>
          <>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2 bg-[#ffeb78] px-2 py-1 rounded-lg w-fit'>
                <CreditPaymentIcon className='size-4 fill-secondary/80 stroke-none' />
                <span className='text-secondary/80 font-medium text-2xs'>No pagado</span>
              </div>

              <Button onClick={() => setIsShowForm(!isShowForm)} type='button' styleButton='primary' className='text-2xs font-medium px-2 py-1 text-secondary/90' name={isShowForm ? 'Cancelar' : 'Agregar pago diferido'}>
                {isShowForm ? null : <PlusIcon className='size-5 fill-secondary/90 stroke-none' />}
              </Button>
            </div>
          </>
        </FormSection >
      }

      {isShowForm &&
        <FormSection name='Cuota'>
          <>
            <FieldInput
              id='amount'
              name='Monto'
              isNumber
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              appendChild={<span className='text-secondary/80 text-2xs font-medium'>{currencies.find(c => c.currencyId === formData.currencyId)?.currencyName === "Cordobas" ? 'C$' : '$'}</span>}
            />
            <div className='flex [&>div]:w-full w-full [&>div]:mb-0 items-center space-x-3'>
              <FieldSelect
                id='currency'
                name='Moneda'
                value={formData.currencyId}
                onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value }))}
                options={currencies.map(c => ({ name: c.currencyName, value: c.currencyId }))}
              />

              <FieldSelect
                id='paymentMethod'
                name='Método de pago'
                value={formData.paymentMethodId}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: e.target.value }))}
                options={paymentMethods.map(pm => ({ name: pm.namePaymentMethod, value: pm.paymentMethodId }))}
              />
            </div>

            <div className='mt-2 flex space-x-1 justify-end'>
              <Button type='button' onClick={() => setIsShowForm(false)} name='Cancelar' styleButton='primary' className='px-2 py-1 text-2xs' />
              <Button type='button' onClick={handleAddPayment} name='Agregar' styleButton='secondary' className='px-2 py-1 text-2xs' />
            </div>
          </>
        </FormSection>
      }
    </>
  )
}
