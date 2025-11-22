import { useAuth } from '@/api/auth-provider'
import { useGeneralInformation } from '@/api/general-provider'
import { useRolePermission } from '@/api/permissions-provider'
import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import TextArea from '@/components/form/text-area'
import SubHeader from '@/components/sub-header'
import { showToast } from '@/components/toast'
import Container from '@/layout/container'
import FormSection from '@/layout/form-section'
import { currencyFormatter, getPermissions } from '@/lib/function'
import { OpeningProps, DenominationProps } from '@/types/types'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import AccessPage from '../access-page'
import OpeningBill from '../pdf/opening-bill'

export default function CashBoxOpening() {
  const { user } = useAuth()
  const { dollarValue } = useGeneralInformation()
  const { cashBoxId } = useParams()
  const [searchParams] = useSearchParams();
  const openingId = searchParams.get('openingId');
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(openingId ? true : false)
  const [denominations, setDenominations] = useState<DenominationProps[]>([])
  const [selectedDenomination, setSelectedDenomination] = useState<number>(0)
  const [quantities, setQuantities] = useState<{ denominationId: string; quantity: number; total: number }[]>([])
  const [isShowModal, setIsShowModal] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    observations: '',
    user: user ? user.email : '',
    userId: user ? user.id : '',
    createdAt: new Date(),
  })

  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const canSeeOpening = getPermissions(permissions, "Caja", "Gestionar apertura de caja")?.canAccess;

  const tabs = [
    {
      id: 0,
      title: 'Billetes - Córdoba',
      filter: (d: DenominationProps) => !d.isCoin && d.currencyName?.toLowerCase() === 'cordobas'
    },
    {
      id: 1,
      title: 'Billetes - Dólar',
      filter: (d: DenominationProps) => !d.isCoin && d.currencyName?.toLowerCase() === 'dolares'
    },
    {
      id: 2,
      title: 'Monedas',
      filter: (d: DenominationProps) => d.isCoin && d.currencyName?.toLowerCase() === 'cordobas'
    }
  ]

  useEffect(() => {
    if (openingId) return;
    if (user) {
      setFormData(prev => ({
        ...prev,
        user: user.email,
        userId: user.id
      }))
    }
  }, [user, openingId])

  useEffect(() => {
    const handleLoadCashBoxOpening = async () => {
      const { data, error } = await supabase.from('getcashboxopening').select('*').eq('cashBoxOpeningId', openingId).single();
      if (error) {
        showToast(error.message, false)
        return;
      }

      const cashBoxData = data as OpeningProps;

      setFormData({
        observations: cashBoxData.observations || '',
        user: cashBoxData.email || '',
        userId: cashBoxData.userId || '',
        createdAt: cashBoxData.openingDate ? new Date(cashBoxData.openingDate) : new Date(),
      })

      setQuantities(cashBoxData.details.map((detail) => ({
        denominationId: detail.denominationId,
        quantity: detail.quantity,
        total: detail.total
      })))
    }

    if (openingId) handleLoadCashBoxOpening();
  }, [openingId])

  useEffect(() => {
    const handleLoadDenominations = async () => {
      const { data } = await supabase.from('getdenominations').select('*')
      setDenominations(data as DenominationProps[])
    }

    handleLoadDenominations()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (quantities.length === 0) {
      showToast('Debe agregar al menos un billete', false)
      return;
    }

    const { error } = await supabase.rpc('create_cash_box_opening', {
      p_cashboxid: cashBoxId,
      p_details: quantities,
      p_observations: formData.observations,
      p_status: true,
      p_total: generalTotal,
      p_userid: formData.userId
    })

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Caja abierta', true)
    setIsSaved(true)
  }

  const handleFormSubmit = () => {
    formRef.current?.requestSubmit()
  }

  const handleQuantityChange = (denominationId: string, amount: number, quantity: number) => {
    setQuantities((prev) => {
      const existing = prev.find((item) => item.denominationId === denominationId)
      const total = quantity * amount

      if (existing) {
        return prev.map((item) =>
          item.denominationId === denominationId ? { ...item, quantity, total } : item
        )
      } else {
        return [...prev, { denominationId, quantity, total }]
      }
    })
  }

  const getQuantity = (denominationId: string) => {
    return quantities.find((q) => q.denominationId === denominationId)?.quantity || ''
  }

  const getTotal = (denominationId: string) => {
    return quantities.find((q) => q.denominationId === denominationId)?.total?.toFixed(2) || '0.00'
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

  const currentTab = tabs.find((t) => t.id === selectedDenomination)
  const filteredDenominations = denominations.filter(currentTab?.filter || (() => false))
  const totalCordobas = getTotalByCurrency('cordobas', false);
  const totalDollars = getTotalByCurrency('dolares', false) * dollarValue!;
  const totalCordobaCoins = getTotalByCurrency('cordobas', true);

  const generalTotal = totalCordobas + totalDollars + totalCordobaCoins;

  return (
    <Container text='Cambios no guardados' save={!isSaved} onSaveClick={handleFormSubmit}>
      {canSeeOpening ? (
        <section className="flex flex-col items-center h-full flex-1">
          <div className="max-w-screen-lg mt-2 w-full mx-auto flex-1 flex flex-col">
            <SubHeader title="Apertura de Caja" backUrl="/openings" children={
              isSaved &&
              <Button onClick={() => setIsShowModal(true)} styleButton='simple' className='bg-[#d4d4d4] hover:bg-[#cccccc] md:text-2xs font-medium text-secondary text-base md:mr-0 mr-4 px-2 py-1' name='Imprimir' />
            } />
            <p className="font-medium md:text-2xs text-base md:px-0 px-4 text-secondary/80 mt-1">
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

                  <FormSection name='Denominaciones'>
                    <div className="flex items-center">
                      {tabs.map((tab, index) => (
                        <Button
                          key={tab.id}
                          type='button'
                          name={tab.title}
                          onClick={() => setSelectedDenomination(tab.id)}
                          styleButton={selectedDenomination === tab.id ? 'none' : 'primary'}
                          className={`px-3 md:text-2xs text-base py-1.5 ${index === 0 ? 'rounded-r-none border-r-0' :
                            index === tabs.length - 1 ? 'rounded-l-none border-l-0' :
                              'rounded-none border-x-0'
                            } ${selectedDenomination === tab.id ? 'bg-[#e0e0e0] shadow-pressed' : ''}`}
                        />
                      ))}
                    </div>
                  </FormSection>

                  {currentTab && (
                    <FormSection name={currentTab.title} className='px-0 pb-2' classNameLabel='mx-4 mb-2'>
                      <div className='rounded-md'>
                        <table className="w-full text-left">
                          <thead className="text-primary px-4 font-semibold border-b md:text-2xs text-[15px] border-gray-300">
                            <tr>
                              <th className="px-4 py-2 font-semibold">Denominación</th>
                              <th className="px-2 py-2 font-semibold">Cantidad</th>
                              <th className="px-4 py-2 font-semibold text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDenominations.map(({ denominationId, name, amount }, index) => (
                              <tr key={denominationId} className={`md:text-2xs text-[15px] font-medium text-secondary/80 ${index !== filteredDenominations.length - 1 ? 'border-b' : ''}`}>
                                <td className="px-4 py-2 w-[60%]">{name}</td>
                                <td className="px-2 py-2">
                                  <FieldInput
                                    isNumber
                                    readOnly={openingId ? true : false}
                                    classNameDiv='md:h-8 h-9'
                                    className="mb-0 w-32"
                                    value={getQuantity(denominationId)}
                                    onChange={(e) =>
                                      handleQuantityChange(denominationId, amount, Number(e.target.value))
                                    }
                                  />
                                </td>
                                <td className="px-4 py-2 text-right">{currencyFormatter(getTotal(denominationId))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </FormSection>
                  )}

                  <FormSection name='Observaciones'>
                    <TextArea readOnly={openingId ? true : false} rows={5} onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))} value={formData.observations} />
                  </FormSection>
                </div>

                <div className="w-full xl:w-1/3">
                  <FormSection name='Resumen de apertura' className='px-0 pb-3' classNameLabel='mx-4'>
                    <>
                      <div className='px-4 space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>Total billetes córdoba:</span>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>{currencyFormatter(getTotalByCurrency('cordobas', false))}</span>
                        </div>

                        <div className='flex items-center justify-between'>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>Total billetes dólar:</span>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>{currencyFormatter(getTotalByCurrency('dolares', false), "USD")}</span>
                        </div>

                        <div className='flex items-center justify-between'>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>Total monedas córdoba:</span>
                          <span className='text-secondary/80 font-medium md:text-2xs text-base'>{currencyFormatter(getTotalByCurrency('cordobas', true))}</span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between mt-2 border-t pt-2 px-4'>
                        <span className='text-primary font-semibold md:text-2xs text-base'>General total:</span>
                        <span className='text-primary font-semibold md:text-2xs text-base'>{currencyFormatter(generalTotal)}</span>
                      </div>
                    </>
                  </FormSection>
                </div>
              </form>
            </main>
          </div>

          {isShowModal && (
            <OpeningBill
              name='Apertura de caja'
              banks={[]}
              denominations={quantities.map(q => ({ name: denominations.find(d => d.denominationId === q.denominationId)?.name ?? '', quantity: q.quantity, value: q.total, currencyName: denominations.find(d => d.denominationId === q.denominationId)?.currencyName ?? '' }))}
              transfers={[]}
              date={new Date(formData.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
              time={new Date(formData.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true })}
              banksTotal={0}
              grandTotal={generalTotal}
              denominationsTotal={generalTotal}
              transfersTotal={0}
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
