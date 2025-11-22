import { useState, useRef } from 'react'
import Button from '@/components/form/button'
import Line from '@/components/form/line'
import SubHeader from '@/components/sub-header'
import { ArrowDownIcon, ArrowRightIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Procesamiento de pedidos',
    items: [
      { title: 'Confirmación de pedidos', description: 'Se envía cuando un cliente realiza un pedido.' },
      { title: 'Cancelación de pedidos', description: 'Se envía si una venta es cancelada.' },
      { title: 'Factura del pedido', description: 'Se envía cuando se realiza un pedido.' },
      { title: 'Pedido pendiente de pago', description: 'Se envía cuando el pedido tiene un saldo pendiente.' },
    ],
  },
  {
    title: 'Pago y recordatorios',
    items: [
      { title: 'Pago pendiente efectuado', description: 'Se envía después de que el pago pendiente de un cliente se haya procesado exitosamente.' },
      { title: 'Recordatorio de pago', description: 'Se envía en o después de la fecha de vencimiento de un pedido sin pagar.' },
    ],
  }
]

export default function NotificationCustomer() {
  const [openSections, setOpenSections] = useState<number[]>([])
  const contentRefs = useRef<Array<HTMLDivElement | null>>([])

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <>
      <SubHeader backUrl='/settings/notifications' title='Notificaciones de clientes'>
        <Button
          name='Personalizar plantillas de correo electrónico'
          styleButton="simple"
          className="px-3 bg-[#e3e3e3] py-1 text-2xs text-secondary/90 font-[550]"
        />
      </SubHeader>

      <FormSection className='py-3 px-3'>
        <div className='space-y-3'>
          {sections.map((section, index) => {
            const isOpen = openSections.includes(index)

            return (
              <div key={index} className='border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  onClick={() => toggleSection(index)}
                  className='flex items-center justify-between px-2.5 py-2.5 bg-[#f7f7f7] hover:bg-[#F1F1F1] rounded-t-lg w-full'
                >
                  <span className='text-secondary text-2xs font-semibold'>{section.title}</span>
                  <ArrowDownIcon
                    className={`size-4 fill-secondary/80 stroke-none transform transition-transform duration-300 ${isOpen ? '-rotate-180' : ''
                      }`}
                  />
                </button>


                <div
                  ref={(el) => {
                    contentRefs.current[index] = el
                  }}
                  className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'
                    }`}
                >
                  <div className='bg-white'>
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <Link
                          to="#"
                          className={`flex items-center justify-between py-2 px-2.5 hover:bg-[#F7F7F7] ${itemIndex === section.items.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                        >
                          <div>
                            <span className="font-medium text-secondary text-2xs">{item.title}</span>
                            <p className="text-2xs font-medium text-secondary/80">{item.description}</p>
                          </div>
                          <ArrowRightIcon className='size-4 fill-secondary/80 stroke-none' />
                        </Link>
                        {itemIndex < section.items.length - 1 && <Line />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </FormSection>
    </>
  )
}
