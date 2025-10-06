import { useState } from 'react'
import Modal from './modal'
import RadioButton from './form/radio-button'
import { exportToExcel } from '@/lib/function'

interface ExportDataModalProps {
  allData: unknown[]
  data: unknown[]
  fileName: string
  isOpen: boolean
  onClose: () => void
}

export default function ExportDataModal({ allData, data, fileName, isOpen, onClose }: ExportDataModalProps) {
  const [selectedExport, setSelectedExport] = useState<number>(0);
  const TYPE_EXPORTS = ["Pagina actual", `Todos los ${fileName}`];

  return (
    <>
      {isOpen &&
        <Modal onClickSave={() => exportToExcel(selectedExport === 0 ? data : allData, fileName)} name={`Exportar ${fileName}`} classNameModal='px-4 py-3' onClose={onClose}>
          <>
            <p className='font-medium md:text-2xs text-base text-secondary/80'>Mediante la exportación de datos, se podrá descargar el archivo en formato para un archivo de Excel.</p>

            <div className='mt-4 md:space-y-1 space-y-4'>
              <p className='font-medium md:text-2xs text-base text-secondary/80 md:mb-1 mb-3'>Exportar</p>

              {TYPE_EXPORTS.map((typeExport, index) => (
                <RadioButton checked={index === selectedExport} key={index} name={typeExport} onClick={() => setSelectedExport(index)} />
              ))}
            </div>

            <div className='md:space-y-1 space-y-4 md:mt-4 mt-8'>
              <p className='font-medium md:text-2xs text-base text-secondary/80 mb-1'>Exportar como</p>

              <RadioButton checked name='Excel, Numbers u otros programas de hojas de cálculo' />
            </div>
          </>
        </Modal>
      }
    </>
  )
}
