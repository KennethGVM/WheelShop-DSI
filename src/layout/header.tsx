import Button from "@/components/form/button";
import { COLORS } from "@/constants/constants";
import { CheckIcon, MenuIcon, MessageAlertIcon, SearchIcon } from "@/icons/icons";
import { useAuth } from '@/api/auth-provider';
import { Dropdown, DropdownContent, DropdownItem, DropdownSeparator, DropdownTrigger } from "@/components/form/dropdown";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/api/supabase-client';
import { useRolePermission } from "@/api/permissions-provider";
import { useGeneralInformation } from "@/api/general-provider";
import { useEffect, useRef, useState } from "react";
import GlobalSearchModal from "@/components/global-search-modal";

interface HeaderProps {
  text?: string;
  save?: boolean;
  isLoading?: boolean;
  onClickAside?: () => void;
  onClick?: () => void;
  onClickSecondary?: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ isLoading, onClick, isSidebarOpen, onClickSecondary, onClickAside, text, save }: HeaderProps) {
  const { user } = useAuth();
  const { companyName } = useGeneralInformation()
  const { userPermissions } = useRolePermission();
  const [isShowModal, setIsShowModal] = useState(false);
  const name = user?.email || 'Usuario';
  const imageURL = `https://ui-avatars.com/api/?name=${name}&background=${COLORS.redprimary.substring(1)}&color=fff&bold=true&&length=2`;

  const navigate = useNavigate();

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsShowModal(false);
      }
    }

    if (isShowModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShowModal]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsShowModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className='[grid-area:header] flex justify-between items-center bg-primary py-2.5 md:px-6 px-4'>
      <h3 className="text-white text-2xl font-bold">WheelShop</h3>
      <button
        className={`lg:hidden block p-2 rounded-lg ${isSidebarOpen ? 'shadow-dark bg-gradient-dark' : ''}`}
        onClick={onClickAside}
      >
        <MenuIcon className="size-5 stroke-none fill-white" />
      </button>

      <div
        onClick={() => !save && setIsShowModal(true)}
        className="h-full bg-secondary text-[#ebebeb90] lg:w-[40%] w-[70%] rounded-xl flex items-center justify-between px-1.5 border-[0.5px] border-whiting cursor-pointer relative" // Añade "relative"
      >
        {!save ? (
          <>
            <div className="flex items-center space-x-1 px-2">
              <div className="flex items-center w-full">
                <SearchIcon className="md:size-4 size-5 text-[#b5b5b5]" />
              </div>
              <span className="md:text-2xs text-base font-medium text-[#b5b5b5]">Buscar</span>
            </div>

            <div className="px-2 md:flex hidden items-center space-x-1">
              <span className="font-medium bg-[#373737] p-1 rounded-md text-whiting2/80 text-[10px]">CTRL</span>
              <span className="font-medium bg-[#373737] px-2 py-1 rounded-md text-whiting2/80 text-[10px]">K</span>
            </div>
          </>
        ) : (
          <>
            <div className="items-center md:flex hidden space-x-2">
              <MessageAlertIcon className="size-4 text-whiting2" />
              <h2 className="text-sm text-whiting2/80 font-medium">{text}</h2>
            </div>

            <div className="flex items-center space-x-2 md:w-auto w-full [&>button]:text-center">
              <Button
                type="button"
                name={!isLoading ? 'Cancelar' : ''}
                className="bg-[#505050] w-full disabled:bg-[#50505050] disabled:text-whiting2/60 text-white font-medium text-2xs px-3 py-1.5 md:w-auto flex items-center justify-center"
                onClick={onClickSecondary}
                disabled={isLoading}
              />
              <Button
                type="button"
                name={!isLoading ? 'Guardar' : ''}
                className="bg-white w-full disabled:bg-whiting2/70 text-primary font-medium text-2xs px-3 py-1.5 md:w-16 flex items-center justify-center"
                onClick={onClick}
                disabled={isLoading}
              >
                {isLoading && (
                  <div role="status">
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-5 text-transparent animate-spin fill-secondary/50" viewBox="0 0 20 20"><path d="M7.229 1.173a9.25 9.25 0 1 0 11.655 11.412 1.25 1.25 0 1 0-2.4-.698 6.75 6.75 0 1 1-8.506-8.329 1.25 1.25 0 1 0-.75-2.385z" /></svg>
                  </div>
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center">
        <Dropdown>
          <DropdownTrigger>
            <button className="flex rounded-full space-x-4 justify-between items-center lg:px-2 lg:py-1 bg-secondary">
              <img src={imageURL} alt="Profile" className="size-8 rounded-full" />
              <h3 className="font-bold lg:block hidden text-sm text-whiting2 ml-3">{name}</h3>
            </button>
          </DropdownTrigger>
          <DropdownContent align="end" className="w-[350px] space-y-1 rounded-2xl" >
            <DropdownItem className="flex items-center py-2 cursor-pointer bg-whiting2">
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center justify-center size-8  rounded-md bg-teal-500 text-white">
                  <span className="text-sm font-medium">WS</span>
                </div>
                <span className="font-extrabold">{companyName}</span>
                <CheckIcon className="ml-auto size-4" />
              </div>
            </DropdownItem>

            <DropdownSeparator />

            <DropdownItem onClick={() => navigate('/settings/account')} className="py-2 cursor-pointer"><p className="text-sm">Gestionar cuenta</p></DropdownItem>

            {userPermissions?.name === 'Administrador' &&
              <DropdownItem onClick={() => navigate('/settings/general')} className="py-2 cursor-pointer">
                <p className="text-sm">Configuración</p>
              </DropdownItem>
            }

            <DropdownSeparator />

            <div className="px-4 py-2  ">
              <p className="font-medium text-[15px]">{name}</p>
              <p className="text-sm text-gray-500">{userPermissions?.name}</p>
            </div>

            <DropdownItem onClick={handleLogout} className="py-2 cursor-pointer"><p className="text-sm">Cerrar sesión</p></DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
      {isShowModal && (
        <GlobalSearchModal modalRef={modalRef} onClose={() => setIsShowModal(false)} />
      )}
    </header >
  );
}
