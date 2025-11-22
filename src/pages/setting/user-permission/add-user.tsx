import FieldInput from '@/components/form/field-input'
import RadioButton from '@/components/form/radio-button'
import SubHeader from '@/components/sub-header'
import { InformationCircleIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { LoginHistoryProps, RoleProps, UserPermissionProps } from '@/types/types'
import { useEffect, useState } from 'react'
import AddUserRole from '@/pages/setting/user-permission/add-user-role'
import AddUserPermissionSummary from './add-user-permission-summary'
import Button from '@/components/form/button'
import { supabase } from '@/api/supabase-client'
import { showToast } from '@/components/toast'
import { useParams } from 'react-router-dom'
import ToolTip from '@/components/tool-tip'

export default function AddUser() {
  const ADMIN_ROLE_NAME = 'Administrador'
  const { userId } = useParams()
  const [isAuthenticationTwoSteps, setIsAuthenticationTwoSteps] = useState<boolean>(true)
  const [loginHistory, setLoginHistory] = useState<LoginHistoryProps[]>([])
  const [selectedRole, setSelectedRole] = useState<RoleProps | null>(null)
  const [formUser, setFormUser] = useState({
    email: '',
    password: '',
    roleId: '',
    roleName: '',
    lastSignIn: new Date(),
  })
  const imageURL = `https://ui-avatars.com/api/?name=${formUser.email}&background=2ce0d4&color=fff&bold=true&&length=2`;

  const handleChangeFormUser = (name: keyof typeof formUser, value: string) => {
    setFormUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: formUser.email,
      password: formUser.password,
    })

    if (error) {
      showToast(error.message, false)
    } else {
      const userId = data?.user?.id
      handleSaveUser(userId ?? '')
    }
  }

  useEffect(() => {
    const handleLoadUserById = async () => {
      const { data, error } = await supabase.from('getusers').select('*').eq('userId', userId).single()
      const userData = data as UserPermissionProps

      if (error) {
        showToast(error.message, false)
        return;
      }

      setFormUser({
        lastSignIn: userData.lastSignInAt,
        email: userData.email,
        password: '',
        roleId: userData.roleId,
        roleName: userData.roleName,
      })

      setSelectedRole({
        roleId: userData.roleId,
        name: userData.roleName,
        createdAt: userData.createdAt,
        description: '',
        state: true
      })
    }
    const handleLoadLoginHistory = async () => {
      const { data, error } = await supabase.from('loginHistory').select('*').eq('userId', userId).order('loginDate', { ascending: false }).limit(15)
      if (error) {
        showToast(error.message, false)
        return;
      }

      setLoginHistory(data as LoginHistoryProps[])
    }

    if (userId) handleLoadUserById();
    if (userId) handleLoadLoginHistory();
  }, [userId])

  const handleSaveUser = async (id: string) => {
    const { error } = await supabase.from('user').insert([
      {
        userId: id,
        roleId: formUser.roleId,
      }
    ])

    if (error) {
      showToast(error.message, false)
    } else {
      showToast('Usuario creado', true)
      setFormUser({
        ...formUser,
        email: '',
        password: '',
        roleId: '',
      })
    }
  }

  const handleUpdateUser = async () => {
    const { error } = await supabase.from('user').update([
      {
        roleId: formUser.roleId,
      }
    ]).eq('userId', userId)

    if (error) {
      showToast(error.message, false)
    } else {
      showToast('Usuario actualizado', true)
    }
  }

  return (
    <>
      <SubHeader title='Agregar usuario' backUrl='/settings/users' />
      {!userId ? (
        <FormSection className='mt-5 flex items-center space-x-3 [&>div]:w-full [&>div]:mb-0'>
          <>
            <FieldInput
              name='Correo electrónico'
              id='email'
              classNameDiv='md:h-9'
              value={formUser.email}
              onChange={(e) => handleChangeFormUser('email', e.target.value)}
            />

            <FieldInput
              name='Contraseña'
              id='password'
              classNameDiv='md:h-9'
              value={formUser.password}
              onChange={(e) => handleChangeFormUser('password', e.target.value)}
            />
          </>
        </FormSection>
      ) : (
        <FormSection name={formUser.roleName} className="rounded-xl">
          <>
            <div className="flex items-center space-x-2">
              <img src={imageURL} alt="Profile" className="md:size-8 size-9 rounded-lg" />
              <div>
                <h2 className="md:text-2xs text-base font-semibold text-primary">{formUser.email}</h2>
                <p className="text-secondary/80 md:text-xs text-sm mt-0.5 font-medium">
                  El último inicio de sesión fue {new Date(formUser.lastSignIn).toLocaleString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' })};</p>
              </div>
            </div>
          </>
        </FormSection>
      )}

      <AddUserRole isEditing={userId ? true : false} handleChangeFormUser={handleChangeFormUser} ADMIN_ROLE_NAME={ADMIN_ROLE_NAME} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />

      {selectedRole &&
        <AddUserPermissionSummary ADMIN_ROLE_NAME={ADMIN_ROLE_NAME} selectedRole={selectedRole} />
      }

      {loginHistory.length > 0 &&
        <FormSection name='Acceso reciente a la empresa' className='pb-0' classNameLabel='mb-0'>
          <>
            <p className='text-secondary/80 md:text-2xs text-base font-medium'>Si no reconoces una ubicación, dirección IP o ISP, podría significar que tu tienda se ha visto comprometida.</p>
            <div className={`relative overflow-x-auto px-px md:mt-0 mt-4`}>
              <div className='md:min-w-0 min-w-[1200px]'>
                <table className="w-full text-left">
                  <thead className="text-secondary/80 px-4 [&>tr>th]:font-[550] md:text-2xs text-base border-b border-gray-300">
                    <tr>
                      <th className="px-2 py-3">Fecha</th>
                      <th className="px-2 py-3">Dirección IP</th>
                      <th className="px-2 py-3">ISP</th>
                      <th className="px-2 py-3">Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.length > 0 &&
                      loginHistory.map((login, index) => (
                        <tr key={index} className={`bg-white ${index !== loginHistory.length - 1 ? 'border-b' : ''} text-secondary/80 md:text-2xs text-base font-medium border-gray-300`}>
                          <td className="px-2 py-4">{new Date(login.loginDate).toLocaleDateString()}</td>
                          <td className="px-2 py-4">{login.ip}</td>
                          <td className="px-2 py-4">{login.isp}</td>
                          <td className="px-2 py-4">{login.location}</td>
                          <td>
                            <div data-tooltip-id={`loginHistory-${index}`}>
                              <InformationCircleIcon className='md:min-w-4 md:min-h-4 min-w-5 min-h-5  cursor-pointer fill-secondary/80 stroke-none' />
                            </div>
                            <ToolTip id={`loginHistory-${index}`} title={`${login.browser} en ${login.os}`} />
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
        </FormSection>
      }

      {!userId &&
        <div className="flex justify-end mt-5 md:mb-0 mb-4 md:px-0 px-4">
          <Button disabled={selectedRole ? false : true} onClick={!userId ? handleSubmit : handleUpdateUser} name="Guardar" className="md:px-2 disabled:shadow-none disabled:cursor-default disabled:bg-[#c8c8c8] disabled:text-white px-4 md:py-1 md:text-2xs text-base py-2" styleButton="secondary" />
        </div>
      }
    </>
  )
}
