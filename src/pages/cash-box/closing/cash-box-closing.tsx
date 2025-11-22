import { useAuth } from '@/api/auth-provider'
import { useGeneralInformation } from '@/api/general-provider'
import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import TextArea from '@/components/form/text-area'
import SubHeader from '@/components/sub-header'
import { showToast } from '@/components/toast'
import Container from '@/layout/container'
import FormSection from '@/layout/form-section'
import { ClosingProps, BankProps, CurrencyProps, DenominationProps } from '@/types/types'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import CashBoxClosingTickets from './cash-box-closing-tickets'
import CashBoxClosingBanks from './cash-box-closing-closing'
import CashBoxClosingTransfers from './cash-box-closing-transfers'
import CashBoxClosingSummary from './cash-box-closing-summary'
import { useRolePermission } from '@/api/permissions-provider'
import { getPermissions } from '@/lib/function'
import AccessPage from '@/pages/access-page'
import OpeningBill from '@/pages/pdf/opening-bill'

interface CashBoxSummary {
  beginningbalance: number;
  expenses: number;
  income: number;
  systemtotal: number;
}

export default function CashBoxClosing() {
  const { user } = useAuth()
  const { cashBoxId } = useParams();
  const [searchParams] = useSearchParams();
  const closingId = searchParams.get('closingId');
  const { dollarValue } = useGeneralInformation()
  const formRef = useRef<HTMLFormElement | null>(null)
  const [quantities, setQuantities] = useState<{ denominationId: string; quantity: number; total: number }[]>([])
  const [bankAmounts, setBankAmounts] = useState<{ bankId: string; currencyId: string; value: number }[]>([])
  const [bankTransfers, setBankTransfers] = useState<{ bankId: string; currencyId: string; value: number }[]>([])
  const [denominations, setDenominations] = useState<DenominationProps[]>([])
  const [banks, setBanks] = useState<BankProps[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyProps>()
  const [selectedTransfer, setSelectedTransfer] = useState<CurrencyProps>()
  const [currencies, setCurrencies] = useState<CurrencyProps[]>([])
  const [cashBoxSummary, setCashBoxSummary] = useState<CashBoxSummary>();
  const [isSaved, setIsSaved] = useState<boolean>(cashBoxId ? false : true);
  const [isShowModal, setIsShowModal] = useState(false);
  const [formData, setFormData] = useState({
    observations: '',
    justification: '',
    user: user ? user.email : '',
    userId: user ? user.id : '',
    dollarChange: 0,
    createdAt: new Date()
  })

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeClosing = getPermissions(permissions, "Caja", "Cerrar caja")?.canAccess;

  useEffect(() => {
    const handleLoadClosingById = async () => {
      const { data, error } = await supabase.from('getclosings').select().eq('closingId', closingId)

      if (error) {
        showToast(error.message, false)
        return;
      }

      const closingData = data?.[0] as ClosingProps;

      if (!closingData) return;

      setFormData({
        justification: closingData.justification,
        observations: closingData.observations,
        userId: closingData.userId,
        user: closingData.email,
        dollarChange: closingData.dollarChange,
        createdAt: new Date(closingData.closingDate)
      })

      setQuantities(closingData.tickets.map(ticket => ({
        denominationId: ticket.denominationId,
        quantity: ticket.quantity,
        total: ticket.total
      })))

      setBankAmounts((closingData.banks ?? []).map(bank => ({
        bankId: bank.bankId,
        currencyId: bank.currencyId,
        value: bank.total
      })))

      setBankTransfers((closingData.transfers ?? []).map(transfer => ({
        bankId: transfer.bankId,
        currencyId: transfer.currencyId,
        value: transfer.total
      })))

      setCashBoxSummary({
        beginningbalance: closingData.beginningBalance,
        expenses: closingData.expense,
        income: closingData.income,
        systemtotal: closingData.systemTotal
      })
    }

    if (closingId) handleLoadClosingById();
  }, [closingId])

  useEffect(() => {
    const handleLoadDenominations = async () => {
      const { data } = await supabase.from('getdenominations').select('*')
      setDenominations(data as DenominationProps[])
    }

    const handleLoadBanks = async () => {
      const { data } = await supabase.from('bank').select('*')
      setBanks(data as BankProps[])
    }

    const handleLoadCurrencies = async () => {
      const { data } = await supabase.from('currency').select('*')
      setCurrencies(data as CurrencyProps[])
      setSelectedCurrency(data?.[0])
      setSelectedTransfer(data?.[0])
    }

    handleLoadDenominations()
    handleLoadCurrencies()
    handleLoadBanks()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        user: user.email,
        userId: user.id
      }))
    }
  }, [user])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if ((cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas) !== 0 && formData.justification.trim() === '') {
      showToast('El campo justificación es requerido debido hay que faltantes de caja', false)
      return;
    }

    const banks = bankAmounts.map((bank) => ({ bankId: bank.bankId, currencyId: bank.currencyId, total: bank.value }))
    const tickets = quantities.map((ticket) => ({ denominationId: ticket.denominationId, quantity: ticket.quantity, total: ticket.total }))
    const transfers = bankTransfers.map((transfer) => ({ bankId: transfer.bankId, currencyId: transfer.currencyId, total: transfer.value }))

    const { error } = await supabase.rpc('create_closing', {
      banks: banks,
      p_closingdate: new Date(),
      p_cashboxid: cashBoxId,
      p_diference: Number((cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas)).toFixed(2),
      p_justification: formData.justification,
      p_observations: formData.observations,
      p_state: ((cashBoxSummary?.systemtotal || 0) - generalTotal) === 0 ? true : false,
      p_dollarchange: dollarValue,
      p_systemtotal: cashBoxSummary?.systemtotal ?? 0,
      p_total: generalTotal,
      p_beginningbalance: cashBoxSummary?.beginningbalance ?? 0,
      p_expense: cashBoxSummary?.expenses ?? 0,
      p_income: cashBoxSummary?.income ?? 0,
      p_userid: user.id,
      tickets: tickets,
      transfers: transfers
    })

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Cierre creado', true);
    setIsSaved(true);
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }
  const getTotalByCurrency = (currency: string, isCoin = false) => {
    const filteredDenoms = denominations.filter(
      (d) => d.currencyName?.toLowerCase() === currency.toLowerCase() && d.isCoin === isCoin
    )

    return filteredDenoms.reduce((acc, denom) => {
      const match = quantities.find((q) => q.denominationId === denom.denominationId)
      return acc + (match?.total || 0)
    }, 0)
  }

  const getTotalBankByCurrency = (currencyId: string): number => {
    return bankAmounts
      .filter(item => item.currencyId === currencyId)
      .reduce((acc, curr) => acc + (curr.value || 0), 0)
  }

  const getTotalTransferByCurrency = (currencyId: string): number => {
    return bankTransfers
      .filter(item => item.currencyId === currencyId)
      .reduce((acc, curr) => acc + (curr.value || 0), 0)
  }

  useEffect(() => {
    const handleLoadCashBoxSumary = async () => {
      const { data, error } = await supabase.rpc('getcashboxsummary', { p_cashbox_id: cashBoxId }).single()

      if (error) {
        showToast(error.message, false);
        return;
      }

      setCashBoxSummary(data as CashBoxSummary);
    }

    if (!closingId) handleLoadCashBoxSumary();
  }, [cashBoxId, closingId])


  const totalCordobas = getTotalByCurrency('cordobas', false);
  const totalDollars = getTotalByCurrency('dolares', false) * (formData.dollarChange || dollarValue || 0);
  const totalCordobaCoins = getTotalByCurrency('cordobas', true);
  const totalCordobaBank = getTotalBankByCurrency(currencies.find(c => c.currencyName === 'Cordobas')?.currencyId || '');
  const totalDollarBank = getTotalBankByCurrency(currencies.find(c => c.currencyName === 'Dolares')?.currencyId || '') * (formData.dollarChange || dollarValue || 0);
  const totalCordobaTransfer = getTotalTransferByCurrency(currencies.find(c => c.currencyName === 'Cordobas')?.currencyId || '');
  const totalDollarTransfer = getTotalTransferByCurrency(currencies.find(c => c.currencyName === 'Dolares')?.currencyId || '') * (formData.dollarChange || dollarValue || 0);

  const generalTotal = totalCordobas + totalDollars + totalCordobaCoins + totalCordobaBank + totalDollarBank + totalCordobaTransfer + totalDollarTransfer;

  return (
    <Container save={!isSaved} text='Cambios no guardados' onSaveClick={handleFormSubmit}>
      {canSeeClosing ? (
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader title="Cierre de caja" backUrl="/closings" children={
              isSaved &&
              <div className='flex items-center space-x-2'>
                <Button onClick={() => setIsShowModal(true)} styleButton='simple' className='bg-[#d4d4d4] hover:bg-[#cccccc] md:text-2xs font-medium text-secondary text-base md:mr-0 mr-4 px-2 py-1' name='Imprimir' />
              </div>
            } />
            <p className="font-medium md:px-0 px-4 md:text-2xs text-sm text-secondary/80 mt-1">
              {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' - '}
              {new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>

            <main className="flex flex-1 flex-col xl:flex-row items-start w-full">
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-1 xl:space-x-6 flex-col-reverse xl:flex-row items-start w-full">
                <div className="flex-1 xl:w-auto w-full">
                  <FormSection name="Cajero">
                    <FieldInput value={formData.user} readOnly className="mb-0" />
                  </FormSection>

                  <CashBoxClosingTickets isEditing={closingId ? true : false} quantities={quantities} denominations={denominations} setQuantities={setQuantities} />
                  <CashBoxClosingBanks isEditing={closingId ? true : false} bankAmounts={bankAmounts} setBankAmounts={setBankAmounts} banks={banks} currencies={currencies} selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
                  <CashBoxClosingTransfers isEditing={closingId ? true : false} bankTransfers={bankTransfers} setBankTransfers={setBankTransfers} banks={banks} currencies={currencies} selectedTransfer={selectedTransfer} setSelectedTransfer={setSelectedTransfer} />

                  <FormSection name='Observaciones'>
                    <TextArea readOnly={closingId ? true : false} rows={5} onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))} value={formData.observations} />
                  </FormSection>
                </div>

                <div className="w-full xl:w-1/3">
                  <CashBoxClosingSummary totalCordobaBank={totalCordobaBank} totalCordobaCoins={totalCordobaCoins} totalCordobaTransfer={totalCordobaTransfer} totalCordobas={totalCordobas} totalDollarBank={totalDollarBank} totalDollars={totalDollars} totalDollarTransfer={totalDollarTransfer} generalTotal={generalTotal} cashBoxSummary={cashBoxSummary} />
                  {(cashBoxSummary?.systemtotal || 0) - (totalCordobaCoins + totalDollars + totalCordobas) !== 0 && (
                    <FormSection name='Faltante' classNameLabel='mb-1'>
                      <TextArea name='Justificación' readOnly={closingId ? true : false} value={formData.justification} onChange={(e) => setFormData({ ...formData, justification: e.target.value })} rows={5} />
                    </FormSection>
                  )}
                </div>
              </form>
            </main>
          </div>

          {isShowModal && (
            <OpeningBill
              name='Cierre de caja'
              banks={bankAmounts.map(b => ({
                bank: banks.find(bank => bank.bankId === b.bankId)?.bankName ?? '',
                value: b.value,
                currencyName: currencies.find(c => c.currencyId === b.currencyId)?.currencyName ?? ''
              }))}
              denominations={quantities.map(q => {
                const denom = denominations.find(d => d.denominationId === q.denominationId);
                return {
                  name: denom?.name ?? '',
                  quantity: q.quantity,
                  value: q.total,
                  currencyName: denom?.currencyName ?? ''
                };
              })}
              transfers={bankTransfers.map(t => ({
                name: banks.find(b => b.bankId === t.bankId)?.bankName ?? '',
                value: t.value,
                currencyName: currencies.find(c => c.currencyId === t.currencyId)?.currencyName ?? ''
              }))}
              date={new Date(formData.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              time={new Date(formData.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
              banksTotal={totalDollarBank + totalCordobaBank}
              grandTotal={generalTotal}
              denominationsTotal={totalCordobas + totalDollars + totalCordobaCoins}
              transfersTotal={totalDollarTransfer + totalCordobaTransfer}
              onClose={() => setIsShowModal(false)}
            />
          )}
        </section>
      ) : (
        <AccessPage />
      )}
    </Container>
  )
}
