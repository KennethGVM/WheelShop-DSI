import FieldInput from "@/components/form/field-input";
import Line from "@/components/form/line";
import StatusTags from "@/components/status-tags";
import { ArrowRightIcon, CustomersIcon, EmployeeIcon, OrderNotificationIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { Link } from "react-router-dom";

export default function Notification() {
  const notificationOptions = [
    {
      id: 'customer',
      icon: <CustomersIcon className="fill-transparent stroke-[1.5] stroke-secondary/80" />,
      title: 'Notificaciones para clientes',
      description: 'Notifica a los clientes sobre eventos de pedido y cuentas',
      rounded: 'rounded-t-lg',
    },
    {
      id: 'employee',
      icon: <EmployeeIcon className="fill-secondary/80 size-5 stroke-none" />,
      title: 'Notificaciones para empleados',
      description: 'Notifica a los clientes sobre nuevos eventos de pedidos',
    },
    {
      id: 'order',
      icon: <OrderNotificationIcon className="fill-secondary/80 size-5 stroke-none" />,
      title: 'Notificaciones de ventas o a domicilios',
      description: 'Notifica a los clientes sobre nuevos eventos de pedidos',
      rounded: 'rounded-b-lg',
    },
  ];


  return (
    <>
      <h3 className="text-secondary font-semibold text-lg">Notificaciones</h3>
      <FormSection name="Correo electrónico del remitente" className="py-4" classNameLabel="text-2xs mb-1">
        <>
          <p className="text-secondary/80 text-2xs mt-1 font-medium">El correo electrónico que tu empresa usa para enviar correos a tus clientes</p>

          <FieldInput
            value="jose@gmail.com"
            className="mb-0 mt-3"
            prependChild={<StatusTags className="font-medium w-20 text-center text-xs px-1.5 py-0.5 rounded-lg" status text="Verificado" textColor="text-[#616161]" color="bg-[#F0F0F0]" />}
          />
          <p className="font-medium text-secondary/80 text-xs mt-1.5">Verifica que sea una dirección valida y que tengas acceso a ella.</p>
        </>
      </FormSection>

      <FormSection>
        <div className="border border-gray-300 rounded-lg">
          {notificationOptions.map(({ id, description, icon, title, rounded }, index) => (
            <Link to={`/settings/notifications/${id}`} key={id}>
              <div
                className={`flex items-center justify-between hover:bg-[#F7F7F7] cursor-pointer px-3 ${rounded ?? ''
                  }`}
              >
                <div className="flex items-center space-x-4 py-2.5">
                  {icon}
                  <div>
                    <span className="font-medium text-secondary text-2xs">{title}</span>
                    <p className="text-2xs font-medium text-secondary/80">{description}</p>
                  </div>
                </div>


                <ArrowRightIcon className="size-4 fill-secondary/80 stroke-none" />
              </div>

              {index < notificationOptions.length - 1 && <Line />}
            </Link>
          ))}
        </div>
      </FormSection >
    </>

  )
}
