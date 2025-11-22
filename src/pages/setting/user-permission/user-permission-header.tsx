import Button from '@/components/form/button'
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import { ThreeDotsIcon } from '@/icons/icons';
import { useNavigate } from 'react-router-dom'

export default function UserPermissionHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between md:px-0 px-4">
      <h3 className="text-secondary font-semibold text-lg">Usuarios y permisos</h3>

      <div className="flex items-center space-x-1">
        <Button onClick={() => navigate('/settings/roles')} name="Gestionar roles" className="px-3 text-base md:block hidden py-1 bg-[#d4d4d4] md:text-2xs font-medium text-secondary" styleButton="simple" />
        <Dropdown>
          <DropdownTrigger>
            <Button styleButton='simple' className="p-3 md:hidden block bg-[#e3e3e3] hover:bg-[#d4d4d4]">
              <ThreeDotsIcon className='size-5 fill-secondary/80 stroke-none' />
            </Button>
          </DropdownTrigger>
          <DropdownContent align='end' className='rounded-xl py-1'>
            <DropdownItem onClick={() => navigate('/settings/roles')} className='text-base mx-1'>Gestionar roles</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <Button type='button' onClick={() => navigate('/settings/users/add')} name="Agregar usuario" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />
      </div>
    </header>
  )
}
