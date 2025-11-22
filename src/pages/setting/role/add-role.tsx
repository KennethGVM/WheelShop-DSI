import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/components/form/dropdown";
import FieldInput from "@/components/form/field-input";
import SubHeader from "@/components/sub-header";
import { MODULES } from "@/constants/user-permissions";
import { SearchIcon } from "@/icons/icons";
import FormSection from "@/layout/form-section";
import { ChangeEvent, useEffect, useState } from "react";
import AddRolePermission from "./add-role-permission";
import Button from "@/components/form/button";
import { showToast } from "@/components/toast";
import { supabase } from "@/api/supabase-client";
import { useParams } from "react-router-dom";

export default function AddRole() {
  const { roleId } = useParams();
  const [filteredModules, setFilteredModules] = useState(MODULES);
  const [permissions, setPermissions] = useState(buildInitialPermissions());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  function buildInitialPermissions() {
    return MODULES.map(module => ({
      moduleName: module.moduleName,
      canAccess: false,
      subModules: module.subModules.map(sub => ({
        subModuleName: sub.subModuleName,
        canAccess: false,
        subSubModules: sub.subSubModules?.map(subSub => ({
          subSubModuleName: subSub.subSubModuleName,
          canAccess: false
        })) ?? null
      }))
    }));
  }

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

  useEffect(() => {
    const handleLoadRoleById = async () => {
      const { data: permissions } = await supabase.from('rolepermission').select('*').eq('roleId', roleId).single();
      const { data: role } = await supabase.from('role').select('*').eq('roleId', roleId).single();
      const roleData = permissions.permissions;

      setPermissions(roleData);
      setFormData({
        name: role.name,
        description: role.description,
      });
    }

    if (roleId) handleLoadRoleById();
  }, [roleId]);

  const handleSubmit = async () => {
    const { error } = await supabase
      .rpc('create_role', {
        p_description: formData.description,
        p_name: formData.name,
        p_permissions: permissions,
        p_state: true
      })

    if (error) {
      showToast(error.message, false)
      return;
    }

    showToast('Rol creado', true)
  };

  return (
    <>
      <SubHeader title={roleId ? formData.name : 'Crear rol'} backUrl="/settings/roles" />

      <FormSection>
        <>
          <FieldInput readOnly={roleId ? true : false} name="Nombre" onChange={(e) => setFormData({ ...formData, name: e.target.value })} value={formData.name} />
          <FieldInput readOnly={roleId ? true : false} name="Descripción" className="mb-0" onChange={(e) => setFormData({ ...formData, description: e.target.value })} value={formData.description} />
        </>
      </FormSection>

      <FormSection name="Permisos" classNameLabel="mb-0">
        <>
          <p className="text-2xs font-medium text-secondary/80">
            La categoría del rol determina los permisos disponibles.
          </p>

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
                      {module.subModules?.map((subModule) => (
                        <DropdownItem key={subModule.subModuleName}>
                          <div className='flex flex-col space-y-1'>
                            <span className='md:text-2xs text-base text-secondary'>{subModule.subModuleName}</span>
                            <span className='md:text-2xs text-base'>{module.moduleName}</span>
                          </div>
                        </DropdownItem>
                      ))}

                      {module.subModules?.flatMap((subModule) =>
                        subModule.subSubModules?.map((subSubModule) => (
                          <DropdownItem key={subSubModule.subSubModuleName}>
                            <div className='flex flex-col space-y-1'>
                              <span className='md:text-2xs text-base text-secondary'>{subSubModule.subSubModuleName}</span>
                              <span className='md:text-2xs text-base'>{module.moduleName}</span>
                            </div>
                          </DropdownItem>
                        )) ?? []
                      )}
                    </div>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>

            <AddRolePermission filteredModules={filteredModules} permissions={permissions} setPermissions={setPermissions} />
          </div>
        </>
      </FormSection>

      <div className="flex justify-end mt-5 md:px-0 px-4">
        <Button className="px-2 py-1 md:text-2xs text-base" name="Guardar" styleButton="secondary" onClick={handleSubmit} />
      </div>
    </>
  );
}
