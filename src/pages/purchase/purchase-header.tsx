/* eslint-disable react-hooks/exhaustive-deps */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { supabase } from '@/api/supabase-client';
import FormSection from '@/layout/form-section';
import FieldSelect from '@/components/form/field-select';
import DropDownSelector from '@/components/form/dropdown-selector';
import Modal from '@/components/modal';
import FieldInput from '@/components/form/field-input';
import { CurrencyProps, PaymentMethodProps, PurchaseProps, SelectedProducts, SupplierProps } from '@/types/types';
import { showToast } from '@/components/toast';

interface DropdownItemType {
  name: string;
  value: string;
}

interface PurchaseHeaderProps {
  isEditing: boolean;
  setFormData: Dispatch<SetStateAction<Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>>>;
  currencies: CurrencyProps[];
  paymentMethod: PaymentMethodProps[];
  setPaymentMethod: Dispatch<SetStateAction<PaymentMethodProps[]>>;
  setProducts: Dispatch<SetStateAction<SelectedProducts[]>>;
  setSuppliers: Dispatch<SetStateAction<SupplierProps[]>>;
  suppliers: SupplierProps[];
  formData: Omit<PurchaseProps, 'createdAt' | 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>;
  handleChangeFormData: (name: keyof Omit<PurchaseProps, 'createdAt' | 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>, value: string | number | Date) => void;
}

export default function PurchaseHeader({ setSuppliers, suppliers, paymentMethod, setPaymentMethod, setFormData, currencies, formData, handleChangeFormData, setProducts, isEditing }: PurchaseHeaderProps) {
  const [storeHouse, setStoreHouse] = useState<DropdownItemType[]>([]);
  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [formDataSupplier, setFormDataSupplier] = useState<Omit<SupplierProps, 'supplierId' | 'createdAt' | 'state'>>({
    nameSupplier: '',
    ruc: '',
    socialReason: '',
    phone: '',
    email: '',
  });

  const handleChangeFormDataSupplier = (name: keyof typeof formDataSupplier, value: string) => {
    setFormDataSupplier((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data: paymentData } = await supabase.from('paymentMethod').select('*');
      const data = paymentData as PaymentMethodProps[];
      setPaymentMethod(data);

      const { data: supplierData } = await supabase.from('supplier').select('*');
      setSuppliers(supplierData as SupplierProps[]);

      const { data: storeHouseData } = await supabase.from('getstorehouse').select('*');
      setStoreHouse(storeHouseData?.map(sh => ({ name: sh.name, value: sh.storeHouseId })) || []);


      if (!isEditing) {
        setFormData(prev => ({ ...prev, paymentMethodId: paymentData?.[0].paymentMethodId }));
      }
    };

    fetchData();
  }, []);

  const handleSubmitSupplier = async () => {
    const { data, error } = await supabase.from('supplier').insert({
      nameSupplier: formDataSupplier.nameSupplier,
      ruc: formDataSupplier.ruc,
      socialReason: formDataSupplier.socialReason,
      phone: formDataSupplier.phone,
      email: formDataSupplier.email,
    }).select();

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Proveedor creado', true);
      const newSupplier: SupplierProps = { createdAt: new Date(), state: true, nameSupplier: formDataSupplier.nameSupplier, email: formDataSupplier.email, phone: formDataSupplier.phone, ruc: formDataSupplier.ruc, socialReason: formDataSupplier.socialReason, supplierId: data[0].supplierId }
      setSuppliers([...suppliers, newSupplier])
      setIsShowModal(false);
    }
  }

  return (
    <FormSection className="px-0 pt-0">
      <>
        <div className="flex md:flex-row flex-col items-center [&>div]:py-5 [&>div]:px-4">
          <DropDownSelector
            name="Distribuidor"
            className='md:border-r'
            items={suppliers.map(s => ({ name: s.nameSupplier, value: s.supplierId }))}
            value={formData.supplierId}
            disabled={formData.state === 1}
            onClick={() => setIsShowModal(true)}
            onChange={(value) => { handleChangeFormData('supplierId', value); setProducts([]) }}
          />
          {isShowModal &&
            <Modal onClickSave={handleSubmitSupplier} name='Nuevo proveedor' principalButtonName='Guardar' onClose={() => setIsShowModal(false)} >
              <div className='[&>div]:mb-3 px-4 py-3'>
                <FieldInput
                  name="Nombre"
                  id='name'
                  value={formDataSupplier.nameSupplier}
                  onChange={(e) => handleChangeFormDataSupplier('nameSupplier', e.target.value)}
                />
                <FieldInput
                  name="Razón social"
                  id='socialReason'
                  value={formDataSupplier.socialReason}
                  onChange={(e) => handleChangeFormDataSupplier('socialReason', e.target.value)}
                />
                <FieldInput
                  name="RUC"
                  id='ruc'
                  value={formDataSupplier.ruc}
                  onChange={(e) => handleChangeFormDataSupplier('ruc', e.target.value)}
                />

                <div className='flex items-center space-x-2 [&>div]:w-full [&>div]:mb-0'>
                  <FieldInput
                    name="Teléfono"
                    id='phone'
                    value={formDataSupplier.phone}
                    onChange={(e) => handleChangeFormDataSupplier('phone', e.target.value)}
                  />
                  <FieldInput
                    name="Email"
                    id='email'
                    value={formDataSupplier.email}
                    onChange={(e) => handleChangeFormDataSupplier('email', e.target.value)}
                  />
                </div>
              </div>
            </Modal>
          }

          <DropDownSelector
            name="Destino"
            disabled={formData.state === 1}
            isCreated={false}
            items={storeHouse}
            value={formData.storeHouseId}
            onChange={(value) => handleChangeFormData('storeHouseId', value)}
          />
        </div>
        <div className="flex md:flex-row flex-col items-center md:space-x-4 px-4 mt-4 [&>div]:w-full md:space-y-0 space-y-3">
          <FieldSelect
            id="paymentMethod"
            name="Términos de pago (opcional)"
            options={paymentMethod.map(pm => ({ name: pm.namePaymentMethod, value: pm.paymentMethodId }))}
            value={formData.paymentMethodId}
            disabled={formData.state === 1}
            onChange={(e) => handleChangeFormData('paymentMethodId', e.target.value)}
          />
          <FieldSelect
            name="Moneda del distribuidor"
            options={currencies.map(cr => ({ name: cr.currencyName, value: cr.currencyId }))}
            value={formData.currencyId}
            onChange={(e) => handleChangeFormData('currencyId', e.target.value)}
            disabled={formData.state === 1}
          />
        </div>
      </>
    </FormSection>
  );
}