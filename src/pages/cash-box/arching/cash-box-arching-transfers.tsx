import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input';
import FormSection from '@/layout/form-section'
import { BankProps, CurrencyProps } from '@/types/types';
import { Dispatch, SetStateAction } from 'react';

interface CashBoxArchingBanksProps {
  currencies: CurrencyProps[];
  selectedTransfer: CurrencyProps | undefined;
  setSelectedTransfer: Dispatch<SetStateAction<CurrencyProps | undefined>>;
  setBankTransfers: Dispatch<SetStateAction<{ bankId: string; currencyId: string; value: number }[]>>;
  bankTransfers: Array<{ bankId: string; currencyId: string; value: number }>;
  banks: BankProps[];
  isEditing?: boolean;
}

export default function CashBoxArchingTransfers({ isEditing, bankTransfers, setBankTransfers, banks, currencies, selectedTransfer, setSelectedTransfer }: CashBoxArchingBanksProps) {
  const handleBankTransferChange = (bankId: string, currencyId: string, value: number) => {
    setBankTransfers(prev => {
      const existing = prev.find(item => item.bankId === bankId && item.currencyId === currencyId)
      if (existing) {
        return prev.map(item =>
          item.bankId === bankId && item.currencyId === currencyId
            ? { ...item, value }
            : item
        )
      } else {
        return [...prev, { bankId, currencyId, value }]
      }
    })
  }

  const getBankTransferValue = (bankId: string, currencyId: string) => {
    return bankTransfers.find(t => t.bankId === bankId && t.currencyId === currencyId)?.value || ''
  }

  return (
    <>
      <FormSection name='Divisa'>
        <div className='flex items-center'>
          {currencies.map((currency, index) => (
            <Button
              key={currency.currencyId}
              type='button'
              name={currency.currencyName}
              onClick={() => setSelectedTransfer(currency)}
              styleButton={selectedTransfer?.currencyId === currency.currencyId ? 'none' : 'primary'}
              className={`px-3 md:text-2xs text-base py-1.5 ${index === 0 ? 'rounded-r-none border-r-0' :
                index === currencies.length - 1 ? 'rounded-l-none border-l-0' :
                  'rounded-none border-x-0'
                } ${selectedTransfer?.currencyId === currency.currencyId ? 'bg-[#e0e0e0] shadow-pressed' : ''}`}
            />
          ))}
        </div>
      </FormSection>

      <FormSection name="Transferencias" className='px-0 pb-2' classNameLabel='mx-4 mb-2'>
        <div className='rounded-md'>
          <table className="w-full text-left">
            <thead className="text-primary px-4 font-semibold border-b md:text-2xs text-base border-gray-300">
              <tr>
                <th className="px-4 py-2 font-semibold">Banco</th>
                <th className="px-4 py-2 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {banks.map(({ bankId, bankName }, index) => (
                <tr key={bankId} className={`md:text-2xs text-base font-medium text-secondary/80 ${index !== banks.length - 1 ? 'border-b' : ''}`}>
                  <td className="px-4 py-2 w-[60%]">{bankName}</td>
                  <td className="px-2 py-2">
                    <FieldInput
                      isNumber
                      className="mb-0"
                      readOnly={isEditing}
                      appendChild={<span className="md:text-2xs text-base text-secondary/80">{selectedTransfer?.currencyName === 'Cordobas' ? 'C$' : '$'}</span>}
                      value={getBankTransferValue(bankId, selectedTransfer?.currencyId || '')}
                      onChange={(e) =>
                        handleBankTransferChange(bankId, selectedTransfer?.currencyId || '', Number(e.target.value))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>
    </>
  )
}
