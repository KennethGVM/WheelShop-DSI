import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button'
import FieldInput from '@/components/form/field-input'
import Line from '@/components/form/line'
import Modal from '@/components/modal'
import SubHeader from '@/components/sub-header'
import { showToast } from '@/components/toast'
import { BranchIcon, GeneralIcon, PencilEditIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { StoreHouseProps } from '@/types/types'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function AddStoreHouse() {
  const { storeHouseId } = useParams();

  const [isShowModal, setIsShowModal] = useState({
    name: false,
    numberStoreHouse: false,
  })

  const [formData, setFormData] = useState({
    name: '',
    numberStoreHouse: '',
  })

  const [formDataDraft, setFormDataDraft] = useState({
    name: '',
    numberStoreHouse: '',
  })

  useEffect(() => {
    const handleLoadStoreHouseById = async () => {
      const { data } = await supabase.from('storeHouse').select('*').eq('storeHouseId', storeHouseId).single()
      const storeHouseData = data as StoreHouseProps;

      setFormData({
        name: storeHouseData.name,
        numberStoreHouse: storeHouseData.numberStoreHouse.toString(),
      })

      setFormDataDraft({
        name: storeHouseData.name,
        numberStoreHouse: storeHouseData.numberStoreHouse.toString(),
      })
    }

    if (storeHouseId) handleLoadStoreHouseById();
  }, [storeHouseId])

  const handleOpenModal = (field: 'name' | 'numberStoreHouse') => {
    setIsShowModal(prev => ({ ...prev, [field]: true }))
    setFormDataDraft(prev => ({ ...prev, [field]: formData[field] }))
  }

  const handleSave = (field: 'name' | 'numberStoreHouse') => {
    setFormData(prev => ({ ...prev, [field]: formDataDraft[field] }))
    setIsShowModal(prev => ({ ...prev, [field]: false }))
  }

  const handleSubmit = async () => {
    const storeHouse = {
      name: formData.name,
      numberStoreHouse: formData.numberStoreHouse,
      state: true
    }

    const { error } = storeHouseId ? await supabase.from('storeHouse').update([storeHouse]).eq('storeHouseId', storeHouseId) : await supabase.from('storeHouse').insert([storeHouse])

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast(`Bodega ${storeHouseId ? 'actualizada' : 'creada'}`, true)

    if (storeHouseId) return;
    setFormData({
      name: '',
      numberStoreHouse: '',
    })
  }

  return (
    <>
      <SubHeader title='Agregar bodega' backUrl='/settings/store-houses' />

      <FormSection name='Información de la sucursal'>
        <div className="border border-gray-300 rounded-lg px-3 py-1.5">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-4 py-2">
              <GeneralIcon variant="stroke" className="md:size-4 size-5 stroke-none fill-secondary/80" />
              <h4 className="font-medium text-secondary md:text-2xs text-base">
                {formData.name || 'Nombre'}
              </h4>
            </div>
            <Button onClick={() => handleOpenModal('name')} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg" styleButton='primary'>
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80" />
            </Button>
          </div>

          <Line />

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center space-x-4 py-2">
              <BranchIcon className="md:size-4 size-5 fill-transparent stroke-secondary/80 stroke-[1.5]" />
              <h4 className="font-medium text-secondary md:text-2xs text-base">
                {formData.numberStoreHouse || 'Numero de bodega'}
              </h4>
            </div>
            <Button onClick={() => handleOpenModal('numberStoreHouse')} className="p-1.5 hover:bg-[#FAFAFA] rounded-lg" styleButton='primary'>
              <PencilEditIcon className="md:size-4 size-5 fill-secondary/80" />
            </Button>
          </div>
        </div>
      </FormSection>

      <div className='flex justify-end mt-5 md:px-0 px-4'>
        <Button onClick={handleSubmit} disabled={!formData.name.trim()} name='Guardar' className="md:px-2 disabled:shadow-none disabled:cursor-default disabled:bg-[#c8c8c8] disabled:text-white px-4 md:py-1 md:text-2xs text-base py-2" styleButton='secondary' />
      </div>

      {isShowModal.name &&
        <Modal
          name='Agregar nombre de bodega'
          classNameModal='px-4 py-3'
          onClickSave={() => handleSave('name')}
          onClose={() => setIsShowModal(prev => ({ ...prev, name: false }))}
        >
          <FieldInput
            name='Nombre de la bodega'
            id='name'
            value={formDataDraft.name}
            onChange={(e) => setFormDataDraft(prev => ({ ...prev, name: e.target.value }))}
            className='mb-3'
          />
        </Modal>
      }

      {isShowModal.numberStoreHouse &&
        <Modal
          name='Agregar número de bodega'
          classNameModal='px-4 py-3'
          onClickSave={() => handleSave('numberStoreHouse')}
          onClose={() => setIsShowModal(prev => ({ ...prev, numberStoreHouse: false }))}
        >
          <FieldInput
            name='Número de la bodega'
            id='numberStoreHouse'
            value={formDataDraft.numberStoreHouse}
            onChange={(e) => setFormDataDraft(prev => ({ ...prev, numberStoreHouse: e.target.value }))}
            className='mb-3'
          />
        </Modal>
      }
    </>
  )
}
