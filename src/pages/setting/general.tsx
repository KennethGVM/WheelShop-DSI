import { useGeneralInformation } from '@/api/general-provider'
import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import Line from '@/components/form/line'
import Modal from '@/components/modal'
import { showToast } from '@/components/toast'
import { BranchIcon, GeneralIcon, PencilEditIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { useState } from 'react'

export default function General() {
  const { dollarValue, setDollarValue, generalId, companyName, companyPhone, companyAddress, companyRuc, setCompanyAddress, setCompanyName, setCompanyPhone, setCompanyRuc } = useGeneralInformation();
  const [isShowModal, setIsShowModal] = useState({
    name: false,
    address: false
  });

  const handleShowModal = (name: keyof typeof isShowModal, value: boolean) => {
    setIsShowModal((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const general = {
      dolarValue: dollarValue,
      companyName: companyName,
      phone: companyPhone,
      companyAddress: companyAddress,
      ruc: companyRuc
    }

    const { error } = await supabase.from('general').update(general).eq('generalId', generalId);

    if (error) {
      showToast(error.message, false);
      return;
    }

    showToast('Valores de la tienda actualizados', true);
    setIsShowModal({ address: false, name: false })
  }

  return (
    <>
      <h3 className="text-secondary/90 font-semibold md:text-lg text-xl md:mx-0 mx-4" >General</h3>
      <FormSection name="Detalles de la empresa" className="md:rounded-xl rounded-none" classNameLabel="md:text-2xs">
        <div className="border border-gray-300 rounded-lg px-3 py-1.5">
          <div className="flex items-center justify-between py-1 group">
            <div className="flex items-center space-x-4">
              <GeneralIcon variant="stroke" className="md:size-4 size-5 stroke-none fill-secondary/80" />
              <div className="space-y-0.5">
                <h4 className="font-medium text-secondary md:text-xs text-base">{companyName}</h4>
                <p className="md:text-xs text-base font-[550] text-secondary/80">{companyPhone} • {companyRuc}</p>
              </div>
            </div>
            <Button onClick={() => handleShowModal('name', true)} className="p-1 hover:bg-[#F2F2F2] rounded-md">
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80 stroke-none md:group-hover:block md:hidden block" />
            </Button>
          </div>

          <Line className="my-2" />

          <div className="flex items-center justify-between py-1 group">
            <div className="flex items-center space-x-4">
              <BranchIcon className="md:size-4 size-5 fill-transparent stroke-secondary/80 stroke-[1.5]" />
              <div className="space-y-0.5">
                <h4 className="font-medium text-secondary md:text-xs text-base">{companyAddress}</h4>
                <p className="md:text-xs text-base font-[550] text-secondary/80">Nicaragua</p>
              </div>
            </div>
            <Button onClick={() => handleShowModal('address', true)} className="p-1 hover:bg-[#F2F2F2] rounded-md">
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80 stroke-none md:group-hover:block md:hidden block" />
            </Button>
          </div>
        </div>
      </FormSection>

      <FormSection name="Valores predeterminados de la tienda" className="md:rounded-xl rounded-none" classNameLabel="md:text-2xs mb-1">
        <>
          <div className="flex lg:flex-row flex-col items-center [&>div]:mb-0 [&>div]:w-full mt-3 lg:space-x-4 space-x-0 md:space-y-0 space-y-3">
            <FieldInput
              name="Moneda"
              id="coin"
              readOnly
              value="Córdoba nicaragüense (NIO C$)"
            />
            <FieldInput
              name="Valor del dolar"
              id="dollarValue"
              isNumber
              onChange={(e) => setDollarValue(Number(e.target.value))}
              value={dollarValue ?? 0}
              appendChild={<span className="text-secondary/80 md:text-xs text-base font-medium">C$</span>}
            />
          </div>
          <FieldInput
            name="Zona horaria"
            id="timezone"
            readOnly
            value="(GMT-06:00) Nicaragua, managua"
            className="mb-0 mt-3"
          />
          <p className="text-xs mt-0.5 text-secondary/80 font-medium">Zona horaria para cuando se registran las ventas e informes y estadísticas.</p>
        </>
      </FormSection>

      <div className="flex justify-end mt-5 md:px-0 px-4">
        <Button onClick={handleSubmit} name="Guardar" className="px-3 py-1.5 md:text-2xs text-[15px]" styleButton="secondary" />
      </div>

      {isShowModal.name &&
        <Modal name='Editar compañia' classNameModal='px-4 py-3' onClose={() => handleShowModal('name', false)} onClickSave={handleSubmit} principalButtonName='Guardar'>
          <div className='space-y-4'>
            <FieldInput
              id='name'
              name='Nombre de la compañia'
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <FieldInput
              id='name'
              name='Telefono de la compañia'
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
            />

            <FieldInput
              id='name'
              name='RUC de la compañia'
              value={companyRuc}
              onChange={(e) => setCompanyRuc(e.target.value)}
            />
          </div>
        </Modal>
      }

      {isShowModal.address &&
        <Modal name='Editar dirección' classNameModal='px-4 py-3' onClose={() => handleShowModal('address', false)} onClickSave={handleSubmit} principalButtonName='Guardar'>
          <div className='space-y-4'>
            <FieldInput
              id='name'
              name='Dirección'
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
            />
          </div>
        </Modal>
      }
    </>
  )
}
