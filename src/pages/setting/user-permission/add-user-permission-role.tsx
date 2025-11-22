import { CheckIcon, CancelIcon, MinusIcon, ArrowDownIcon } from '@/icons/icons';
import { RolePermissionProps } from '@/types/types';

interface AddUserPermissionRoleProps {
  permissions: RolePermissionProps | null;
  openModules: Record<string, boolean>
  toggleModule: (moduleName: string) => void
}

export default function AddUserPermissionRole({ permissions, openModules, toggleModule }: AddUserPermissionRoleProps) {
  if (!permissions?.permissions) return null;

  const getPermissionIcon = (granted: number, total: number) => {
    if (granted === total) {
      return <CheckIcon className='md:size-4 size-5 stroke-secondary/90' />;
    } else if (granted === 0) {
      return <CancelIcon className='md:size-4 size-5 fill-secondary/90 stroke-none' />;
    } else {
      return <MinusIcon className='md:size-4 size-5 fill-secondary/90 stroke-none' />;
    }
  };

  return (
    <>
      {permissions.permissions.map(({ moduleName, subModules }, index) => {
        const isOpen = openModules[moduleName];

        const allPermissions = subModules?.flatMap(subModule => [
          subModule.canAccess,
          ...(subModule.subSubModules?.map(subSub => subSub.canAccess) || [])
        ]) || [];

        const totalPermissions = allPermissions.length;
        const grantedPermissions = allPermissions.filter(Boolean).length;

        const icon = getPermissionIcon(grantedPermissions, totalPermissions);

        const activeSubModulesCount = subModules?.filter(sub => sub.canAccess).length ?? 0;
        const activeSubSubModulesCount = subModules?.reduce((acc, sub) => {
          return acc + (sub.subSubModules?.filter(subSub => subSub.canAccess).length ?? 0);
        }, 0) ?? 0;

        const totalActive = activeSubModulesCount + activeSubSubModulesCount;
        const totalPossible = subModules
          ? subModules.reduce((acc, sub) => acc + (sub.subSubModules?.length || 0), 0) + subModules.length
          : 0;

        return (
          <div key={moduleName}>
            <button
              onClick={() => toggleModule(moduleName)}
              className={`${index === permissions.permissions.length - 1 ? isOpen ? 'border-b' : 'rounded-b-lg' : 'border-b'} bg-[#F7F7F7] w-full border-gray-300 flex items-center justify-between px-2 md:py-2.5 py-3`}
            >
              <div className='flex items-center space-x-2'>
                {icon}
                <span className='text-secondary font-[550] md:text-2xs text-base'>{moduleName}</span>
              </div>

              <div className='flex items-center space-x-3'>
                <span className='text-secondary/80 md:text-2xs text-base font-medium'>
                  {totalActive}/{totalPossible}
                </span>

                <ArrowDownIcon
                  className={`md:size-4 size-5 fill-secondary/80 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
              {subModules?.map(({ canAccess, subModuleName, subSubModules }, i) => (
                <div key={`${subModuleName}-${i}`}>
                  <div className='pl-8 py-1.5 flex items-center space-x-2'>
                    {canAccess
                      ? <CheckIcon className='md:size-4 size-5 stroke-secondary/90' />
                      : <CancelIcon className='md:size-4 size-5 fill-secondary/90 stroke-none' />}
                    <span className='text-secondary/80 font-[550] md:text-2xs text-base'>{subModuleName}</span>
                  </div>

                  {subSubModules?.map(({ canAccess, subSubModuleName }, j) => (
                    <div key={`${subSubModuleName}-${j}`} className='pl-14 py-1.5 flex items-center space-x-2'>
                      {canAccess
                        ? <CheckIcon className='md:size-4 size-5 stroke-secondary/90' />
                        : <CancelIcon className='md:size-4 size-5 fill-secondary/90 stroke-none' />}
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
  );
}
