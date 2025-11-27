import { supabase } from '@/api/supabase-client';
import SubHeader from '@/components/sub-header';
import { showToast } from '@/components/toast';
import Container from '@/layout/container'
import FormSection from '@/layout/form-section';
import { BankProps, CurrencyProps, CustomerProps, PaymentMethodProps, SaleDeferredPaymentProps, SaleProps } from '@/types/types';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';
import AccessPage from '@/pages/access-page';
import SaleDeferredPaymentSummaryCost from './sale-deferred-payment-summary-cost';
import SaleDeferredAddPayment from './sale-deferred-add-payment';
import SaleDeferredPaymentTable from './sale-deferred-payment-table';

export default function AddSaleDeferredPayment() {
  const navigate = useNavigate();
  const { saleId } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [sale, setSale] = useState<SaleProps>()
  const [payments, setPayments] = useState<SaleDeferredPaymentProps[]>([]);
  const [newPayments, setNewPayments] = useState<SaleDeferredPaymentProps[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);
  const [banks, setBanks] = useState<BankProps[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canReceiveDeferredPayment = getPermissions(permissions, "Pedidos", "Registrar pagos")?.canAccess;
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProps | null>(null);
  const [isAllowToSale, setIsAllowToSale] = useState(false);

  useEffect(() => {
    const handleLoadStatus = async () => {
      const { data } = await supabase.from('cashbox_status').select('*').single();
      setIsAllowToSale(data.anyOpen);
    };

    handleLoadStatus();
  }, []);

  useEffect(() => {
    const handleLoadPaymentMethod = async () => {
      const { data } = await supabase.from('paymentMethod').select('*');
      setPaymentMethods(data as PaymentMethodProps[]);
    }

    const handleLoadCurrency = async () => {
      const { data } = await supabase.from('currency').select('*');
      setCurrencies(data as CurrencyProps[]);
    }
    const handleLoadBank = async () => {
      const { data } = await supabase.from('bank').select('*');
      setBanks(data as BankProps[]);
    }
    handleLoadBank();
    handleLoadCurrency();
    handleLoadPaymentMethod();
  }, []);

  useEffect(() => {
    const loadCustomerFromFormData = async () => {
      if (sale?.customerId && !selectedCustomer) {
        const data = await handleLoadCustomerById(sale.customerId);
        if (data) {
          setSelectedCustomer(data);
        }
      }
    };
    loadCustomerFromFormData();
  }, [sale?.customerId, selectedCustomer]);

  const handleLoadCustomerById = async (id: string | number) => {
    const { data, error } = await supabase
      .from("getcustomers")
      .select("*")
      .eq("customerId", id)
      .single();

    if (error) {
      return null;
    }

    return data;
  };

  useEffect(() => {
    const handleLoadSaleById = async () => {
      const { data } = await supabase.from('getsales').select('*').eq('saleId', saleId);
      setSale(data?.[0] as SaleProps);
    }

    const handleLoadPayments = async () => {
      const { data } = await supabase.from('saleDeferredPayment').select('*').eq('saleId', saleId);
      setPayments(data as SaleDeferredPaymentProps[]);
    }

    if (saleId) handleLoadPayments();
    if (saleId) handleLoadSaleById();
  }, [saleId]);

  const allPayments = [...payments, ...newPayments];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const salePayments = newPayments.map(payment => ({
      saleId: saleId,
      paymentMethodId: payment.paymentMethodId,
      currencyId: payment.currencyId,
      amount: payment.amount,
      balance: payment.balance,
      bankId: payment.bankId,
      dollarChange: payment.dollarChange,
    }));

    const { error } = await supabase.rpc('create_sale_payments', { payments: salePayments });

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Pago creado exitosamente', true);
      setPayments([...payments, ...newPayments]);
      const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
      const totalDue = sale?.total ?? 0;
      const remainingBalance = totalDue - totalPaid;

      if (remainingBalance <= 0) {
        setSale({ ...sale, state: 1 } as SaleProps);
      }

      setNewPayments([]);
    }

    setIsLoading(false)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  }

  return (
    <Container text="Cambios no guardados" save={sale?.state !== 1 && isAllowToSale} onSaveClick={handleFormSubmit} isLoading={isLoading} onClickSecondary={() => navigate(`/sales/add/${saleId}`)}>
      {canReceiveDeferredPayment ? (
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader backUrl={`/sales/add/${saleId}`} title={sale?.salesCode ?? ''} />
            <p className='text-xs font-medium text-secondary/80'>
              {sale?.createdAt &&
                `${new Date(sale.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}, ${new Date(sale.createdAt).toTimeString().slice(0, 5)}`}{' '}
            </p>

            <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
              <form onSubmit={handleSubmit} ref={formRef} className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full">
                <div className="flex-1 xl:w-auto w-full">
                  <SaleDeferredPaymentSummaryCost currencies={currencies} sale={sale} payments={payments} />
                  <SaleDeferredAddPayment banks={banks} currencies={currencies} paymentMethods={paymentMethods} allPayments={allPayments} saleId={saleId ?? ''} sale={sale ?? null} payments={payments} setNewPayments={setNewPayments} isAllowToSale={isAllowToSale} />
                  <SaleDeferredPaymentTable banks={banks} setPayments={setPayments} currencies={currencies} paymentMethods={paymentMethods} payments={payments} allPayments={allPayments} sale={sale ?? null} newPayments={newPayments} />
                </div>

                <div className="w-full xl:w-1/3">
                  <FormSection name='Cliente' classNameLabel='mb-2'>
                    <div className="flex justify-between items-start">
                      <div>
                        <p onClick={() => navigate(`/customers/add/${sale?.customerId}`)} className="md:text-2xs text-base  text-blueprimary cursor-pointer hover:underline">{selectedCustomer?.customerName + ' ' + selectedCustomer?.customerLastName}</p>
                        <div className="mt-3">
                          <p className="md:text-2xs text-base font-semibold mb-3">Información de contacto</p>
                          <p className="md:text-2xs text-base text-blueprimary">{selectedCustomer?.dni}</p>
                          <p className="md:text-2xs text-base text-blueprimary">{selectedCustomer?.email}</p>
                          <p className="md:text-2xs text-base  text-blueprimary mb-4">{selectedCustomer?.phone}</p>
                        </div>

                        <div className="mt-2">
                          <p className="md:text-2xs text-base font-semibold mb-3">Dirección de envío</p>
                          <p className="md:text-2xs text-base">{selectedCustomer?.address}</p>
                          <p className="md:text-2xs text-base">{selectedCustomer?.municipalityName}</p>
                          <p className="md:text-2xs text-base">{selectedCustomer?.departmentName}</p>
                          <p className="md:text-2xs text-base">Nicaragua</p>
                        </div>
                      </div>

                    </div>
                  </FormSection>
                </div>
              </form>
            </main>
          </div>
        </section>
      ) : (
        <AccessPage />
      )}
    </Container >
  );
}
