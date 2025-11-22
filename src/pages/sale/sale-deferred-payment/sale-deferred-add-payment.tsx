import { useGeneralInformation } from '@/api/general-provider'
import { useRolePermission } from '@/api/permissions-provider'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import FieldSelect from '@/components/form/field-select'
import { showToast } from '@/components/toast'
import { CreditPaymentIcon, PlusIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { getPermissions } from '@/lib/function'
import { BankProps, CurrencyProps, PaymentMethodProps, SaleDeferredPaymentProps, SaleProps } from '@/types/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface SaleDeferredAddPaymentProps {
  payments: SaleDeferredPaymentProps[];
  saleId: string;
  allPayments: SaleDeferredPaymentProps[];
  sale: SaleProps | null;
  paymentMethods: PaymentMethodProps[];
  currencies: CurrencyProps[];
  setNewPayments: Dispatch<SetStateAction<SaleDeferredPaymentProps[]>>;
  banks: BankProps[];
  isAllowToSale: boolean;
}

export default function SaleDeferredAddPayment({ currencies, paymentMethods, saleId, allPayments, sale, setNewPayments, banks, isAllowToSale }: SaleDeferredAddPaymentProps) {
  const [isShowForm, setIsShowForm] = useState<boolean>(false);
  const { dollarValue = 0 } = useGeneralInformation();
  const [formData, setFormData] = useState({
    amount: 0,
    currencyId: '',
    paymentMethodId: '',
    balance: 0,
    bankId: '',
    dollarChange: 0,
  });
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canPaymentSale = getPermissions(permissions, "Pedidos", "Registrar pagos")?.canAccess;

  useEffect(() => {
    if (currencies.length > 0 || paymentMethods.length > 0) {
      setFormData(prev => ({
        ...prev,
        currencyId: currencies[0]?.currencyId ?? '',
        paymentMethodId: paymentMethods[0]?.paymentMethodId ?? '',
        bankId: banks[0]?.bankId ?? '',
        dollarChange: dollarValue ?? 0,
      }));
    }
  }, [currencies, paymentMethods, banks, dollarValue]);

  const handleAddPayment = () => {
    if (!dollarValue) return;

    const { amount, currencyId, paymentMethodId, bankId } = formData;

    if (!amount || !currencyId || !paymentMethodId || !sale || !bankId) return;

    const formCurrencyName = currencies.find(c => c.currencyId === currencyId)?.currencyName;
    const saleCurrencyName = "Cordobas"

    const amountInSaleCurrency =
      formCurrencyName === "Dolares" && saleCurrencyName === "Cordobas"
        ? amount * dollarValue
        : amount;

    // se calcula el total pagado tomando en cuenta el cambio de dólar de cada abono anterior
    const totalPaidInSaleCurrency = allPayments.reduce((acc, payment) => {
      const paymentCurrencyName = currencies.find(c => c.currencyId === payment.currencyId)?.currencyName
      const convertedAmount =
        paymentCurrencyName === "Dolares" && saleCurrencyName === "Cordobas"
          ? payment.amount * (payment.dollarChange || 0)
          : payment.amount

      return acc + convertedAmount
    }, 0)

    const remainingBalance = sale.total - totalPaidInSaleCurrency;

    if (amountInSaleCurrency > remainingBalance + 0.01) {
      showToast('Abono no puede exceder el total vendido', false);
      return;
    }

    const currentBalance = remainingBalance - amountInSaleCurrency;

    const newPayment: SaleDeferredPaymentProps = {
      saleDeferredPaymentId: crypto.randomUUID(),
      saleId: saleId ?? '',
      createdAt: new Date(),
      amount,
      currencyId,
      paymentMethodId,
      balance: currentBalance,
      state: true,
      paymentCode: '',
      bankId: showBankSelect ? bankId : '',
      dollarChange: dollarValue,
    };

    setNewPayments(prev => [...prev, newPayment]);

    setFormData({
      amount: 0,
      balance: 0,
      currencyId: currencies[0]?.currencyId ?? '',
      paymentMethodId: paymentMethods[0]?.paymentMethodId ?? '',
      bankId: banks[0]?.bankId ?? '',
      dollarChange: dollarValue,
    });

    setIsShowForm(false);
  };

  const selectedPaymentMethod = paymentMethods.find(pm => pm.paymentMethodId === formData.paymentMethodId);
  const showBankSelect = selectedPaymentMethod?.namePaymentMethod === "Transferencia" || selectedPaymentMethod?.namePaymentMethod === "Tarjeta";

  return (
    <>
      {sale?.state !== 1 &&
        <FormSection>
          <>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2 bg-[#ffeb78] px-2 py-1 rounded-lg w-fit'>
                <CreditPaymentIcon className='size-4 fill-secondary/80 stroke-none' />
                <span className='text-secondary/80 font-medium text-2xs'>No pagado</span>
              </div>

              {canPaymentSale && isAllowToSale &&
                <Button onClick={() => setIsShowForm(!isShowForm)} type='button' styleButton='primary' className='text-2xs font-medium px-2 py-1 text-secondary/90' name={isShowForm ? 'Cancelar' : 'Agregar pago diferido'}>
                  {isShowForm ? null : <PlusIcon className='size-5 fill-secondary/90 stroke-none' />}
                </Button>
              }
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
            {showBankSelect && (

              <div className='flex [&>div]:w-full w-full [&>div]:mb-0 items-center space-x-3 mt-4 mb-2'>
                <FieldSelect
                  id='bankId'
                  name='Banco'
                  value={formData.bankId}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankId: e.target.value }))}
                  options={banks.map(bank => ({ name: bank.bankName, value: bank.bankId }))}
                />


              </div>
            )}
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
