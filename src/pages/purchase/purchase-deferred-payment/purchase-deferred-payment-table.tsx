import { supabase } from '@/api/supabase-client';
import Button from '@/components/form/button';
import CheckBox from '@/components/form/check-box';
import DateTimePicker from '@/components/form/datetimepicker';
import FieldInput from '@/components/form/field-input';
import FieldSelect from '@/components/form/field-select';
import Modal from '@/components/modal';
import StatusTags from '@/components/status-tags';
import { showToast } from '@/components/toast';
import { CreditPaymentIcon, PurchaseDoneIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { currencyFormatter } from '@/lib/function';
import { CurrencyProps, PaymentMethodProps, PurchaseDeferredPaymentProps, PurchaseProps } from '@/types/types';
import { Dispatch, SetStateAction, useState } from 'react';
import PaymentCommitment from './payment-commitment';
import { useGeneralInformation } from '@/api/general-provider';

interface PurchaseDeferredPaymentTableProps {
  allPayments: PurchaseDeferredPaymentProps[];
  purchase: PurchaseProps | null;
  payments: PurchaseDeferredPaymentProps[];
  setPayments: Dispatch<SetStateAction<PurchaseDeferredPaymentProps[]>>;
  newPayments: PurchaseDeferredPaymentProps[];
  paymentMethods: PaymentMethodProps[];
  currencies: CurrencyProps[];
}

export default function PurchaseDeferredPaymentTable({ setPayments, currencies, paymentMethods, payments, allPayments, purchase, newPayments }: PurchaseDeferredPaymentTableProps) {
  const { dollarValue = 0 } = useGeneralInformation();

  const currentCurrency = purchase?.currencyName === "Cordobas" ? "NIO" : "USD";
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<PurchaseDeferredPaymentProps[]>([]);
  const [isShowModal, setIsShowModal] = useState({
    edit: false,
    cancel: false,
    commitment: false,
  });
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    amount: 0,
    currencyId: '',
    paymentMethodId: '',
    dollarChange: dollarValue,
  });

  const HEADERS = [
    { label: "Fecha", isNumeric: false },
    { label: "Cuota", isNumeric: true },
    { label: "Total", isNumeric: true },
    { label: "Pendiente", isNumeric: true },
  ]

  function convertToBaseCurrency(
    amount: number,
    fromCurrency: "Cordobas" | "Dolares" | undefined,
    toCurrency: "Cordobas" | "Dolares" | undefined,
    exchangeRate: number
  ): number {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount;

    if (fromCurrency === "Dolares" && toCurrency === "Cordobas") {
      return amount * exchangeRate;
    }

    if (fromCurrency === "Cordobas" && toCurrency === "Dolares") {
      return amount / exchangeRate;
    }

    return amount;
  }

  const handleSelectProduct = (payment: PurchaseDeferredPaymentProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedPaymentIds, payment];
    } else {
      newSelectedIds = selectedPaymentIds.filter((purchaseId) => purchaseId.purchaseDeferredPaymentId !== payment.purchaseDeferredPaymentId);
    }

    setSelectedPaymentIds(newSelectedIds);

    if (newSelectedIds.length !== payments.length) {
      setSelectAll(false);
    } else if (newSelectedIds.length === payments.length) {
      setSelectAll(true);
    }
  };

  const handleChangeModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal((prev) => ({ ...prev, [name]: value }));
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = payments.map(payment => payment);
      setSelectedPaymentIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedPaymentIds([]);
      setSelectAll(false);
    }
  };

  const handleOpenModal = () => {
    handleChangeModal('edit', true);
    setFormData({
      amount: selectedPaymentIds[0]?.amount,
      currencyId: selectedPaymentIds[0]?.currencyId,
      paymentMethodId: selectedPaymentIds[0]?.paymentMethodId,
      dollarChange: selectedPaymentIds[0]?.dollarChange ?? dollarValue,
    });
  }

  const handleChangeFormData = (name: keyof typeof formData, value: string | number | Date) => {
    setFormData({ ...formData, [name]: value });
  }

  const handleEditPayment = async () => {
    if (!dollarValue) return;
    const { amount, currencyId } = formData;

    if (amount <= 0) {
      showToast('El monto no puede ser 0', false);
      return;
    }

    const formCurrencyName = currencies.find(c => c.currencyId === currencyId)?.currencyName as "Cordobas" | "Dolares" | undefined;
    const purchaseCurrencyName = purchase?.currencyName as "Cordobas" | "Dolares" | undefined;

    const amountInPurchaseCurrency = convertToBaseCurrency(amount, formCurrencyName, purchaseCurrencyName, dollarValue);

    const sortedPayments = [...allPayments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const currentPaymentId = selectedPaymentIds[0]?.purchaseDeferredPaymentId;
    const currentIndex = sortedPayments.findIndex(p => p.purchaseDeferredPaymentId === currentPaymentId);
    const penultimatePayment = sortedPayments[currentIndex - 1];

    let previousBalance = 0;
    if (penultimatePayment) {
      previousBalance = penultimatePayment.balance;
    } else {
      previousBalance = purchase?.total ?? 0;
    }

    if (amountInPurchaseCurrency > previousBalance + 0.01) {
      showToast('Abono no puede exceder el total vendido.', false);
      return;
    }

    const newBalance = previousBalance - amountInPurchaseCurrency;

    const { error } = await supabase.rpc('update_purchase_payment', {
      p_amount: formData.amount,
      p_balance: newBalance,
      p_currencyid: formData.currencyId,
      p_paymentmethodid: formData.paymentMethodId,
      p_purchasedeferredpaymentid: currentPaymentId,
      p_purchaseorderid: selectedPaymentIds[0]?.purchaseOrderId,
      p_dollarchange: dollarValue,
    });

    if (error) {
      showToast(error.message, false);
      return;
    }

    const updatedPayments = payments.map(p => {
      if (p.purchaseDeferredPaymentId === currentPaymentId) {
        return {
          ...p,
          ...formData,
          balance: newBalance,
          dollarChange: dollarValue,
        };
      }
      return p;
    });

    setPayments(updatedPayments);
    setSelectedPaymentIds([]);
    handleChangeModal('edit', false);
    showToast('Pago actualizado', true);
  };

  const handleCancelPayment = async () => {
    const currentPaymentId = selectedPaymentIds[0]?.purchaseDeferredPaymentId;

    const sortedPayments = [...allPayments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const currentIndex = sortedPayments.findIndex(p => p.purchaseDeferredPaymentId === currentPaymentId);

    const activePreviousPayments = sortedPayments
      .slice(0, currentIndex) // solo anteriores
      .filter(p => p.state === true);

    const penultimateBalance = activePreviousPayments.length > 0
      ? activePreviousPayments[activePreviousPayments.length - 1].balance
      : purchase?.total ?? 0;

    const { error } = await supabase
      .from('purchaseDeferredPayment')
      .update({ state: false, amount: 0, balance: penultimateBalance })
      .eq('purchaseDeferredPaymentId', currentPaymentId);

    if (error) {
      showToast(error.message, false);
      return;
    }

    const updatedPayments = payments.map(p => {
      if (p.purchaseDeferredPaymentId === currentPaymentId) {
        return {
          ...p,
          amount: 0,
          balance: penultimateBalance,
          state: false,
        };
      }
      return p;
    });

    setPayments(updatedPayments);
    setSelectedPaymentIds([]);
    showToast('Pago cancelado', true);
    handleChangeModal('cancel', false);
  };

  return (
    <>
      {allPayments.length > 0 &&
        <FormSection className='px-0 pb-0'>
          <>
            <div className='flex items-center space-x-1'>
              <div className='flex ml-4 items-center space-x-2 bg-[#affebf] px-2 py-1 rounded-lg w-fit'>
                <PurchaseDoneIcon className='size-4 fill-[#014B40] stroke-none' />
                <span className='text-[#014B40] font-medium text-2xs'>{purchase?.state === 1 ? 'Comprado' : 'Recibido'}</span>
              </div>
              <div className='flex items-center space-x-2 bg-[#ffeb78] px-2 py-1 rounded-lg w-fit'>
                <CreditPaymentIcon className='size-4 fill-secondary/80 stroke-none' />
                <span className='text-secondary/80 font-medium text-2xs'>Pagado</span>
              </div>
            </div>

            <div className="relative mx-4 mt-3 border border-gray-300 overflow-x-auto rounded-lg">
              <table className="w-full rounded-lg text-left">
                <thead className={`${selectedPaymentIds.length > 0 ? 'bg-white' : 'bg-[#f7f7f7]'} border-b border-gray-300`}>
                  <tr className='[&>th]:font-semibold [&>th]:text-2xs [&>th]:text-secondary/80 relative'>
                    <th scope="col" className={`w-4 px-2`}>
                      <CheckBox
                        initialValue={selectAll}
                        onChange={(value) => handleSelectAll(value)}
                      />
                      <div className={`absolute left-8 inset-y-2 flex items-center pl-2`}>
                        {selectedPaymentIds.length > 0 && <span className='text-secondary/80 text-xs font-semibold'>Seleccionados: {selectedPaymentIds.length}</span>}
                      </div>
                    </th>

                    {HEADERS.map(({ label, isNumeric }, index) => (
                      <th key={index} className={`px-2 py-3 ${isNumeric ? 'text-right' : 'text-left'} ${selectedPaymentIds.length === 0 ? 'visible' : 'invisible'}`}>{label}</th>
                    ))}
                    {selectedPaymentIds.length > 0 && (
                      <div className='absolute right-0 inset-y-0 flex items-center pr-2 space-x-1'>
                        {selectedPaymentIds.some(p => p.state) && (
                          <Button onClick={() => handleChangeModal('commitment', true)} type='button' name='Imprimir' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
                        )}

                        {!newPayments.find(p => p.purchaseDeferredPaymentId === selectedPaymentIds[0].purchaseDeferredPaymentId) && purchase?.purchaseType !== 2 && selectedPaymentIds.length === 1 &&
                          selectedPaymentIds[0].purchaseDeferredPaymentId === allPayments[allPayments.length - 1]?.purchaseDeferredPaymentId &&
                          allPayments[allPayments.length - 1]?.state === true && (
                            <>
                              <Button onClick={() => handleChangeModal('cancel', true)} type='button' name='Cancelar abono' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
                              <Button onClick={handleOpenModal} type='button' name='Editar abono' styleButton="primary" className="px-2 py-1.5 text-xs font-semibold text-secondary/80" />
                            </>
                          )}
                      </div>
                    )}

                    {isShowModal.edit &&
                      <Modal onClickSave={handleEditPayment} name='Editar bono' principalButtonName='Guardar' onClose={() => handleChangeModal('edit', false)} >
                        <div className='p-4 space-y-4'>
                          <FieldSelect
                            name='Metodo de pago'
                            id='paymentMethod'
                            options={paymentMethods.map(pm => ({ name: pm.namePaymentMethod, value: pm.paymentMethodId }))}
                            value={formData.paymentMethodId}
                            onChange={(e) => handleChangeFormData('paymentMethodId', e.target.value)}
                            className='mb-0'
                          />
                          <FieldSelect
                            name='Moneda'
                            id='currency'
                            options={currencies.map(c => ({ name: c.currencyName, value: c.currencyId }))}
                            value={formData.currencyId}
                            onChange={(e) => handleChangeFormData('currencyId', e.target.value)}
                            className='mb-0'
                          />
                          <div className='flex space-x-4 items-center [&>div]:w-full'>
                            <FieldInput
                              name='Monto'
                              appendChild={<span className='text-secondary/80 text-2xs font-medium'>{currencies.find(c => c.currencyId === formData.currencyId)?.currencyName === "Cordobas" ? 'C$' : '$'}</span>}
                              id='amount'
                              onChange={(e) => handleChangeFormData('amount', Number(e.target.value))}
                              isNumber
                              value={formData.amount}
                              className='mb-0'
                            />
                            <DateTimePicker
                              name='Fecha'
                              id='createdAt'
                              value={new Date(selectedPaymentIds[0]?.createdAt)}
                              className='mb-0'
                              disabled
                            />
                          </div>

                        </div>
                      </Modal>
                    }

                    {isShowModal.cancel &&
                      <Modal onClickSave={handleCancelPayment} name='¿Cancelar bono?' principalButtonName='Confirmar' onClose={() => handleChangeModal('cancel', false)} >
                        <p className='font-medium md:text-2xs text-base text-secondary/80 px-4 py-3'>¿Está seguro de que desea cancelar el pago? Esta acción es irreversible y no podrá deshacerse una vez confirmada.</p>
                      </Modal>
                    }
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((payment, index) => (
                    <tr key={index} className={`[&>td]:font-[550] [&>td]:text-2xs [&>td]:text-secondary/80 ${selectedPaymentIds.includes(payment) ? 'bg-[#F7F7F7]' : 'bg-white'}`}>
                      <th className='px-2'>
                        <CheckBox
                          initialValue={selectedPaymentIds.includes(payment)}
                          onChange={(value) => handleSelectProduct(payment, value)}
                          disabled={!payment.state}
                          className='disabled:bg-red-900'
                        />
                      </th>
                      <td className="px-3 py-4 w-[80%] flex items-center gap-2">
                        {new Date(payment.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                        {newPayments.find(p => p.purchaseDeferredPaymentId === payment.purchaseDeferredPaymentId) && (
                          <StatusTags status text='Nuevo' />
                        )}

                        {!payment.state && (
                          <StatusTags status text='Cancelado' color='bg-[#e2e2e2]' textColor='text-[#737373]' />
                        )}
                      </td>
                      <td className="px-1.5 py-4 text-right">{currencyFormatter(payment.amount, (currencies.find(c => c.currencyId === payment.currencyId)?.currencyName) === 'Cordobas' ? 'NIO' : 'USD')}</td>
                      <td className="px-1.5 py-4 text-right">{currencyFormatter(purchase?.total ?? 0, currentCurrency)}</td>
                      <td className="px-1.5 py-4 text-right">{currencyFormatter(payment.balance, currentCurrency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className='bg-[#F7F7F7] mt-4 rounded-b-lg px-4 py-3 text-2xs font-medium text-secondary/80'>
              <p>Una vez que la compra haya sido pagada, su estado se actualizará a pagado.</p>
            </footer>

            <PaymentCommitment
              paymentCommitmentData={{
                amount: selectedPaymentIds[0]?.amount,
                balance: Number(selectedPaymentIds[0]?.balance.toFixed(2) ?? 0),
                commitmentNumber: selectedPaymentIds[0]?.paymentCode ?? '',
                createdAt: new Date(purchase?.createdAt ?? new Date()),
                supplierName: purchase?.nameSupplier ?? '',
                total: Number(purchase?.total.toFixed(2) ?? 0),
              }}
              isOpen={isShowModal.commitment} onClose={() => handleChangeModal('commitment', false)} />
          </>
        </FormSection>
      }
    </>
  )
}
