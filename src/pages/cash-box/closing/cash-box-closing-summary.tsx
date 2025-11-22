import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function'

interface CashBoxClosingSummaryProps {
  totalCordobas: number
  totalDollars: number
  totalCordobaCoins: number
  totalCordobaBank: number
  totalDollarBank: number
  totalCordobaTransfer: number
  totalDollarTransfer: number
  generalTotal: number
  cashBoxSummary: {
    beginningbalance?: number
    income?: number
    expenses?: number
    systemtotal?: number
  } | undefined
}

export default function CashBoxClosingSummary({ totalCordobas, totalDollars, totalCordobaCoins, totalCordobaBank, totalDollarBank, totalCordobaTransfer, totalDollarTransfer, generalTotal, cashBoxSummary }: CashBoxClosingSummaryProps) {
  return (
    <>
      <FormSection name='Resumen de cierre' className='px-0 pb-3' classNameLabel='mx-4'>
        <>
          <div className='space-y-2 md:text-2xs text-base text-secondary/80 font-medium'>
            <div className='flex items-center justify-between px-4'>
              <span>Total billetes córdoba:</span>
              <span>{currencyFormatter(totalCordobas)}</span>
            </div>

            <div className='flex items-center justify-between px-4'>
              <span>Total billetes dólar:</span>
              <span>{currencyFormatter(totalDollars)}</span>
            </div>

            <div className='flex items-center justify-between px-4'>
              <span>Total monedas córdoba:</span>
              <span>{currencyFormatter(totalCordobaCoins)}</span>
            </div>

            <div className='flex items-center justify-between px-4 border-t pt-2'>
              <span>Total banco córdoba:</span>
              <span>{currencyFormatter(totalCordobaBank)}</span>
            </div>

            <div className='flex items-center justify-between px-4'>
              <span>Total banco dólar:</span>
              <span>{currencyFormatter(totalDollarBank)}</span>
            </div>

            <div className='flex items-center justify-between px-4 border-t pt-2'>
              <span>Total transferencia córdoba:</span>
              <span>{currencyFormatter(totalCordobaTransfer)}</span>
            </div>

            <div className='flex items-center justify-between px-4'>
              <span>Total transferencia dólar:</span>
              <span>{currencyFormatter(totalDollarTransfer)}</span>
            </div>
          </div>

          <div className='flex items-center justify-between px-4 mt-2 border-t pt-2'>
            <span className='text-primary font-semibold md:text-2xs text-base'>Total:</span>
            <span className='text-primary font-semibold md:text-2xs text-base'>{currencyFormatter(generalTotal)}</span>
          </div>
        </>
      </FormSection>

      <FormSection name='Resumen de ventas' className='px-0' classNameLabel='mx-4'>
        <>
          <div className='px-4 space-y-2 text-secondary/80 font-medium md:text-2xs text-base'>
            <div className='flex items-center justify-between'>
              <span>Saldo inicial:</span>
              <span>{currencyFormatter(cashBoxSummary?.beginningbalance || 0)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Ingresos:</span>
              <span>{currencyFormatter(cashBoxSummary?.income || 0)}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Egresos:</span>
              <span>{currencyFormatter(cashBoxSummary?.expenses || 0)}</span>
            </div>
          </div>
          <div className='flex items-center justify-between mt-2 border-t pt-2 px-4'>
            <span className='text-primary font-semibold md:text-2xs text-base'>Total en sistema:</span>
            <span className='text-primary font-semibold md:text-2xs text-base'>{currencyFormatter(cashBoxSummary?.systemtotal || 0)}</span>
          </div>
          <div className='flex items-center justify-between mt-2 px-4'>
            <span className={`${(cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas) === 0 ? 'text-green-700' : 'text-redprimary'} font-semibold md:text-2xs text-base`}>Faltante:</span>
            <span className={`${(cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas) === 0 ? 'text-green-700' : 'text-redprimary'} font-semibold md:text-2xs text-base`}>{currencyFormatter((cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas))}</span>
          </div>
        </>
      </FormSection>
    </>
  )
}
