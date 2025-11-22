import Button from "@/components/form/button";
import FieldInput from "@/components/form/field-input";
import FormSection from "@/layout/form-section";
import { BankProps, CurrencyProps } from "@/types/types";
import { Dispatch, SetStateAction } from "react";

interface CashBoxClosingBanksProps {
  currencies: CurrencyProps[];
  bankAmounts: Array<{ bankId: string; currencyId: string; value: number }>;
  setBankAmounts: Dispatch<SetStateAction<{ bankId: string; currencyId: string; value: number }[]>>;
  selectedCurrency: CurrencyProps | undefined;
  setSelectedCurrency: Dispatch<SetStateAction<CurrencyProps | undefined>>;
  banks: BankProps[];
  isEditing?: boolean;
}

export default function CashBoxClosingBanks({ isEditing, setBankAmounts, banks, currencies, bankAmounts, selectedCurrency, setSelectedCurrency }: CashBoxClosingBanksProps) {
  const getBankValue = (bankId: string, currencyId: string) => {
    return bankAmounts.find(b => b.bankId === bankId && b.currencyId === currencyId)?.value || ''
  }

  const handleBankValueChange = (bankId: string, currencyId: string, value: number) => {
    setBankAmounts(prev => {
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

  return (
    <>
      <FormSection name='Divisa'>
        <div className='flex items-center'>
          {currencies.map((currency, index) => (
            <Button
              key={currency.currencyId}
              type='button'
              name={currency.currencyName}
              onClick={() => setSelectedCurrency(currency)}
              styleButton={selectedCurrency?.currencyId === currency.currencyId ? 'none' : 'primary'}
              className={`px-3 md:text-2xs text-base py-1.5 ${index === 0 ? 'rounded-r-none border-r-0' :
                index === currencies.length - 1 ? 'rounded-l-none border-l-0' :
                  'rounded-none border-x-0'
                } ${selectedCurrency?.currencyId === currency.currencyId ? 'bg-[#e0e0e0] shadow-pressed' : ''}`}
            />
          ))}
        </div>
      </FormSection>

      <FormSection name="Tarjetas" className='px-0 pb-2' classNameLabel='mx-4 mb-2'>
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
                      readOnly={isEditing}
                      className="mb-0"
                      appendChild={<span className="md:text-2xs text-base text-secondary/80">{selectedCurrency?.currencyName === 'Cordobas' ? 'C$' : '$'}</span>}
                      value={getBankValue(bankId, selectedCurrency?.currencyId || '')}
                      onChange={(e) => handleBankValueChange(bankId, selectedCurrency?.currencyId || '', Number(e.target.value))}
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
