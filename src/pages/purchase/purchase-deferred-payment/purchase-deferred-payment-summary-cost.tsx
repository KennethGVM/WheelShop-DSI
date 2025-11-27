import { useGeneralInformation } from '@/api/general-provider';
import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function'
import { CurrencyProps, PurchaseDeferredPaymentProps, PurchaseProps } from '@/types/types'

interface PurchaseDeferredPaymentSummaryCostProps {
  purchase?: PurchaseProps;
  payments: PurchaseDeferredPaymentProps[];
  currencies: CurrencyProps[];
}

export default function PurchaseDeferredPaymentSummaryCost({
  purchase,
  payments,
  currencies,
}: PurchaseDeferredPaymentSummaryCostProps) {
  const { dollarValue = 0 } = useGeneralInformation();
  const purchaseCurrency = purchase?.currencyName;
  const currentCurrency = purchaseCurrency === "Cordobas" ? "NIO" : "USD";

  const getCurrencyName = (currencyId: string) =>
    currencies.find(c => c.currencyId === currencyId)?.currencyName;

  const convertToPurchaseCurrency = (amount: number, paymentCurrencyId: string, dollarChange?: number | null) => {
    if (!dollarValue) return amount;
    const paymentCurrency = getCurrencyName(paymentCurrencyId);

    if (paymentCurrency === "Dolares" && purchaseCurrency === "Cordobas") {
      return amount * (dollarChange ?? dollarValue);
    } else if (paymentCurrency === "Cordobas" && purchaseCurrency === "Dolares") {
      return amount / (dollarChange ?? dollarValue);
    }
    return amount;
  };

  const totalPaid = payments.reduce((acc, payment) => {
    return acc + convertToPurchaseCurrency(payment.amount, payment.currencyId, payment.dollarChange);
  }, 0);

  const pendingBalance = (purchase?.total ?? 0) - totalPaid;

  return (
    <FormSection className='py-3'>
      <div className='grid grid-cols-3'>
        <div className='flex flex-col space-y-1'>
          <span className='font-medium text-sm text-secondary'>Total comprado</span>
          <span className='font-medium text-sm text-secondary/80'>
            {currencyFormatter(purchase?.total ?? 0, currentCurrency)}
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
