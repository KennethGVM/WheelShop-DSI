import { useGeneralInformation } from '@/api/general-provider';
import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function'
import {  CurrencyProps,SaleDeferredPaymentProps, SaleProps } from '@/types/types'

interface SaleDeferredPaymentSummaryCostProps {
  sale?: SaleProps;
  payments: SaleDeferredPaymentProps[];
  currencies: CurrencyProps[];
}

export default function SaleDeferredPaymentSummaryCost({
  sale,
  payments,
  currencies,
}: SaleDeferredPaymentSummaryCostProps) {
  const { dollarValue = 0 } = useGeneralInformation();
  const saleCurrency = "Cordobas" 
  const currentCurrency = saleCurrency === "Cordobas" ? "NIO" : "USD";

  const getCurrencyName = (currencyId: string) =>
    currencies.find(c => c.currencyId === currencyId)?.currencyName;

  const convertToPurchaseCurrency = (amount: number, paymentCurrencyId: string,dollarChange?: number | null) => {
    if (!dollarValue) return amount;
    const paymentCurrency = getCurrencyName(paymentCurrencyId);

    if (paymentCurrency === "Dolares" && saleCurrency === "Cordobas") {
      return amount * (dollarChange ?? dollarValue);
    } 
    return amount;
  };

  const totalPaid = payments.reduce((acc, payment) => {
    return acc + convertToPurchaseCurrency(payment.amount, payment.currencyId,payment.dollarChange);
  }, 0);

  const pendingBalance = (sale?.total ?? 0) - totalPaid;

  return (
    <FormSection className='py-3'>
      <div className='grid grid-cols-3'>
        <div className='flex flex-col space-y-1'>
          <span className='font-medium text-sm text-secondary'>Total vendido</span>
          <span className='font-medium text-sm text-secondary/80'>
            {currencyFormatter(sale?.total ?? 0, currentCurrency)}
          </span>
        </div>

        <div className='flex flex-col space-y-1 pl-5 border-x border-gray-30'>
          <span className='font-medium text-sm text-secondary'>Total abonado</span>
          <span className='font-medium text-sm text-secondary/80'>
            {currencyFormatter(totalPaid, currentCurrency)}
          </span>
        </div>

        <div className='flex flex-col space-y-1 pl-5'>
          <span className='font-medium text-sm text-secondary'>Saldo pendiente</span>
          <span className='font-medium text-sm text-secondary/80'>
            {currencyFormatter(pendingBalance, currentCurrency)}
          </span>
        </div>
      </div>
    </FormSection>
  );
}
