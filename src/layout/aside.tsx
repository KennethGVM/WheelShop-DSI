import { useState, useEffect, useRef, useMemo, Dispatch, SetStateAction } from "react";
import { useLocation, Link } from "react-router-dom";
import MenuItem from "@/components/menu-item";
import {
  AsideArrowIcon,
  BillingIcon,
  CustomersIcon,
  DiscountIcon,
  HomeIcon,
  OrdersIcon,
  ProductsIcon,
  ReportStadisticsIcon,
  SettingsIcon,
  SupplierIcon,
} from "@/icons/icons";
import { useRolePermission } from "@/api/permissions-provider";
import { getPermissions } from "@/lib/function";

interface Props {
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

function Aside({ isSidebarOpen, setIsSidebarOpen }: Props) {
  const { pathname } = useLocation();
  const { userPermissions } = useRolePermission();
  const permissions = userPermissions?.permissions || null;
  const [activeItem, setActiveItem] = useState<number>(1);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [arrowPosition, setArrowPosition] = useState<{
    parentY: number;
    selectedY: number;
    horizontalWidth: number;
    verticalX: number;
  } | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const subMenuRef = useRef<HTMLDivElement>(null);
  const { innerWidth } = window;

  const toggleExpand = (id: string) => {
    setExpandedItem(id);
  };

  const offset = window.innerWidth < 768 ? 0 : 3;

  const menuItems = useMemo(() => [
    {
      id: 1,
      Icon: <HomeIcon className={`md:size-4 size-5  ${activeItem === 1 ? 'fill-transparent stroke-[1.5]' : 'fill-[#4a4a4a] stroke-[1]'} text-[#4a4a4a]`} />,
      text: "Inicio",
      href: "/",
      disabled: !getPermissions(permissions, "Inicio", "Inicio")?.canAccess,
    },
    {
      id: 2,
      Icon: <OrdersIcon className="text-[#4a4a4a] md:size-4 size-5 " />,
      text: "Ventas",
      disabled: !getPermissions(permissions, "Pedidos", "Ver")?.canAccess,
      href: "/sales",
      subItems: [
        { id: "quotation", text: "Cotizaciones", href: "/quotations", disabled: !getPermissions(permissions, "Cotizaciones", "Ver")?.canAccess },
      ],
    },
    {
      id: 3,
      Icon: <BillingIcon className={`md:size-4 size-5 stroke-none fill-[#4a4a4a]`} />,
      text: "Caja", href: "/cash-box",
      disabled: !getPermissions(permissions, "Caja", "Ver")?.canAccess,
      subItems: [
        { href: '/openings', text: 'Aperturas de caja', id: 'opening', disabled: !getPermissions(permissions, "Caja", "Gestionar apertura de caja")?.canAccess },
        { href: '/archings', text: 'Arqueos', id: 'arching', disabled: !getPermissions(permissions, "Caja", "Arquear caja")?.canAccess },
        { href: '/closings', text: 'Cierres de caja', id: 'closing', disabled: !getPermissions(permissions, "Caja", "Cerrar caja")?.canAccess },
        { href: '/expenses', text: 'Gastos / Comisiones', id: 'expense' }
      ]
    },
    {
      id: 4,
      Icon: <ProductsIcon className={`md:size-4 size-5 ${activeItem === 4 ? 'fill-transparent stroke-[1.5]' : "fill-[#4a4a4a] stroke-0"} text-[#4a4a4a]`} />,
      text: "Productos",
      href: "/products",
      disabled: !getPermissions(permissions, "Productos", "Ver")?.canAccess,
      subItems: [
        { id: "brand", text: "Marcas", href: "/brands" },
        { id: "inventory", text: "Inventario", href: "/inventory", disabled: !getPermissions(permissions, 'Inventario', 'Ver')?.canAccess },
        { id: "purchase-order", text: "Órdenes de compra", href: "/purchases", disabled: !getPermissions(permissions, "Ordenes de compras", "Ver")?.canAccess },
        { id: "transferent", text: "Transferencias", href: "/transfers", disabled: !getPermissions(permissions, "Inventario", "Editar")?.canAccess },
      ],
    },
    {
      id: 5,
      Icon: <CustomersIcon className={`md:size-4 size-5  ${activeItem === 5 ? 'fill-transparent stroke-[1.5]' : 'fill-[#4a4a4a]'} text-[#4a4a4a]`} />,
      text: "Clientes",
      disabled: !getPermissions(permissions, "Clientes", "Ver")?.canAccess,
      href: "/customers",
      subItems: [
        { id: "pending-account", text: "Cuentas pendientes", href: "/pending-accounts", disabled: !getPermissions(permissions, "Pedidos", "Registrar pagos")?.canAccess },
      ],
    },
    {
      id: 6,
      Icon: <SupplierIcon className='md:size-4 size-5 stroke-none fill-[#4a4a4a]' />,
      text: "Proveedores",
      href: "/suppliers",
    },
    {
      id: 7,
      Icon: <ReportStadisticsIcon className={`md:size-4 size-5  ${activeItem === 7 ? 'fill-transparent stroke-[1.5]' : 'fill-[#4a4a4a]'} text-[#4a4a4a]`} />,
      text: "Informes y estadísticas",
      href: "/reports",
      disabled: !getPermissions(permissions, "Informes y estadísticas", "Informes")?.canAccess,
    },
    {
      id: 8,
      Icon: <DiscountIcon className='md:size-4 size-5 stroke-none fill-[#4a4a4a]' />,
      text: "Descuentos",
      href: "/discounts",
      disabled: !getPermissions(permissions, "Descuentos", "Ver")?.canAccess,
    },
  ], [activeItem, permissions]);


  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems) {
        const sub = item.subItems.find((subItem) => subItem.href === pathname);
        if (sub) {
          setSelectedSubItem(sub.id);
          setExpandedItem(`item-${item.id}`);
          setActiveItem(item.id);
        } else if (item.href === pathname) {
          setExpandedItem(`item-${item.id}`);
          setSelectedSubItem(null);
          setActiveItem(item.id);
        }
      } else if (item.href === pathname) {
        setActiveItem(item.id);
        setExpandedItem(null);
        setSelectedSubItem(null);
      }
    });
  }, [pathname]);

  useEffect(() => {
    const updateArrowPosition = () => {
      if (
        selectedRef.current &&
        subMenuRef.current &&
        sidebarRef.current &&
        iconRef.current &&
        expandedItem
      ) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const subMenuRect = subMenuRef.current.getBoundingClientRect();
        const selectedRect = selectedRef.current.getBoundingClientRect();
        const iconRect = iconRef.current.getBoundingClientRect();

        const parentY = subMenuRect.top - sidebarRect.top;
        const selectedY =
          selectedRect.top - sidebarRect.top + selectedRect.height / 2;
        const verticalX =
          iconRect.left - sidebarRect.left + iconRect.width / 2;
        const selectedItemX = selectedRect.left - sidebarRect.left;
        const horizontalWidth = selectedItemX - verticalX + 12;

        setArrowPosition({
          parentY,
          selectedY,
          horizontalWidth,
          verticalX,
        });
      } else {
        setArrowPosition(null);
      }
    };

    const timer = setTimeout(() => {
      updateArrowPosition();
    }, 100);

    window.addEventListener("resize", updateArrowPosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateArrowPosition);
    };
  }, [selectedSubItem, expandedItem, isSidebarOpen]);

  return (
    <>
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-x-0 bottom-0 top-[60px] bg-black bg-opacity-40 z-40 lg:hidden transition-opacity" />
      )}
      <aside
        ref={sidebarRef}
        className={`fixed flex flex-col rounded-tr-xl justify-between bottom-0 z-50 bg-whiting2 lg:top-0 top-[60px] left-0 md:h-full h-auto px-3 py-4 overflow-y-auto transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 lg:relative w-[260px] lg:z-auto`}
      >
        <ul className="md:space-y-0.5 space-y-1.5">
          {menuItems.map(({ disabled, id, text: textMenuItem, href: hrefMenuItem, subItems, Icon }) => (
            <div key={id} className="relative">
              <Link
                to={disabled ? "#" : hrefMenuItem || "#"}
                onClick={(e) => {
                  if (disabled) {
                    e.preventDefault();
                    return;
                  }

                  const isSmallScreen = window.innerWidth < 1024;
                  if (isSmallScreen && subItems) {
                    e.preventDefault();
                  }

                  setActiveItem(id);

                  if (subItems) {
                    toggleExpand(`item-${id}`);
                  } else {
                    setExpandedItem(null);
                  }
                }}
                className={`w-full block ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
                aria-disabled={disabled}
              >
                <MenuItem
                  text={textMenuItem}
                  active={innerWidth > 1024 && pathname === hrefMenuItem}
                  className={innerWidth > 1024 && pathname === hrefMenuItem ? "bg-white" : ""}
                >
                  <div ref={iconRef}>{Icon}</div>
                </MenuItem>
              </Link>

              {subItems && expandedItem === `item-${id}` && (
                <div ref={subMenuRef} className="flex flex-col">
                  {!disabled && innerWidth < 1024 && (
                    <Link
                      to={hrefMenuItem}
                      className={`group ${pathname !== hrefMenuItem ? "hover:bg-[#F1F1F1]" : ""} rounded-md flex items-center py-0.5 md:pl-2 pl-3 space-x-1.5 ${pathname === hrefMenuItem ? "bg-[#FAFAFA]" : ""}`}
                    >
                      <AsideArrowIcon
                        className={`${pathname === hrefMenuItem ? "visible" : "invisible"} group-hover:visible`}
                      />
                      <span className={`${pathname !== hrefMenuItem ? "text-secondary/80 font-medium" : "text-secondary font-semibold"} md:text-2xs text-base`}>
                        {textMenuItem}
                      </span>
                    </Link>
                  )}

                  {subItems.map(({ id: subId, text, href, disabled: subDisabled }) => (
                    <Link
                      key={subId}
                      to={subDisabled ? "#" : href}
                      onClick={(e) => {
                        if (subDisabled) {
                          e.preventDefault();
                          return;
                        }
                        setSelectedSubItem(subId);
                        setIsSidebarOpen(false);
                      }}
                      ref={selectedSubItem === subId ? selectedRef : null} // <- AQUI ESTÁ LA CLAVE
                      className={`group ${pathname !== href ? "hover:bg-[#F1F1F1]" : ""} rounded-md flex items-center py-0.5 md:pl-2 pl-3 space-x-1.5 ${selectedSubItem === subId ? "bg-[#FAFAFA]" : ""} ${subDisabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
                      aria-disabled={subDisabled ? "true" : "false"}
                      tabIndex={subDisabled ? -1 : 0}
                    >
                      <AsideArrowIcon
                        className={`${selectedSubItem === subId ? "visible" : "invisible"} group-hover:visible`}
                      />
                      <span className={`${pathname !== href ? "text-secondary/80 font-[550]" : "text-secondary font-semibold"} md:text-2xs text-[15px]`}>
                        {text}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

        </ul>

        {arrowPosition && expandedItem && selectedSubItem && (
          <div
            className="connector-container"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${arrowPosition.verticalX - offset}px`,
                top: arrowPosition.parentY,
                height: arrowPosition.selectedY - arrowPosition.parentY - 5,
                width: "2px",
                backgroundColor: "#bcbcbc",
                borderRadius: "20px",
              }}
            />
          </div>
        )}

        {userPermissions?.name === 'Administrador' &&
          <Link to="/settings/general" onClick={() => localStorage.setItem('previous-path', location.pathname)} className="mt-auto">
            <MenuItem text="Configuraciones">
              <SettingsIcon className="stroke-none fill-[#4a4a4a]" />
            </MenuItem>
          </Link>
        }
      </aside >
    </>
  );
}

export default Aside;
