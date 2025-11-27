import { supabase } from '@/api/supabase-client';
import SubHeader from '@/components/sub-header';
import { showToast } from '@/components/toast';
import Container from '@/layout/container'
import FormSection from '@/layout/form-section';
import { CurrencyProps, PaymentMethodProps, PurchaseDeferredPaymentProps, PurchaseProps } from '@/types/types';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PurchaseDeferredPaymentSummaryCost from './purchase-deferred-payment-summary-cost';
import PurchaseDeferredAddPayment from './purchase-deferred-add-payment';
import PurchaseDeferredPaymentTable from './purchase-deferred-payment-table';
import FieldInput from '@/components/form/field-input';
import { useRolePermission } from '@/api/permissions-provider';
import { getPermissions } from '@/lib/function';
import AccessPage from '@/pages/access-page';

export default function AddPurchaseDeferredPayment() {
  const navigate = useNavigate();
  const { purchaseId } = useParams();
  const [isLoading, setIsLoading] = useState<boolean>();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [purchase, setPurchase] = useState<PurchaseProps>()
  const [payments, setPayments] = useState<PurchaseDeferredPaymentProps[]>([]);
  const [newPayments, setNewPayments] = useState<PurchaseDeferredPaymentProps[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodProps[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([]);
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canReceiveDeferredPayment = getPermissions(permissions, "Ordenes de compras", "Registrar pagos")?.canAccess;

  useEffect(() => {
    const handleLoadPaymentMethod = async () => {
      const { data } = await supabase.from('paymentMethod').select('*');
      setPaymentMethods(data as PaymentMethodProps[]);
    }

    const handleLoadCurrency = async () => {
      const { data } = await supabase.from('currency').select('*');
      setCurrencies(data as CurrencyProps[]);
    }

    handleLoadCurrency();
    handleLoadPaymentMethod();
  }, []);

  useEffect(() => {
    const handleLoadPurchaseById = async () => {
      const { data } = await supabase.from('getpurchases').select('*').eq('purchaseOrderId', purchaseId);
      setPurchase(data?.[0] as PurchaseProps);
    }

    const handleLoadPayments = async () => {
      const { data } = await supabase.from('purchaseDeferredPayment').select('*').eq('purchaseOrderId', purchaseId).order('createdAt', { ascending: true });
      setPayments(data as PurchaseDeferredPaymentProps[]);
    }

    if (purchaseId) handleLoadPayments();
    if (purchaseId) handleLoadPurchaseById();
  }, [purchaseId]);

  const allPayments = [...payments, ...newPayments];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const purchasePayments = newPayments.map(payment => ({
      purchaseOrderId: purchaseId,
      paymentMethodId: payment.paymentMethodId,
      currencyId: payment.currencyId,
      amount: payment.amount,
      balance: payment.balance,
      dollarChange: payment.dollarChange,

    }));

    const { error } = await supabase.rpc('create_purchase_payments', { payments: purchasePayments });

    if (error) {
      showToast(error.message, false);
    } else {
      showToast('Pago creado exitosamente', true);
      setPayments([...payments, ...newPayments]);
      const totalPaid = payments.reduce((acc, payment) => acc + payment.amount, 0);
      const totalDue = purchase?.total ?? 0;
      const remainingBalance = totalDue - totalPaid;

      if (remainingBalance <= 0) {
        setPurchase({ ...purchase, purchaseType: 2 } as PurchaseProps);
      }

      setNewPayments([]);
    }

    setIsLoading(false)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit();
  }

  return (
    <Container text="Cambios no guardados" save={purchase?.purchaseType !== 2} onSaveClick={handleFormSubmit} isLoading={isLoading} onClickSecondary={() => navigate(`/purchases/receive/${purchaseId}`)}>
      {canReceiveDeferredPayment ? (
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader backUrl={`/purchases/receive/${purchaseId}`} title={purchase?.codePurchaseOrder ?? ''} />
            <p className='text-xs font-medium text-secondary/80'>
              {purchase?.createdAt &&
                `${new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}, ${new Date(purchase.createdAt).toTimeString().slice(0, 5)}`}{' '}
              desde pedidos
            </p>

            <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
              <form onSubmit={handleSubmit} ref={formRef} className="flex flex-1 xl:space-x-6 flex-col xl:flex-row items-start w-full">
                <div className="flex-1 xl:w-auto w-full">
                  <PurchaseDeferredPaymentSummaryCost currencies={currencies} purchase={purchase} payments={payments} />
                  <PurchaseDeferredAddPayment currencies={currencies} paymentMethods={paymentMethods} allPayments={allPayments} purchaseId={purchaseId ?? ''} purchase={purchase ?? null} payments={payments} setNewPayments={setNewPayments} />
                  <PurchaseDeferredPaymentTable setPayments={setPayments} currencies={currencies} paymentMethods={paymentMethods} payments={payments} allPayments={allPayments} purchase={purchase ?? null} newPayments={newPayments} />
                </div>

                <div className="w-full xl:w-1/3">
                  <FormSection name='Proveedor' classNameLabel='mb-2'>
                    <FieldInput value={purchase?.nameSupplier} readOnly name='Nombre' className='mb-0' />
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
