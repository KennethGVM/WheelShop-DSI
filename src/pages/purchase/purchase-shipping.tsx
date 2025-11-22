import DateTimePicker from '@/components/form/datetimepicker'
import FieldInput from '@/components/form/field-input'
import FormSection from '@/layout/form-section'
import { PurchaseProps } from '@/types/types';

interface PurchaseShippingProps {
  currencyName: string;
  formData: Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>;
  handleChangeFormData: (name: keyof Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>, value: string | number | Date) => void;
}

export default function PurchaseShipping({ currencyName, formData, handleChangeFormData }: PurchaseShippingProps) {
  return (
    <FormSection name="Detalles del envío">
      <div className="flex md:flex-row flex-col items-center md:space-x-4 md:space-y-0 space-y-3">
        <DateTimePicker
          id="date"
          name="Fecha de llegada"
          value={formData.arrivalDate ? new Date(formData.arrivalDate) : null}
          onChange={(value) => handleChangeFormData('arrivalDate', value)}
          disabled={formData.state === 1}
        />
        <FieldInput
          isNumber
          className="mb-0 w-full"
          name="Costo del envío"
          value={formData.shippingCost}
          onChange={(e) => handleChangeFormData('shippingCost', Number(e.target.value))}
          appendChild={<span className="text-2xs font-medium text-secondary/80">{currencyName === 'Cordobas' ? 'C$' : '$'}</span>}
          disabled={formData.state === 1}
        />
      </div>
    </FormSection >
  )
}