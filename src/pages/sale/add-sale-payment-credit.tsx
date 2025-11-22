
import { useRolePermission } from "@/api/permissions-provider"
import Button from "@/components/form/button"
import CheckBox from "@/components/form/check-box"
import DateTimePicker from "@/components/form/datetimepicker"
import FieldSelect from "@/components/form/field-select"
import FormSection from "@/layout/form-section"
import { getPermissions } from "@/lib/function"
import type { SaleProps } from "@/types/types"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export interface AddSalePaymentCreditProps {
  formData: Omit<SaleProps, "saleId" | "salesCode" | "products" | "salePaymentDetails" | "return">
  setFormData: Dispatch<
    SetStateAction<Omit<SaleProps, "saleId" | "salesCode" | "products" | "salePaymentDetails" | "return">>
  >
  setShowPaymentSection: Dispatch<SetStateAction<boolean>>
  saleId?: string
  isModalOpen: { sendInvoice: boolean }
  isQuotation: boolean
  salesCode: string
  isAllowToSale: boolean
}

export default function AddSalePaymentCredit({
  setFormData,
  formData,
  setShowPaymentSection,
  saleId,
  isQuotation,
  isAllowToSale
}: AddSalePaymentCreditProps) {
  const navigate = useNavigate()
  const [showSelect, setShowSelect] = useState(!formData.typeSale)
  const [paymentTerm, setPaymentTerm] = useState("7")
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [isPaymentVisible, setIsPaymentVisible] = useState(false)
  // Nuevo estado para el mensaje personalizado del modal
  // Nuevo estado para el número de teléfono del cliente

  const { userPermissions } = useRolePermission()
  const permissions = userPermissions?.permissions || null
  const canSetPaymentCredit = getPermissions(permissions, "Pedidos", "Establecer términos de pago")?.canAccess

  const netDays = (() => {
    if (formData.createdAt && formData.expirationDate) {
      const created = new Date(formData.createdAt)
      const expiration = new Date(formData.expirationDate)
      const diffTime = expiration.getTime() - created.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
    return null
  })()

  useEffect(() => {
    if ((saleId || isQuotation) && formData.expirationDate) {
      setCustomDate(new Date(formData.expirationDate))
    }
  }, [saleId, formData.expirationDate])

  useEffect(() => {
    if (!showSelect || (!isQuotation && saleId)) return
    if (paymentTerm === "fija") {
      const today = new Date()
      setFormData((prev) => ({
        ...prev,
        expirationDate: today,
        state: 2,
      }))
      setCustomDate(today)
    } else {
      const days = Number.parseInt(paymentTerm)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + days)
      setCustomDate(futureDate)
      setFormData((prev) => ({
        ...prev,
        expirationDate: futureDate,
        state: 2,
      }))
    }
  }, [paymentTerm, setFormData, showSelect, isQuotation, saleId])

  const handleCheck = (checked: boolean) => {
    setShowSelect(checked)
    if (checked) {
      setPaymentTerm("7")
      setFormData((prev) => ({
        ...prev,
        typeSale: 0,
        state: 2,
      }))
    } else {
      setCustomDate(null)
      setFormData((prev) => ({
        ...prev,
        expirationDate: null,
        typeSale: 1,
        state: 1,
      }))
    }
  }

  const handleDateChange = (date: Date) => {
    setCustomDate(date)
    setFormData((prev) => ({
      ...prev,
      expirationDate: date,
    }))
  }

  const handleTermSelect = (value: string) => {
    setPaymentTerm(value)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return ""
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
    return date.toLocaleDateString("es-ES", options)
  }

  const togglePaymentSection = () => {
    setIsPaymentVisible(!isPaymentVisible)
    setShowPaymentSection(!isPaymentVisible)
  }

  return (
<>
  {canSetPaymentCredit &&
    (!saleId || (saleId && !formData.typeSale) || (isQuotation && !formData.stateQuotation)) && isAllowToSale && (
      <FormSection className="md:p-5 p-0">
        <>
          <CheckBox
            className="text-2xs md:ml-0 md:my-0 my-4"
            initialValue={!formData.typeSale}
            name="Pago con vencimiento posterior"
            onChange={handleCheck}
            disabled={!isQuotation && !!saleId}
            classNameLabel="md:text-2xs text-base"
          />
          {showSelect && (
            <>
              {(!saleId || isQuotation) && (
                <div className="mt-4 w-full flex md:flex-row flex-col md:space-x-3 space-x-0 md:space-y-0 space-y-5">
                  <div className="w-full md:w-1/2">
                    <FieldSelect
                      name="Términos de pago"
                      onChange={(e) => handleTermSelect(e.target.value)}
                      value={paymentTerm}
                      options={[
                        { name: "En un plazo de 7 dias", value: "7" },
                        { name: "En un plazo de 15 dias", value: "15" },
                        { name: "En un plazo de 30 dias", value: "30" },
                        { name: "En un plazo de 45 dias", value: "45" },
                        { name: "En un plazo de 60 dias", value: "60" },
                        { name: "En un plazo de 90 dias", value: "90" },
                        { name: "Fecha Fija", value: "fija" },
                      ]}
                    />
                  </div>
                  {paymentTerm === "fija" && (
                    <div className="w-full md:w-1/2">
                      <DateTimePicker
                        id="date"
                        name="Fecha de emisión"
                        value={formData.expirationDate}
                        onChange={(date: Date) => handleDateChange(date)}
                      />
                    </div>
                  )}
                </div>
              )}
              {customDate && (
                <div className="mt-4 text-sm text-secondary/80">
                  {(formData.expirationDate || isQuotation) && (
                    <p className="font-bold text-sm md:mx-0 mx-4">
                      Pago vencido el {formatDate(formData.expirationDate)}
                      {netDays !== null && saleId ? ` (Net ${netDays})` : ` (Net ${netDays})`}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      </FormSection>
    )}

  <div className={`flex md:flex-row flex-col items-center justify-end md:space-x-2 space-y-2 md:space-y-0 mt-3 ${!canSetPaymentCredit ? "border-t pt-3" : ""}`}>
    {(!saleId || (isQuotation && !formData.stateQuotation)) && formData.typeSale === 1 && isAllowToSale && (
      <Button
        type="button"
        name="Ir a pagar"
        styleButton="secondary"
        className="bg-primary md:w-auto w-full text-center flex items-center justify-center md:mb-0 mb-2 md:mx-0 mx-3 px-2 text-white md:py-1.5 py-3 md:text-2xs text-sm font-medium"
        onClick={togglePaymentSection}
      />
    )}
    {saleId && formData.typeSale === 0 && !isQuotation && (
      <Button
        type="button"
        name="Pagos diferidos"
        styleButton="secondary"
        className="bg-primary md:w-auto w-full text-center flex items-center justify-center md:mb-0 mb-2 md:mx-0 mx-3 px-2 text-white md:py-1.5 py-3 md:text-2xs text-sm font-medium"
        onClick={() => navigate(`/sales/payment/add/${saleId}`)}
      />
    )}
  </div>
</>

  )
}
