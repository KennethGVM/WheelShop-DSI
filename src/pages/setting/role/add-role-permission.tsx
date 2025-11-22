import CheckBox from '@/components/form/check-box';
import { MODULES } from '@/constants/user-permissions';
import { ArrowDownIcon } from '@/icons/icons';
import { Dispatch, SetStateAction, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Permissions {
  moduleName: string;
  canAccess: boolean;
  subModules: {
    subModuleName: string;
    canAccess: boolean;
    subSubModules: {
      subSubModuleName: string;
      canAccess: boolean;
    }[];
  }[];
}

interface AddRolePermissionProps {
  filteredModules: typeof MODULES;
  permissions: Permissions[];
  setPermissions: Dispatch<SetStateAction<Permissions[]>>;
}

export default function AddRolePermission({ permissions, setPermissions, filteredModules }: AddRolePermissionProps) {
  const { roleId } = useParams();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const toggleModuleAccess = (moduleName: string) => {
    setPermissions(prev =>
      prev.map(module =>
        module.moduleName === moduleName
          ? {
            ...module,
            canAccess: !module.canAccess,
            subModules: module.subModules.map(sub => ({
              ...sub,
              canAccess: !module.canAccess ? true : false,
              subSubModules: sub.subSubModules?.map(subSub => ({
                ...subSub,
                canAccess: !module.canAccess ? true : false
              })) ?? null
            }))
          }
          : module
      )
    );
  };

  const areAllSubSubModulesActive = (subModule: typeof permissions[0]['subModules'][0]) => {
    if (!subModule.subSubModules) return true;
    return subModule.subSubModules.every(ss => ss.canAccess);
  };

  const areAllSubModulesActive = (module: typeof permissions[0]) => {
    return module.subModules.every(sub => sub.canAccess && areAllSubSubModulesActive(sub));
  };

  const toggleSubModuleAccess = (moduleName: string, subModuleName: string) => {
    setPermissions(prev =>
      prev.map(module => {
        if (module.moduleName !== moduleName) return module;

        const isActivating = !module.subModules.find(s => s.subModuleName === subModuleName)?.canAccess;

        let newSubModules = module.subModules.map(sub => {
          if (sub.subModuleName === subModuleName) {
            return {
              ...sub,
              canAccess: isActivating,
            };
          }
          return sub;
        });

        if (isActivating && subModuleName !== "Ver") {
          newSubModules = newSubModules.map(sub => {
            if (sub.subModuleName === "Ver") {
              return {
                ...sub,
                canAccess: true,
              };
            }
            return sub;
          });
        }

        const moduleCanAccess = areAllSubModulesActive({ ...module, subModules: newSubModules });

        return {
          ...module,
          canAccess: moduleCanAccess,
          subModules: newSubModules,
        };
      })
    );
  };

  const toggleSubSubModuleAccess = (
    moduleName: string,
    subModuleName: string,
    subSubModuleName: string
  ) => {
    setPermissions(prev =>
      prev.map(module => {
        if (module.moduleName !== moduleName) return module;

        const newSubModules = module.subModules.map(subModule => {
          if (subModule.subModuleName !== subModuleName) return subModule;

          const newSubSubModules = subModule.subSubModules?.map(subSub => {
            if (subSub.subSubModuleName === subSubModuleName) {
              return {
                ...subSub,
                canAccess: !subSub.canAccess,
              };
            }
            return subSub;
          }) ?? null;

          const subModuleCanAccess = newSubSubModules ? newSubSubModules.every(ss => ss.canAccess) : false;

          return {
            ...subModule,
            canAccess: subModuleCanAccess,
            subSubModules: newSubSubModules,
          };
        });

        const isActivatingSubSub = newSubModules
          .flatMap(sm => sm.subSubModules ?? [])
          .some(ss => ss.subSubModuleName === subSubModuleName && ss.canAccess);

        let updatedSubModules = [...newSubModules];

        if (isActivatingSubSub && subSubModuleName !== "Ver") {
          updatedSubModules = updatedSubModules.map(sub => {
            if (sub.subModuleName === "Ver") {
              return { ...sub, canAccess: true };
            }
            return sub;
          });
        }

        const moduleCanAccess = areAllSubModulesActive({ ...module, subModules: updatedSubModules });

        return {
          ...module,
          canAccess: moduleCanAccess,
          subModules: updatedSubModules,
        };
      })
    );
  };

  const toggleModule = (moduleName: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };
  const getModulePermission = (moduleName: string) => {
    return permissions.find(m => m.moduleName === moduleName)?.canAccess ?? false;
  };

  const getSubModulePermission = (moduleName: string, subModuleName: string) => {
    return permissions.find(m => m.moduleName === moduleName)?.subModules.find(s => s.subModuleName === subModuleName)?.canAccess ?? false;
  };

  const getSubSubModulePermission = (moduleName: string, subModuleName: string, subSubModuleName: string) => {
    return permissions.find(m => m.moduleName === moduleName)
      ?.subModules.find(s => s.subModuleName === subModuleName)
      ?.subSubModules?.find(ss => ss.subSubModuleName === subSubModuleName)?.canAccess ?? false;
  };

  const countActivePermissions = (moduleName: string) => {
    const module = permissions.find(m => m.moduleName === moduleName);
    if (!module) return { active: 0, total: 0 };

    let activeCount = 0;
    let totalCount = 0;

    module.subModules.forEach(sub => {
      if (sub.canAccess) activeCount++;
      totalCount++;

      if (sub.subSubModules) {
        sub.subSubModules.forEach(subSub => {
          if (subSub.canAccess) activeCount++;
          totalCount++;
        });
      }
    });

    return { active: activeCount, total: totalCount };
  };

  return (
    <>
      {filteredModules.map(({ moduleName, subModules }, index) => {
        const isOpen = openModules[moduleName];
        const { active, total } = countActivePermissions(moduleName);

        return (
          <div key={moduleName}>
            <button
              onClick={() => toggleModule(moduleName)}
              className={`${index === filteredModules.length - 1 ? isOpen ? 'border-b' : 'rounded-b-lg' : 'border-b'} bg-[#F7F7F7] w-full border-gray-300 flex items-center justify-between px-2 md:py-2.5 py-3`}
            >
              <div className='flex items-center space-x-2'>
                <CheckBox
                  disabled={roleId ? true : false}
                  initialValue={getModulePermission(moduleName)}
                  onChange={() => toggleModuleAccess(moduleName)}
                />
                <span className='text-secondary font-[550] md:text-2xs text-base'>{moduleName}</span>
              </div>

              <div className='flex items-center space-x-3'>
                <span className='text-secondary/80 md:text-2xs text-base font-medium'>
                  {active}/{total}
                </span>

                <ArrowDownIcon
                  className={`md:size-4 size-5 fill-secondary/80 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
              {subModules?.map(({ subModuleName, subSubModules }, i) => (
                <div key={`${subModuleName}-${i}`}>
                  <div className='pl-8 py-1.5 flex items-center space-x-2'>
                    <CheckBox
                      initialValue={getSubModulePermission(moduleName, subModuleName)}
                      disabled={roleId ? true : false}
                      onChange={() => toggleSubModuleAccess(moduleName, subModuleName)}
                    />
                    <span className='text-secondary/80 font-[550] md:text-2xs text-base'>{subModuleName}</span>
                  </div>

                  {subSubModules?.map(({ subSubModuleName }, j) => (
                    <div key={`${subSubModuleName}-${j}`} className='pl-14 py-1.5 flex items-center space-x-2'>
                      <CheckBox
                        disabled={roleId ? true : false}
                        initialValue={getSubSubModulePermission(moduleName, subModuleName, subSubModuleName)}
                        onChange={() => toggleSubSubModuleAccess(moduleName, subModuleName, subSubModuleName)}
                      />
                      <span className='text-secondary/80 font-[550] md:text-2xs text-base'>{subSubModuleName}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  )
}
