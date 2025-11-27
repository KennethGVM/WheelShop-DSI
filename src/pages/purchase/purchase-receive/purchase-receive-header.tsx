/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { supabase } from '@/api/supabase-client';
import FormSection from '@/layout/form-section';
import DropDownSelector from '@/components/form/dropdown-selector';
import { PaymentMethodProps, PurchaseOrderReceiptProps, SupplierProps } from '@/types/types';
import ProgressBar from '@/components/form/progress-bar';

interface DropdownItemType {
  name: string;
  value: string;
}

interface PurchaseHeaderProps {
  formData: PurchaseOrderReceiptProps;
  handleChangeFormData: (name: keyof PurchaseOrderReceiptProps, value: string | number | Date) => void;
  suppliers: SupplierProps[];
  setSuppliers: Dispatch<SetStateAction<SupplierProps[]>>;
  paymentMethods: PaymentMethodProps[];
  setPaymentMethods: Dispatch<SetStateAction<PaymentMethodProps[]>>;
}

export default function PurchaseReceiveHeader({ formData, suppliers, setSuppliers, paymentMethods, setPaymentMethods }: PurchaseHeaderProps) {
  const [storeHouse, setStoreHouse] = useState<DropdownItemType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: paymentData } = await supabase.from('paymentMethod').select('*');
      setPaymentMethods(paymentData as PaymentMethodProps[]);

      const { data: supplierData } = await supabase.from('supplier').select('*');
      setSuppliers(supplierData as SupplierProps[]);

      const { data: storeHouseData } = await supabase.from('getstorehouse').select('*');
      setStoreHouse(storeHouseData?.map(sh => ({ name: sh.name, value: sh.storeHouseId })) || []);
    };

    fetchData();
  }, []);

  return (
    <FormSection className="px-0 pt-0">
      <>
        <div className="flex md:flex-row flex-col items-center [&>div]:py-5 [&>div]:px-4">
          <DropDownSelector
            name="Distribuidor"
            className='md:border-r'
            items={suppliers.map(s => ({ name: s.nameSupplier, value: s.supplierId }))}
            value={formData.supplierId}
            disabled
          />

          <DropDownSelector
            name="Destino"
            disabled
            isCreated={false}
            items={storeHouse}
            value={formData.storeHouseId}
          />
        </div>

        <div className='flex md:flex-row flex-col md:items-center md:[&>div]:py-5 [&>div]:py-3 [&>div]:px-4'>
          <div className='flex flex-col space-y-2 md:text-2xs text-base w-1/3'>
            <span className='font-medium text-secondary/80 text-nowrap'>Términos de pago</span>
            <span className='text-secondary/80 font-[550]'>{paymentMethods.find(pm => pm.namePaymentMethod === formData.paymentMethodId)?.namePaymentMethod}</span>
          </div>

          <ProgressBar
            total={formData.products.reduce((acc, product) => acc + product.orderedQuantity, 0)}
            value1={(formData.state === 1 || formData.state === 3) ? 0 : formData.products.reduce((acc, product) => acc + product.receivedQuantity, 0)}
            value2={(formData.state === 1 || formData.state === 3) ? 0 : formData.products.reduce((acc, product) => acc + product.orderedQuantity - product.receivedQuantity, 0)}
          />
        </div>
      </>
    </FormSection>
  );
}