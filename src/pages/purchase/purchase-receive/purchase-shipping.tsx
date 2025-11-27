import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function';
import { PurchaseOrderReceiptProps } from '@/types/types';

interface PurchaseShippingProps {
  formData: PurchaseOrderReceiptProps;
}

export default function PurchaseReceiveShipping({ formData }: PurchaseShippingProps) {
  return (
    <FormSection name="Detalles del envío">
      <div className='grid md:grid-cols-3 grid-cols-1 md:text-2xs text-base md:gap-x-4 md:gap-y-0 gap-y-4'>
        <div className='flex flex-col space-y-2  font-medium'>
          <span className='text-secondary/80'>Fecha de emisión</span>
          <p className='text-primary'>{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : ''}</p>
        </div>
        <div className='flex flex-col space-y-2 font-medium'>
          <span className='text-secondary/80'>Llegada estimada</span>
          <p className='text-primary'>{formData.arrivalDate ? new Date(formData.arrivalDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : 'Ninguno'}</p>
        </div>
        <div className='flex flex-col space-y-2 font-medium'>
          <span className='text-secondary/80'>Costo de envio</span>
          <p className='text-primary'>{currencyFormatter(formData.shippingCost)}</p>
        </div>
      </div>
    </FormSection >
  )
}