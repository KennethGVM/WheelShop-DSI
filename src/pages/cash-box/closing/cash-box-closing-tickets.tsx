import Button from "@/components/form/button";
import FieldInput from "@/components/form/field-input";
import FormSection from "@/layout/form-section";
import { currencyFormatter } from "@/lib/function";
import { DenominationProps } from "@/types/types";
import { Dispatch, SetStateAction, useState } from "react";

interface CashBoxClosingTicketsProps {
  isEditing: boolean;
  quantities: Array<{ denominationId: string; quantity: number; total?: number; }>;
  setQuantities: Dispatch<SetStateAction<{ denominationId: string; quantity: number; total: number }[]>>;
  denominations: DenominationProps[];
}

export default function CashBoxClosingTickets({ isEditing, quantities, denominations, setQuantities }: CashBoxClosingTicketsProps) {
  const [selectedDenomination, setSelectedDenomination] = useState<number>(0)

  const tabs = [
    {
      id: 0,
      title: 'Córdoba',
      filter: (d: DenominationProps) => !d.isCoin && d.currencyName?.toLowerCase() === 'cordobas'
    },
    {
      id: 1,
      title: 'Dólar',
      filter: (d: DenominationProps) => !d.isCoin && d.currencyName?.toLowerCase() === 'dolares'
    },
    {
      id: 2,
      title: 'Monedas',
      filter: (d: DenominationProps) => d.isCoin && d.currencyName?.toLowerCase() === 'cordobas'
    }
  ]

  const currentTab = tabs.find((t) => t.id === selectedDenomination)
  const filteredDenominations = denominations.filter(currentTab?.filter || (() => false))
  const getQuantity = (denominationId: string) => {
    return quantities.find((q) => q.denominationId === denominationId)?.quantity || ''
  }

  const getTotal = (denominationId: string) => {
    return quantities.find((q) => q.denominationId === denominationId)?.total?.toFixed(2) || '0.00'
  }

  const handleQuantityChange = (denominationId: string, amount: number, quantity: number) => {
    setQuantities((prev) => {
      const existing = prev.find((item) => item.denominationId === denominationId)
      const total = quantity * amount

      if (existing) {
        return prev.map((item) =>
          item.denominationId === denominationId ? { ...item, quantity, total } : item
        )
      } else {
        return [...prev, { denominationId, quantity, total }]
      }
    })
  }

  return (
    <>
      <FormSection name='Denominaciones'>
        <div className="flex items-center">
          {tabs.map((tab, index) => (
            <Button
              key={tab.id}
              type='button'
              name={tab.title}
              onClick={() => setSelectedDenomination(tab.id)}
              styleButton={selectedDenomination === tab.id ? 'none' : 'primary'}
              className={`px-3 md:text-2xs text-base py-1.5 ${index === 0 ? 'rounded-r-none border-r-0' :
                index === tabs.length - 1 ? 'rounded-l-none border-l-0' :
                  'rounded-none border-x-0'
                } ${selectedDenomination === tab.id ? 'bg-[#e0e0e0] shadow-pressed' : ''}`}
            />
          ))}
        </div>
      </FormSection>

      {currentTab && (
        <FormSection name={currentTab.title} className='px-0 pb-2' classNameLabel='mx-4 mb-2'>
          <div className='rounded-md'>
            <table className="w-full text-left">
              <thead className="text-primary px-4 font-semibold border-b md:text-2xs text-base border-gray-300">
                <tr>
                  <th className="px-4 py-2 font-semibold">Denominación</th>
                  <th className="px-2 py-2 font-semibold">Cantidad</th>
                  <th className="px-4 py-2 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredDenominations.map(({ denominationId, name, amount }, index) => (
                  <tr key={denominationId} className={`md:text-2xs text-base font-medium text-secondary/80 ${index !== filteredDenominations.length - 1 ? 'border-b' : ''}`}>
                    <td className="px-4 py-2 w-[60%]">{name}</td>
                    <td className="px-2 py-2">
                      <FieldInput
                        isNumber
                        readOnly={isEditing}
                        className="mb-0 w-32"
                        value={getQuantity(denominationId)}
                        onChange={(e) =>
                          handleQuantityChange(denominationId, amount, Number(e.target.value))
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-right">{currencyFormatter(getTotal(denominationId), selectedDenomination !== 1 ? 'NIO' : 'USD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormSection>
      )}
    </>
  )
}
