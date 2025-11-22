import type React from "react"
import { supabase } from "@/api/supabase-client"
import Button from "@/components/form/button"
import FieldInput from "@/components/form/field-input"
import FieldSelect from "@/components/form/field-select"
import { showToast } from "@/components/toast"
import { BillingIcon, DeleteIcon } from "@/icons/icons"
import FormSection from "@/layout/form-section"
import { currencyFormatter } from "@/lib/function"
import type { BankProps, CurrencyProps, PaymentMethodProps, ReturnProps, salePaymentDetailProps } from "@/types/types"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { useGeneralInformation } from "@/api/general-provider"

interface AddSalePaymentSystemProps {
  totalSale: number
  dollarChange: number
  setSalePaymentDetails: Dispatch<SetStateAction<salePaymentDetailProps[]>>
  salePaymentDetails: salePaymentDetailProps[]
  saleId?: string | undefined
  setPendingAmount?: (amount: number) => void
  setTotalPaid?: (amount: number) => void
  setChangeAmount?: (amount: number) => void
  setPending?: (amount: number) => void
  isQuotation: boolean;
  showPaymentSection: boolean;
  returns: ReturnProps[]
  currenciesReturns: Dispatch<SetStateAction<CurrencyProps[]>>
}

export default function AddSalePaymentSystem({
  totalSale,
  dollarChange,
  setSalePaymentDetails,
  salePaymentDetails,
  saleId,
  setPendingAmount,
  setTotalPaid,
  setChangeAmount,
  setPending,
  isQuotation,
  showPaymentSection,
  returns,
  currenciesReturns
}: AddSalePaymentSystemProps) {
  const { dollarValue = 0 } = useGeneralInformation();
  const EXCHANGE_RATE_TO_NIO = saleId ? dollarChange : dollarValue ?? 0;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([])
  const [banks, setBanks] = useState<BankProps[]>([])
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([])
  const [formData, setFormData] = useState({
    paymentMethod: "",
    bank: "",
    amount: "",
    currency: "",
    currenyName: "",
    details: "",
  })

  useEffect(() => {
    const handleLoadPaymentMethod = async () => {
      const { data } = await supabase.from("paymentMethod").select("*")
      const methods = data as PaymentMethodProps[]
      setPaymentMethods(methods)
      if (methods.length > 0) {
        setFormData((prev) => ({ ...prev, paymentMethod: methods[0].paymentMethodId }))
      }
    }

    const handleLoadBank = async () => {
      const { data } = await supabase.from("bank").select("*")
      const bankss = data as BankProps[]
      setBanks(bankss)
      if (bankss.length > 0) {
        setFormData((prev) => ({ ...prev, bank: bankss[0].bankId }))
      }
    }

    const handleLoadCurrencies = async () => {
      const { data } = await supabase.from("currency").select("*")
      const currs = data as CurrencyProps[]
      setCurrencies(currs)
      currenciesReturns(currs)
      if (currs.length > 0) {
        setFormData((prev) => ({ ...prev, currency: currs[0].currencyId }))
      }
    }

    handleLoadBank()
    handleLoadPaymentMethod()
    handleLoadCurrencies()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddPayment = () => {
    if (!formData.paymentMethod || !formData.amount || !formData.currency) {
      showToast("Debe seleccionar un método de pago y un monto", false)
      return
    }

    const paymentMethod = paymentMethods.find((pm) => pm.paymentMethodId === formData.paymentMethod)
    const currencyName = currencies.find((c) => c.currencyId === formData.currency)?.currencyName
    const bank = banks.find((b) => b.bankId === formData.bank)

    if (!paymentMethod) return

    if (!bank) {
      showToast("Debe seleccionar un banco válido", false)
      return
    }

    const newPayment: salePaymentDetailProps = {
      salePaymentDetailId: crypto.randomUUID().toString(),
      amount: Number.parseFloat(formData.amount),
      currencyId: formData.currency,
      paymentMethodId: formData.paymentMethod,
      currencyName: currencyName,
      bankId: isCash ? null : formData.bank,
      reference: formData.details || "",
      bankName: isCash ? "" : bank.bankName ,
      namePaymentMethod: paymentMethod.namePaymentMethod,
    }

    setSalePaymentDetails((prev) => [...prev, newPayment])

    setFormData((prev) => ({
      ...prev,
      amount: "",
      details: "",
    }))
  }

  const handleRemoveMethod = (id: string) => {
    setSalePaymentDetails((prev) => prev.filter((p) => p.salePaymentDetailId !== id))
  }

  const getPaymentIcon = (type: string | undefined) => {
    switch (type) {
      case "Tarjeta":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-4 sm:w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        )
      case "Efectivo":
        return <BillingIcon className="size-5 sm:size-4 fill-secondary/80 stroke-none" />
      case "Transferencia":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-4 sm:w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )
      default:
        return null
    }
  }

  const totalPaid = salePaymentDetails.reduce((sum, p) => {
    const isCordobas = currencies.find((c) => c.currencyId === p.currencyId)?.currencyName === "Cordobas"
    const amountInCordobas = isCordobas ? p.amount : p.amount * EXCHANGE_RATE_TO_NIO
    return sum + amountInCordobas
  }, 0)
  const pendingAmount = Math.max(0, totalSale - totalPaid)
  const changeAmount = totalPaid > totalSale ? totalPaid - totalSale : 0


  useEffect(() => {
    if (setPendingAmount) {
      setPendingAmount(pendingAmount)
    }
  }, [pendingAmount, setPendingAmount])

  useEffect(() => {
    if (setPending) {
      setPending(pendingAmount)
    }
  }, [pendingAmount, setPending])

  useEffect(() => {
    if (setTotalPaid) {
      setTotalPaid(totalPaid)
    }
  }, [totalPaid, setTotalPaid])

  useEffect(() => {
    if (setChangeAmount) {
      setChangeAmount(changeAmount)
    }
  }, [changeAmount, setChangeAmount])

  const selectedPaymentMethod = paymentMethods.find((pm) => pm.paymentMethodId === formData.paymentMethod);
  const isCash = selectedPaymentMethod?.namePaymentMethod === "Efectivo";

  return (

    <FormSection name={(!saleId || isQuotation) ? "Detalles de pago" : ""} >
      <>
        {(!saleId || isQuotation) && showPaymentSection && (
          <div className="space-y-3">
            <FieldSelect
              name="Método de pago"
              id="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              options={paymentMethods.map((paymentMethod) => ({
                name: paymentMethod.namePaymentMethod,
                value: paymentMethod.paymentMethodId,
              }))}
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <FieldInput
                name="Monto"
                id="amount"
                value={formData.amount}
                onChange={handleInputChange}
                appendChild={
                  <span className="text-secondary/80 text-2xs font-medium">
                    {(() => {
                      const selectedCurrency = currencies.find((c) => c.currencyId === formData.currency)
                      if (!selectedCurrency) return "C$"
                      return selectedCurrency.currencyName === "Cordobas" ? "C$" : "$"
                    })()}
                  </span>
                }
                className="w-full"
                isNumber
              />

              <FieldSelect
                name="Moneda"
                id="currency"
                value={formData.currency}
                onChange={handleInputChange}
                options={currencies.map((currency) => ({
                  name: currency.currencyName,
                  value: currency.currencyId,
                }))}
                className="w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              {!isCash && (
                <>
                  <FieldSelect
                    name="Banco"
                    id="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    options={banks.map((bank) => ({
                      name: bank.bankName,
                      value: bank.bankId,
                    }))}
                    className="w-full"
                  />
                  <FieldInput
                    name="Detalles (opcional)"
                    id="details"
                    value={formData.details}
                    onChange={handleInputChange}
                    placeholder="Ej: referencia"
                    className="w-full"
                  />
                </>)}
            </div>
            {isCash && (
              <FieldInput
                name="Detalles (opcional)"
                id="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="Ej: referencia"
              />
            )}

            <div className="flex justify-end">
              <Button
                styleButton="secondary"
                type="button"
                className="py-1.5 px-2.5 text-2xs"
                name="Agregar pago"
                onClick={handleAddPayment}
              />
            </div>
          </div>
        )}
        {(
          salePaymentDetails.length > 0 && !returns.length && (
            <div className="overflow-hidden mt-4">
              <h2 className="font-[550] text-lg sm:text-base mb-3 text-secondary/90">Resumen de pago</h2>
              <ul className="space-y-3 border py-1 border-gray-300 rounded-lg">
                {salePaymentDetails.map((method, index) => (
                  <li
                    key={index}
                    className={`flex items-center justify-between ${salePaymentDetails.length - 1 !== index ? "border-b" : ""
                      } border-gray-300 py-3 sm:py-2 px-4 sm:px-3 gap-3 sm:gap-2`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex space-x-1 items-center px-3 py-1.5 rounded-full font-medium bg-[#F3F3F3]">
                        {getPaymentIcon(method.namePaymentMethod)}
                        <span className="font-medium text-secondary/80 text-sm sm:text-xs">
                          {method.namePaymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="font-[550] text-base sm:text-sm text-primary">
                          {(() => {
                            const currency = currencies.find((c) => c.currencyId === method.currencyId)
                            return currency
                              ? `${currencyFormatter(method.amount, currency.currencyName === "Cordobas" ? "NIO" : "USD")}`
                              : ""
                          })()}
                        </span>

                        <span className="text-sm sm:text-xs text-secondary/80 font-medium">
                          {(() => {
                            const currency = currencies.find((c) => c.currencyId === method.currencyId)
                            return currency ? ` (${currency.currencyName === "Cordobas" ? "NIO" : "USD"})` : ""
                          })()}
                        </span>
                        {method.namePaymentMethod !== "Efectivo" && (
                          <span className="text-sm sm:text-xs text-secondary/80 font-medium ml-1">
                            {method.bankName ? `(${method.bankName})` : ""}
                          </span>
                        )}
                        {method.reference && (
                          <p className="text-sm sm:text-xs text-secondary/80 font-medium">{method.reference}</p>
                        )}
                      </div>
                    </div>
                    {(!saleId || isQuotation) && (
                      <Button
                        styleButton="primary"
                        type="button"
                        className="p-2 sm:p-1.5 self-end sm:self-auto"
                        onClick={() => handleRemoveMethod(method.salePaymentDetailId)}
                      >
                        <DeleteIcon className="size-5 sm:size-4 stroke-none fill-secondary/80" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </>
    </FormSection>
  )
}
