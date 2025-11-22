import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AngleLeftIcon,
  ArrowRightIcon,
  BranchIcon,
  CloseIcon,
  CustomersIcon,
  GeneralIcon,
  SettingsIcon,
  UserPermissions
} from "@/icons/icons";
import { useAuth } from "@/api/auth-provider";
import { useEffect, useState } from "react";
import MenuItem from '@/components/menu-item';
import Container from '@/layout/container';
import Button from '@/components/form/button';
import { useRolePermission } from '@/api/permissions-provider';
import AccessPage from '../access-page';
import { useGeneralInformation } from '@/api/general-provider';

const Settings = () => {
  const { user } = useAuth();
  const { userPermissions } = useRolePermission();
  const { companyName } = useGeneralInformation();
  const navigate = useNavigate();
  const name = user?.email || 'Usuario';
  const imageURL = `https://ui-avatars.com/api/?name=${name}&background=2ce0d4&color=fff&bold=true&&length=2`;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hasSettingsNavigation = queryParams.has('settings-navigation');
  const [isVisible, setIsVisible] = useState(false);

  const menuItems = [
    { name: "General", slug: "general", icon: <GeneralIcon className="fill-[#4a4a4a] stroke-0 md:size-4 size-5" /> },
    { name: "Cuenta", slug: "account", icon: <CustomersIcon className="fill-[#4a4a4a] stroke-0 md:size-4 size-5" /> },
    { name: "Usuarios y permisos", slug: "users", icon: <UserPermissions className="fill-[#4a4a4a] stroke-0 md:size-4 size-5" /> },
    { name: "Bodegas", slug: "store-houses", icon: <BranchIcon className="fill-[#4a4a4a] stroke-0 md:size-4 size-5" /> },
    // { name: "Notificaciones", slug: "notifications", icon: <NotificationIcon className="fill-[#4a4a4a] stroke-0 md:size-4 size-5" /> },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <Container>
      {userPermissions?.name === 'Administrador' || location.pathname.includes('account') ? (
        <>
          <div className={`fixed inset-x-0 bottom-0 top-[60px] bg-black z-30 transition-opacity duration-300 ${isVisible ? "opacity-50" : "opacity-0"}`} />
          <div
            className={`fixed bottom-0 left-0 right-0 z-40 bg-[#f1f1f1] h-[93%] rounded-t-xl border-t border-gray-300 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"} overflow-y-auto`}
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className={`sticky top-0 z-40 bg-[#F1F1F1] items-center justify-between py-2 px-4 flex`}>
              <Link to={`${window.location.pathname}${window.location.search}?settings-navigation`} className='md:hidden flex items-center md:space-x-1 space-x-2'>
                {!hasSettingsNavigation ? (
                  <AngleLeftIcon className='size-5 fill-secondary/80 stroke-none' />
                ) : (
                  <SettingsIcon className='size-[18px] fill-transparent stroke-secondary stroke-[1.5]' />
                )}
                <h2 className='md:text-lg text-[15px] md:font-medium font-[550] md:text-secondary/80 text-secondary'>Configuración</h2>
              </Link>
              <Button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => {
                    const previousPath = localStorage.getItem('previous-path') || '/';
                    navigate(previousPath);
                  }, 300);
                }}
                className="md:absolute md:top-3 md:right-4 z-50 bg-[#e3e3e3] hover:bg-[#d4d4d4] md:p-1.5 p-1 rounded-lg"
              >
                <CloseIcon className='size-5 stroke-secondary/80' />
              </Button>
            </div>

            <div className={`flex md:h-auto h-full items-start md:space-x-6 mx-auto max-w-5xl md:py-7 ${hasSettingsNavigation ? 'py-1' : 'py-3'}`}>
              <aside className={`md:border md:h-auto h-full border-gray-300 rounded-lg md:min-w-[300px] min-w-full md:bg-white shadow-sm ${hasSettingsNavigation ? 'block' : ' md:block hidden'}`}>
                <header className="bg-[#F3F3F3] md:px-2 px-4 rounded-t-lg flex items-center space-x-3 md:py-3">
                  <img src={imageURL} alt="Profile" className="size-8 rounded-lg" />
                  <div>
                    <h2 className="md:text-2xs text-sm font-semibold text-primary">{companyName}</h2>
                    <p className="text-secondary/80 md:text-xs text-sm mt-1 font-medium">Todo en llantas aqui</p>
                  </div>
                </header>
                <nav className="px-2 md:h-auto h-full py-3 md:mt-0 mt-5 md:bg-transparent bg-white">
                  <ul className="md:space-y-0.5 space-y-1.5">
                    {menuItems.map(({ name, slug, icon: Icon }) => {
                      const isAdmin = userPermissions?.name === 'Administrador';
                      const isAccountItem = name === 'Cuenta';
                      const isEnabled = isAdmin || isAccountItem;
                      const isActive = location.pathname.includes(slug);

                      return (
                        <li
                          key={slug}
                          className={`rounded-md ${isEnabled ? '' : 'cursor-not-allowed opacity-50 pointer-events-none'} ${isActive ? 'bg-[#F1F1F1]' : 'hover:bg-[#F1F1F1]'}`}
                        >
                          <Link to={`/settings/${slug}`} className="flex items-center justify-between">
                            <MenuItem text={name} classNameLabel='text-base' className='hover:bg-transparent'>
                              {Icon}
                            </MenuItem>
                            <ArrowRightIcon className='size-5 md:hidden block fill-secondary/80' />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <footer className="px-2 rounded-b-lg py-1.5 border-t border-gray-300">
                  <div className="flex items-center space-x-3 rounded-lg py-0.5 cursor-pointer hover:bg-[#F3F3F3] px-1.5">
                    <img src={imageURL} alt="Profile" className="size-7 rounded-lg" />
                    <div>
                      <h2 className="text-2xs font-semibold text-primary">{userPermissions?.name}</h2>
                      <p className="text-secondary/80 text-xs mt-1 font-medium">{name}</p>
                    </div>
                  </div>
                </footer>
              </aside>

              <main className={`flex-1 max-w-[700px] overflow-x-hidden ${hasSettingsNavigation ? 'hidden' : 'block'}`}>
                <Outlet />
              </main>
            </div>
          </div>
        </>
      ) : (
        <AccessPage />
      )}
    </Container>
  );
};

export default Settings;
