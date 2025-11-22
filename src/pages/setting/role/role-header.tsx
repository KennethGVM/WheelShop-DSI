import Button from '@/components/form/button'
import SubHeader from '@/components/sub-header';
import { useNavigate } from 'react-router-dom'

export default function RoleHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between md:pr-0 pr-4">
      <SubHeader title='Roles' backUrl='/settings/users' />
      <div className="flex items-center space-x-2">
        <Button type='button' onClick={() => navigate('/settings/roles/add')} name="Crear rol" styleButton="secondary" className="md:px-3 md:py-1 p-2.5 md:text-2xs text-base font-medium" />
      </div>
    </header>
  )
}
