/* eslint-disable react-hooks/exhaustive-deps */
import CheckBox from '@/components/form/check-box';
import DateTimePicker from '@/components/form/datetimepicker';
import FieldSelect from '@/components/form/field-select';
import FormSection from '@/layout/form-section';
import { currencyFormatter } from '@/lib/function';
import { PaymentConditionProps, PurchaseProps, SelectedProducts } from '@/types/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { addDays } from 'date-fns';
import { supabase } from '@/api/supabase-client';
import Button from '@/components/form/button';
import Modal from '@/components/modal';
import FieldInput from '@/components/form/field-input';
import { CloseIcon, PlusCircleIcon } from '@/icons/icons';
import { showToast } from '@/components/toast';
import { useGeneralInformation } from '@/api/general-provider';

interface PurchaseCostProps {
  formData: Omit<PurchaseProps, 'createdAt' | 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>;
  setFormData: Dispatch<SetStateAction<Omit<PurchaseProps, 'purchaseOrderId' | 'nameSupplier' | 'namestorehouse' | 'namePaymentMethod' | 'products'>>>;
  products: SelectedProducts[];
  canPaymentCondition: boolean;
  canAddDiscount: boolean;
  currencyName: string;
}

export default function PurchaseCost({ currencyName, formData, canAddDiscount, setFormData, products, canPaymentCondition }: PurchaseCostProps) {
  const [paymentCondition, setPaymentCondition] = useState<PaymentConditionProps[]>([]);
  const [quantity, setQuantity] = useState<number>(0);
  const [isShowModal, setIsShowModal] = useState({ modal: false, discount: formData.discount > 0 });
  const { dollarValue } = useGeneralInformation();

  const [localValues, setLocalValues] = useState({
    shippingCost: formData.shippingCost || 0,
    discount: formData.discount || 0
  });

  const convertCurrency = (value: number) => {
    if (!dollarValue) return value;
    return currencyName === 'Dolares' ? value / dollarValue : value;
  };

  const handleChangeModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAdjustments = () => {
    if (localValues.discount > formData.total) {
      showToast('El descuento no puede exceder el total del pedido', false);
      return;
    }

    setFormData(prev => ({
      ...prev,
      shippingCost: localValues.shippingCost,
      discount: localValues.discount
    }));
    setIsShowModal({ ...isShowModal, modal: false });
  };

  useEffect(() => {
    let newSubtotal = 0;
    let newQuantity = 0;
    products.forEach(product => {
      newSubtotal += product.quantity * Number(product.cost);
      newQuantity += product.quantity;
    });

    const subTotal: number = Number((convertCurrency(newSubtotal) - formData.discount).toFixed(2))
    const total = subTotal;

    setFormData(prev => ({
      ...prev,
      subTotal: convertCurrency(newSubtotal),
      total,
      createdAt: new Date()
    }));

    setQuantity(newQuantity);
  }, [products, formData.discount, formData.currencyId]);

  useEffect(() => {
    const selectedCondition = paymentCondition.find(
      pc => pc.paymentConditionId === formData.paymentConditionId
    );

    if (selectedCondition && !selectedCondition.name.toLowerCase().includes('fecha fija')) {
      const match = selectedCondition.name.match(/\d+/);
      const daysToAdd = match ? parseInt(match[0]) : 0;
      const newExpirationDate = addDays(new Date(), daysToAdd);

      setFormData(prev => ({
        ...prev,
        expirationDate: newExpirationDate,
      }));
    }
  }, [formData.paymentConditionId, paymentCondition]);

  useEffect(() => {
    const handleLoadPaymentCondition = async () => {
      const { data } = await supabase.from('paymentCondition').select('*');
      setPaymentCondition(data as PaymentConditionProps[]);
      setFormData(prev => ({ ...prev, paymentConditionId: data?.[0].paymentConditionId }));
    };

    handleLoadPaymentCondition();
  }, []);

  const isFixedDate = paymentCondition.find(
    pc => pc.paymentConditionId === formData.paymentConditionId &&
      pc.name.toLowerCase().includes('fecha fija')
  );

  return (
    <FormSection name="Resumen de costos" classNameLabel='mb-1'>
      <>
        {canAddDiscount &&
          <Button
            onClick={() => {
              setLocalValues({
                shippingCost: formData.shippingCost || 0,
                discount: formData.discount || 0
              });
              handleChangeModal('modal', true);
            }}
            type="button"
            name='Gestionar'
            className='text-2xs font-medium mb-2 text-blueprimary hover:underline hover:text-bluesecondary'
          />
        }

        <div className="flex items-center justify-between text-secondary/80 font-medium md:text-2xs text-base">
          <div className="flex flex-col">
            <span className="text-secondary font-semibold">Subtotal</span>
            <span className="inline-block mt-1">{quantity} artículos</span>
          </div>
          <span className="text-secondary font-semibold">{currencyFormatter(formData.subTotal, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>

        <span className="text-secondary font-semibold md:text-2xs text-base inline-block mt-4">Ajuste de costos</span>

        <div className="flex items-center mb-1.5 justify-between text-secondary/80 font-medium md:text-2xs text-base">
          <span>Envío</span>
          <span>{currencyFormatter(formData.shippingCost, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>
        {formData.discount > 0 && (
          <div className="flex items-center mb-1.5 justify-between text-secondary/80 font-medium md:text-2xs text-base">
            <span>Descuento</span>
            <span>{currencyFormatter(formData.discount, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 text-secondary/80 font-medium md:text-2xs text-base">
          <span className="text-secondary font-semibold">Total</span>
          <span className="text-secondary font-semibold">{currencyFormatter(formData.total + formData.shippingCost, currencyName === 'Cordobas' ? 'NIO' : 'USD')}</span>
        </div>

        {canPaymentCondition && (
          <div className="border border-gray-300 rounded-lg px-3 py-3 mt-3">
            <CheckBox
              onChange={(value) => setFormData(prev => ({ ...prev, purchaseType: value ? 1 : 0 }))}
              initialValue={formData.purchaseType === 1}
              name="Pago con vencimiento posterior"
              classNameLabel="md:text-sm text-base"
            />

            {formData.purchaseType === 1 && (
              <>
                <div className="flex md:flex-row flex-col items-center md:space-x-4 md:space-y-0 space-y-4 mt-5 [&>div]:w-full">
                  <FieldSelect
                    name="Condiciones de pago"
                    id="paymentConditions"
                    value={formData.paymentConditionId ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paymentConditionId: e.target.value
                    }))}
                    options={paymentCondition.map((pc) => ({
                      name: pc.name,
                      value: pc.paymentConditionId
                    }))}
                  />

                  <DateTimePicker
                    name="Fecha de vencimiento"
                    id="expirationDate"
                    position="top"
                    value={formData.expirationDate}
                    onChange={(date) => setFormData(prev => ({ ...prev, expirationDate: date }))}
                    disabled={!isFixedDate}
                  />
                </div>

                <p className="md:text-2xs text-base mt-5 text-secondary/80 font-medium">
                  <strong className="text-secondary">
                    Pago con vencimiento el{' '}
                    {formData.expirationDate?.toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) || '—'}.
                  </strong>{' '}
                  Podrás hacer pagos parciales desde la página de{' '}
                  <span className="text-blueprimary underline hover:text-bluesecondary">cuentas pendientes</span>.
                </p>
              </>
            )}
          </div>
        )}

        {isShowModal.modal && (
          <Modal
            onClickSave={handleSaveAdjustments}
            classNameModal='px-4 py-3'
            onClose={() => handleChangeModal('modal', false)}
            name="Gestionar resumen de costos"
            principalButtonName="Guardar"
          >
            <div className='grid grid-cols-2'>
              <span className='font-medium text-2xs'>Ajuste</span>
              <span className='font-medium text-2xs'>Importe {isShowModal.discount ? 'si' : 'no'}</span>
            </div>

            <div className='grid grid-cols-2 mt-4 items-center'>
              <span className='font-[550] md:text-2xs text-base text-secondary/80'>Envío</span>
              <FieldInput
                isNumber
                className='mb-0 w-[85%]'
                classNameDiv='md:h-8 h-10'
                value={localValues.shippingCost}
                appendChild={<span className='text-secondary/80 text-2xs font-medium'>{currencyName === 'Cordobas' ? 'C$' : '$'}</span>}
                onChange={(e) => setLocalValues(prev => ({
                  ...prev,
                  shippingCost: Number(e.target.value)
                }))}
              />
            </div>
            {(isShowModal.discount || formData.discount > 0) && (
              <div className='grid grid-cols-2 mt-4 items-center'>
                <span className='font-[550] md:text-2xs text-base text-secondary/80'>Descuento</span>
                <div className='flex items-center justify-between'>
                  <FieldInput
                    isNumber
                    className='mb-0 w-[85%]'
                    classNameDiv='md:h-8 h-10'
                    value={localValues.discount}
                    appendChild={<span className='text-secondary/80 text-2xs font-medium'>{currencyName === 'Cordobas' ? 'C$' : '$'}</span>}
                    onChange={(e) => setLocalValues(prev => ({
                      ...prev,
                      discount: Number(e.target.value)
                    }))}
                  />
                  <Button onClick={() => handleChangeModal('discount', false)} className='hover:bg-[#F2F2F2] p-1.5 rounded-md' type='button'>
                    <CloseIcon className='size-4 stroke-secondary/80' />
                  </Button>
                </div>
              </div>
            )}

            {(!isShowModal.discount || formData.discount < 0) &&
              <Button type='button' onClick={() => handleChangeModal('discount', true)}>
                <div className='flex items-center space-x-2 group mt-2'>
                  <PlusCircleIcon className='size-4 stroke-blueprimary group-hover:stroke-bluesecondary' />
                  <span className='group-hover:underline group-hover:text-bluesecondary text-2xs font-medium text-blueprimary'>Agregar descuento</span>
                </div>
              </Button>
            }
          </Modal>
        )}
      </>
    </FormSection>
  );
}
