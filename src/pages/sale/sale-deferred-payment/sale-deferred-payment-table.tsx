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
import { BankProps, CurrencyProps, PaymentMethodProps, SaleDeferredPaymentProps, SaleProps } from '@/types/types';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import PaymentCommitment from './payment-commitment';
import { useGeneralInformation } from '@/api/general-provider';

interface SaleDeferredPaymentTableProps {
  allPayments: SaleDeferredPaymentProps[];
  sale: SaleProps | null;
  payments: SaleDeferredPaymentProps[];
  setPayments: Dispatch<SetStateAction<SaleDeferredPaymentProps[]>>;
  newPayments: SaleDeferredPaymentProps[];
  paymentMethods: PaymentMethodProps[];
  currencies: CurrencyProps[];
  banks: BankProps[];
}

export default function SaleDeferredPaymentTable({ setPayments, currencies, paymentMethods, payments, allPayments, sale, newPayments, banks }: SaleDeferredPaymentTableProps) {
  const currentCurrency = "NIO";
  const { dollarValue = 0 } = useGeneralInformation();


  const [selectedPaymentIds, setSelectedPaymentIds] = useState<SaleDeferredPaymentProps[]>([]);
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
    bankId: '',
    dollarChange: dollarValue,
  });

  useEffect(() => {
    if (paymentMethods.find(pm => pm.paymentMethodId === formData.paymentMethodId)?.namePaymentMethod !== "Efectivo") {
      setFormData(prev => ({ ...prev, bankId: banks[0]?.bankId }));
    }
  }, [formData.paymentMethodId])

  const HEADERS = [
    { label: "Fecha", isNumeric: false },
    { label: "Forma de pago", isNumeric: false },
    { label: "Cuota", isNumeric: true },
    { label: "Total", isNumeric: true },
    { label: "Pendiente", isNumeric: true },
  ]
  const selectedPaymentMethod = paymentMethods.find(pm => pm.paymentMethodId === formData.paymentMethodId);
  const showBankSelect = selectedPaymentMethod?.namePaymentMethod === "Transferencia" || selectedPaymentMethod?.namePaymentMethod === "Tarjeta";

  const handleSelectProduct = (payment: SaleDeferredPaymentProps, checked: boolean) => {
    let newSelectedIds;

    if (checked) {
      newSelectedIds = [...selectedPaymentIds, payment];
    } else {
      newSelectedIds = selectedPaymentIds.filter((saleId) => saleId.saleDeferredPaymentId !== payment.saleDeferredPaymentId);
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
      bankId: selectedPaymentIds[0]?.bankId ?? '',
      dollarChange: selectedPaymentIds[0]?.dollarChange ?? dollarValue,
    });
  }

  const handleChangeFormData = (name: keyof typeof formData, value: string | number | Date) => {
    setFormData({ ...formData, [name]: value });
  }

  const handleEditPayment = async () => {
    if (!dollarValue) return;

    const { amount, currencyId } = formData;

    if (formData.amount <= 0) {
      showToast('El monto no puede ser 0', false);
      return;
    }



    const formCurrencyName = currencies.find(c => c.currencyId === currencyId)?.currencyName;
    const saleCurrencyName = "Cordobas"; // asumimos que todas las ventas están en córdobas
    const round = (value: number) => Math.round(value * 100) / 100;

    const amountInSaleCurrency =
      formCurrencyName === "Dolares" && saleCurrencyName === "Cordobas"
        ? round(amount * dollarValue)
        : round(amount);


    const sortedPayments = [...allPayments].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const currentPaymentId = selectedPaymentIds[0]?.saleDeferredPaymentId;
    const currentIndex = sortedPayments.findIndex(p => p.saleDeferredPaymentId === currentPaymentId);
    const penultimatePayment = sortedPayments[currentIndex - 1];

    let previousBalance = 0;
    if (penultimatePayment) {
      previousBalance = round(penultimatePayment.balance);

    } else {
      previousBalance = sale?.total ?? 0;
    }

    if (amountInSaleCurrency > previousBalance) {
      showToast('Abono no puede exceder el total vendido.', false);
      return;
    }

    let newBalance = 0;
    if (penultimatePayment) {
      newBalance = round(previousBalance - amountInSaleCurrency);
    } else {
      newBalance = (sale?.total ?? 0) - amountInSaleCurrency;
    }

    const { error } = await supabase
      .rpc('update_sale_payment', {
        p_amount: formData.amount,
        p_balance: newBalance,
        p_currencyid: formData.currencyId,
        p_paymentmethodid: formData.paymentMethodId,
        p_bankid: showBankSelect ? formData.bankId : null,
        p_saledeferredpaymentid: selectedPaymentIds[0]?.saleDeferredPaymentId,
        p_saleid: selectedPaymentIds[0]?.saleId,
        p_dollarchange: dollarValue,
      })

    if (error) {
      showToast(error.message, false);
      return;
    }

    const updatedPayments = payments.map(p => {
      if (p.saleDeferredPaymentId === currentPaymentId) {
        return {
          ...p,
          amount: formData.amount,
          currencyId: formData.currencyId,
          paymentMethodId: formData.paymentMethodId,
          bankId: showBankSelect ? formData.bankId : null,
          saleDeferredPaymentId: selectedPaymentIds[0]?.saleDeferredPaymentId,
          saleId: selectedPaymentIds[0]?.saleId,
          paymentCode: selectedPaymentIds[0]?.paymentCode,
          state: true,
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
    const currentPaymentId = selectedPaymentIds[0]?.saleDeferredPaymentId;

    const sortedPayments = [...allPayments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const currentIndex = sortedPayments.findIndex(p => p.saleDeferredPaymentId === currentPaymentId);

    const activePreviousPayments = sortedPayments
      .slice(0, currentIndex) // solo anteriores
      .filter(p => p.state === true);

    const penultimateBalance = activePreviousPayments.length > 0
      ? activePreviousPayments[activePreviousPayments.length - 1].balance
      : sale?.total ?? 0;

    const { error } = await supabase
      .from('saleDeferredPayment')
      .update({ state: false, amount: 0, balance: penultimateBalance })
      .eq('saleDeferredPaymentId', currentPaymentId);

    if (error) {
      showToast(error.message, false);
      return;
    }

    const updatedPayments = payments.map(p => {
      if (p.saleDeferredPaymentId === currentPaymentId) {
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
                <span className='text-[#014B40] font-medium text-2xs'>Pendiente</span>
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

                        {!newPayments.find(p => p.saleDeferredPaymentId === selectedPaymentIds[0].saleDeferredPaymentId) && sale?.state !== 1 && selectedPaymentIds.length === 1 &&
                          selectedPaymentIds[0].saleDeferredPaymentId === allPayments[allPayments.length - 1]?.saleDeferredPaymentId &&
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
                          {showBankSelect && (
                            <FieldSelect
                              name='Banco'
                              id='bank'
                              options={banks.map(b => ({ name: b.bankName, value: b.bankId }))}
                              value={formData.bankId}
                              onChange={(e) => handleChangeFormData('bankId', e.target.value)}
                              className='mb-0'
                            />
                          )}
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
                        {newPayments.find(p => p.saleDeferredPaymentId === payment.saleDeferredPaymentId) && (
                          <StatusTags status text='Nuevo' />
                        )}

                        {!payment.state && (
                          <StatusTags status text='Cancelado' color='bg-[#e2e2e2]' textColor='text-[#737373]' />
                        )}
                      </td>
                      <td className="px-1.5 py-4">
                        {paymentMethods.find(pm => pm.paymentMethodId === payment.paymentMethodId)?.namePaymentMethod}
                        {payment.bankId && ` - ${banks.find(b => b.bankId === payment.bankId)?.bankName}`}
                      </td>
                      <td className="px-1.5 py-4 text-right">{currencyFormatter(payment.amount, (currencies.find(c => c.currencyId === payment.currencyId)?.currencyName) === 'Cordobas' ? 'NIO' : 'USD')}</td>
                      <td className="px-1.5 py-4 text-right">{currencyFormatter(sale?.total ?? 0, currentCurrency)}</td>
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
                createdAt: new Date(sale?.createdAt ?? new Date()),
                customerName: sale?.customerName ?? '',
                customerLastName : sale?.customerLastName ?? '',
                total: Number(sale?.total.toFixed(2) ?? 0),
                currencyId: selectedPaymentIds[0]?.currencyId ?? '',

              }}
              isOpen={isShowModal.commitment} 
              onClose={() => handleChangeModal('commitment', false)}
              currencies={currencies}
              />
          </>
        </FormSection>
      }
    </>
  )
}
