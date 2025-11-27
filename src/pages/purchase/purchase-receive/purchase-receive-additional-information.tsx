import FormSection from '@/layout/form-section'
import { PurchaseOrderReceiptProps } from '@/types/types';

interface PurchaseAdditionalInformationProps {
  formData: PurchaseOrderReceiptProps;
}

export default function PurchaseReceiveAdditionalInformation({ formData }: PurchaseAdditionalInformationProps) {
  return (
    <FormSection name="Información adicional">
      <div className='space-y-3 md:text-2xs text-base font-medium'>
        <div className='space-y-1'>
          <span className='text-secondary/80'>Número de referencia</span>
          <p className='text-primary'>{formData.referenceNumber === "" ? "Ninguno" : formData.referenceNumber}</p>
        </div>
        <div className='space-y-1'>
          <span className='text-secondary/80'>Observaciones</span>
          <p className='text-primary'>{formData.observations === "" ? "Ningunaas" : formData.observations}</p>
        </div>
      </div>
    </FormSection >
  )
}