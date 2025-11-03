import FieldInput from '@/components/form/field-input'
import TextArea from '@/components/form/text-area'
import FormSection from '@/layout/form-section'
import { PurchaseProps } from '@/types/types';

interface PurchaseAdditionalInformationProps {
  formData: Omit<PurchaseProps, 'createdAt' | 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>;
  handleChangeFormData: (name: keyof Omit<PurchaseProps, 'createdAt' | 'purchaseOrderId' | 'state' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>, value: string | number | Date) => void;
}

export default function PurchaseAdditionalInformation({ formData, handleChangeFormData }: PurchaseAdditionalInformationProps) {
  return (
    <FormSection name="Información adicional">
      {formData.state < 1 ? (
        <>
          <FieldInput
            name="Numero de referencia"
            id="reference-number"
            value={formData.referenceNumber}
            onChange={(e) => handleChangeFormData('referenceNumber', e.target.value)}
          />
          <TextArea
            name="Observaciones"
            id="observations"
            className="mb-0"
            rows={4}
            value={formData.observations}
            onChange={(e) => handleChangeFormData('observations', e.target.value)}
          />
        </>
      ) : (
        <div className='space-y-3'>
          <div className='text-2xs font-medium space-y-1'>
            <span className='text-secondary/80'>Número de referencia</span>
            <p className='text-primary'>{formData.referenceNumber ?? 'Ninguno'}</p>
          </div>
          <div className='text-2xs font-medium space-y-1'>
            <span className='text-secondary/80'>Observaciones</span>
            <p className='text-primary'>{formData.observations ?? 'Ninguna'}</p>
          </div>
        </div>
      )}
    </FormSection >
  )
}