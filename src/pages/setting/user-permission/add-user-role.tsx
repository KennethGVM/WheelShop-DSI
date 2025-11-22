import { supabase } from '@/api/supabase-client'
import Button from '@/components/form/button'
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from '@/components/form/dropdown'
import FieldInput from '@/components/form/field-input'
import { CloseIcon, EyeIcon, PlusCircleIcon, SearchIcon, ThreeDotsIcon } from '@/icons/icons'
import FormSection from '@/layout/form-section'
import { RoleProps } from '@/types/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

interface AddUserRoleProps {
  ADMIN_ROLE_NAME: string
  selectedRole: RoleProps | null
  setSelectedRole: Dispatch<SetStateAction<RoleProps | null>>
  handleChangeFormUser: (name: 'email' | 'password' | 'roleId', value: string) => void
  isEditing: boolean
}

export default function AddUserRole({ isEditing, selectedRole, ADMIN_ROLE_NAME, setSelectedRole, handleChangeFormUser }: AddUserRoleProps) {
  const [roles, setRoles] = useState<RoleProps[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const handleLoadRoles = async () => {
      const { data } = await supabase.from('role').select('*')
      setRoles(data as RoleProps[])
    }

    handleLoadRoles()
  }, [])

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <FormSection name='Roles' classNameLabel='mb-1'>
      <>
        <p className='font-medium md:text-2xs text-[15px] text-secondary/80'>Asignar roles para otorgar acciones de usuario.</p>

        {!selectedRole ? (
          <Dropdown className='w-full'>
            <DropdownTrigger>
              <div className='px-4 py-3 border border-gray-300 rounded-lg mt-4'>
                <button className='flex items-center space-x-1'>
                  <PlusCircleIcon className='md:size-[18px] size-[22px] stroke-secondary/80' />
                  <span className='text-secondary/80 md:text-2xs text-[15px] font-[550]'>Asignar</span>
                </button>
              </div>
            </DropdownTrigger>
            <DropdownContent fullWidth align='start' className='pt-0' position='bottom'>
              <div className='p-1 border-b border-[#8a8a8a] rounded-md mb-2'>
                <FieldInput
                  placeholder='Buscar'
                  appendChild={<SearchIcon className='md:size-[18px] size-[22px] fill-[#8a8a8a]' />}
                  classNameDiv='border-transparent hover:bg-[#FAfAfA] rounded-md'
                  className='mb-0'
                  value={searchTerm}
                  classNameInput='md:placeholder:text-2xs placeholder:text-base'
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className='md:max-h-96 max-h-60 overflow-y-auto'>
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <DropdownItem
                      onClick={() => { setSelectedRole(role); handleChangeFormUser('roleId', role.roleId) }}
                      key={index}
                      className='flex items-start flex-col space-y-0.5'
                    >
                      <span className='md:text-2xs text-base font-medium text-primary'>{role.name}</span>
                      <p className='md:text-xs text-sm text-secondary/80 font-medium'>{role.description}</p>
                    </DropdownItem>
                  ))
                ) : (
                  <div className='flex flex-col items-center justify-center space-y-2 py-2'>
                    <SearchIcon className='size-16 text-[#8c9196] stroke-none' />
                    <p className='text-2xs text-secondary/80 font-medium'>Sin resultados</p>
                  </div>
                )}
              </div>

              <DropdownSeparator />
              <div className='pt-1'>
                <DropdownItem className='space-x-1 rounded-lg'>
                  <PlusCircleIcon className='md:size-[18px] size-[22px] stroke-primary' />
                  <span className='md:text-2xs text-[15px] font-medium text-primary'>Crear nuevo rol</span>
                </DropdownItem>
              </div>
            </DropdownContent>
          </Dropdown>
        ) : (
          <div className='border border-gray-300 rounded-lg mt-4 p-2.5'>
            <div className='flex items-center justify-between'>
              <span className='text-secondary/80 font-medium md:text-2xs text-base'>{selectedRole?.name}</span>
              {!isEditing &&
                <Dropdown>
                  <DropdownTrigger>
                    <Button className='p-1 rounded-md hover:bg-[#F2F2F2]'>
                      <ThreeDotsIcon className='md:size-4 size-5 fill-secondary/80' />
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent className='md:[&>div]:mx-1 [&>div]:mx-0 md:py-1 py-0 [&>div]:space-x-2 rounded-xl md:w-auto w-52' align='end'>
                    {selectedRole?.name !== ADMIN_ROLE_NAME &&
                      <DropdownItem className='md:rounded-md rounded-none rounded-t-xl md:py-1.5 py-3'>
                        <EyeIcon className='md:size-4 size-5 fill-secondary/80' />
                        <span className='md:text-2xs text-base'>Ver permisos</span>
                      </DropdownItem>
                    }
                    <DropdownItem onClick={() => { setSelectedRole(null); handleChangeFormUser('roleId', '') }} className='hover:bg-[#fec1c7] text-red-900 md:rounded-md rounded-none rounded-b-xl md:py-1.5 py-3'>
                      <CloseIcon className='md:size-4 size-5 fill-[#8e0b21]' />
                      <span className='md:text-2xs text-base'>Eliminar rol</span>
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              }
            </div>
          </div>
        )}
      </>
    </FormSection>
  )
}
