import { supabase } from '@/api/supabase-client';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '@/components/form/dropdown';
import FieldInput from '@/components/form/field-input';
import { showToast } from '@/components/toast';
import { MODULES } from '@/constants/user-permissions';
import { InformationCircleIcon, SearchIcon } from '@/icons/icons';
import FormSection from '@/layout/form-section';
import { RolePermissionProps, RoleProps } from '@/types/types';
import { ChangeEvent, useEffect, useState } from 'react';
import AddUserPermissionRole from './add-user-permission-role';

interface AddUserPermissionSummaryProps {
  selectedRole: RoleProps | null
  ADMIN_ROLE_NAME: string
}

export default function AddUserPermissionSummary({ ADMIN_ROLE_NAME, selectedRole }: AddUserPermissionSummaryProps) {
  const [permissions, setPermissions] = useState<RolePermissionProps | null>(null)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [filteredModules, setFilteredModules] = useState(MODULES)

  const toggleModule = (moduleName: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }))
  }

  const handleLoadPermissionByRole = async (roleId: string) => {
    const { data, error } = await supabase.from('rolepermission').select('*').eq('roleId', roleId);
    setPermissions(data?.[0] as RolePermissionProps);

    if (error) {
      showToast(error.message, false);
      return;
    }
  }

  useEffect(() => {
    if (!selectedRole) return;
    handleLoadPermissionByRole(selectedRole.roleId);
  }, [selectedRole])

  const handleFilterModules = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/);

    const filtered = MODULES.map((module) => {
      const matchedSubModules = module.subModules
        ?.map((subModule) => {
          const matchedSubSubModules = subModule.subSubModules?.filter((subSubModule) => {
            const fullText = `${module.moduleName} ${subModule.subModuleName} ${subSubModule.subSubModuleName}`.toLowerCase();
            return searchWords.every(word => fullText.includes(word));
          }) || [];

          const subModuleFullText = `${module.moduleName} ${subModule.subModuleName}`.toLowerCase();
          const subModuleMatches = searchWords.every(word => subModuleFullText.includes(word));

          if (subModuleMatches && matchedSubSubModules.length === 0) {
            return {
              subModuleName: subModule.subModuleName,
              subSubModules: null
            };
          }

          if (matchedSubSubModules.length > 0) {
            return {
              subModuleName: subModule.subModuleName,
              subSubModules: matchedSubSubModules
            };
          }

          return null;
        })
        .filter(Boolean);

      const moduleMatchesOnly = searchWords.every(word => module.moduleName.toLowerCase().includes(word));

      if (matchedSubModules.length > 0 || moduleMatchesOnly) {
        return {
          moduleName: module.moduleName,
          subModules: matchedSubModules.length > 0 ? matchedSubModules : null
        };
      }

      return null;
    }).filter(Boolean) as typeof MODULES;

    setFilteredModules(filtered);
  };

  return (
    <FormSection name='Resumen de permisos' classNameLabel='mb-1'>
      <>
        <p className='font-medium md:text-2xs text-[15px] text-secondary/80'>Una lista agregada de permisos del rol asignado al usuario.</p>
        {selectedRole?.name === ADMIN_ROLE_NAME ? (
          <div className='flex items-start space-x-2 mt-3 bg-[#eaf4ff] w-full rounded-lg px-2 py-2.5'>
            <InformationCircleIcon className='md:min-w-4 md:min-h-4 min-w-5 min-h-5 fill-[#003a5a] stroke-none' />
            <p className='text-[#1d3a73] font-medium md:text-2xs leading-normal text-base'>Este usuario tiene un rol de administrador que otorga permiso para acceder a todos los recursos y funciones de la organización, incluida la gestión de usuarios.</p>
          </div>
        ) : (
          <div className='border border-gray-300 rounded-lg mt-2'>
            <div className='px-1.5 border-b py-2'>
              <Dropdown className='w-full'>
                <DropdownTrigger>
                  <FieldInput
                    placeholder='Buscar'
                    appendChild={<SearchIcon className='md:size-[18px] size-[22px] fill-secondary/90' />}
                    classNameDiv='border-transparent px-2 hover:border-primary rounded-md md:h-7'
                    className='mb-0'
                    onChange={handleFilterModules}
                    classNameInput='md:placeholder:text-2xs placeholder:text-base'
                  />
                </DropdownTrigger>
                <DropdownContent fullWidth align='start' className='rounded-xl' position='bottom'>
                  {filteredModules.map((module) => (
                    <div key={module.moduleName}>
                      {module.subModules && module.subModules.map((subModule) => (
                        <DropdownItem key={subModule.subModuleName}>
                          <div className='flex flex-col space-y-1'>
                            <span className='md:text-2xs text-base text-secondary'>{subModule.subModuleName}</span>
                            <span className='md:text-2xs text-base'>{module.moduleName}</span>
                          </div>
                        </DropdownItem>
                      ))}

                      {module.subModules && module.subModules.map((subModule) => (
                        subModule.subSubModules && subModule.subSubModules.map((subSubModule) => (
                          <DropdownItem key={subSubModule.subSubModuleName}>
                            <div className='flex flex-col space-y-1'>
                              <span className='md:text-2xs text-base text-secondary'>{subSubModule.subSubModuleName}</span>
                              <span className='md:text-2xs text-base'>{module.moduleName}</span>
                            </div>
                          </DropdownItem>
                        ))
                      ))}
                    </div>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
            <AddUserPermissionRole permissions={permissions} openModules={openModules} toggleModule={toggleModule} />
          </div>
        )}
      </>
    </FormSection >
  )
}
